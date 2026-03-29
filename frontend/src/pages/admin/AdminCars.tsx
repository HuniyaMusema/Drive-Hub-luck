import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCars, useCreateCar, useUpdateCar, useDeleteCar, useUploadImage, Car } from "@/hooks/useCars";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Upload, Image as ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminCars() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  const { data: carsData = [] } = useCars();
  const createMutation = useCreateCar();
  const updateMutation = useUpdateCar();
  const deleteMutation = useDeleteCar();
  const uploadMutation = useUploadImage();
  const { toast } = useToast();
  
  const cars = carsData.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    make: "", model: "", year: "", price: "", type: "sale", status: "available", 
    description: "", image: "", location: "",
    mileage: "", fuel: "Gasoline", transmission: "Automatic", seats: "5"
  });

  const openAdd = () => {
    setEditingCar(null);
    setFormData({ 
      make: "", model: "", year: "", price: "", type: "sale", status: "available", 
      description: "", image: "", location: "",
      mileage: "", fuel: "Gasoline", transmission: "Automatic", seats: "5"
    });
    setImageFile(null);
    setImagePreview("");
    setIsOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    const [make, ...modelParts] = car.name.split(' ');
    setFormData({
      make: make || "",
      model: modelParts.join(' ') || "",
      year: car.year.toString(),
      price: car.price.toLocaleString(),
      type: car.type === 'rental' ? 'rent' : 'sale',
      status: car.available ? 'available' : 'unavailable',
      description: car.description,
      image: car.image,
      location: "",
      mileage: car.mileage,
      fuel: car.fuel,
      transmission: car.transmission,
      seats: car.seats.toString()
    });
    setImageFile(null);
    setImagePreview(car.image);
    setIsOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.image;

    try {
      if (imageFile) {
        const uploadResult = await uploadMutation.mutateAsync(imageFile);
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price.replace(/,/g, "")),
        year: Number(formData.year)
      };

      if (editingCar) {
        await updateMutation.mutateAsync({ id: editingCar.id, data: payload });
        toast({ title: "Car Updated", description: "Vehicle details have been saved." });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Car Added", description: "New vehicle has been added to inventory." });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Car Deleted", description: "Vehicle removed from inventory." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Car Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Add, edit, or remove vehicles from your inventory</p>
        </div>
        <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Vehicle
        </Button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name..." className="pl-10 h-10 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-left">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Vehicle Details</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Type</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Price (Birr)</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground bg-muted/5">
                    <p className="font-bold text-xs uppercase tracking-widest opacity-40">No vehicles in inventory</p>
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="border-b last:border-0 hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-muted">
                          <img 
                            src={car.image} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{car.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{car.brand} · {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        car.type === "sale" ? "bg-primary/5 text-primary border-primary/20" : "bg-purple-500/5 text-purple-600 border-purple-500/20"
                      }`}>
                        {car.type === "sale" ? "Sale" : "Rental"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-primary">{car.priceLabel}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        car.available ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-destructive/5 text-destructive border-destructive/20"
                      }`}>
                        {car.available ? "Available" : "Sold/Rented"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={() => openEdit(car)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-border/60">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Confirm Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <strong>{car.name}</strong> from your inventory? This action is permanent and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(car.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                                Delete Car
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border/60">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingCar ? "Edit Vehicle Details" : "Add New Vehicle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Make</Label>
                <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="e.g. Toyota" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Model</Label>
                <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. Camry" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Addis Ababa" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Year</Label>
                <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2024" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    required 
                    value={formData.price} 
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      const formattedValue = rawValue ? Number(rawValue).toLocaleString() : "";
                      setFormData({...formData, price: formattedValue});
                    }} 
                    placeholder="3,500,000" 
                    className="h-11 rounded-xl font-bold text-primary pr-12" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">Birr</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deal Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Availability</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Sold / Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mileage</Label>
                <Input value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} placeholder="e.g. 15,000 km" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Seats</Label>
                <Input type="number" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} placeholder="5" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fuel Type</Label>
                <Select value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transmission</Label>
                <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vehicle Showcase Image</Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-border/40 bg-muted shadow-inner">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Label htmlFor="image-upload" className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <Upload className="h-4 w-4" /> Change Image
                      </Label>
                      <Button type="button" variant="ghost" className="bg-red-500/20 hover:bg-red-500/40 text-white rounded-xl h-9 w-9 p-0" onClick={() => { setImageFile(null); setImagePreview(""); setFormData({...formData, image: ""}); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Click to upload image</span>
                      <p className="text-[10px]">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  </Label>
                )}
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vehicle Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe key features, condition, etc..." className="min-h-[120px] rounded-xl resize-none py-3" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-11 px-6 rounded-xl font-bold">Cancel</Button>
              <Button type="submit" disabled={isPending} className="h-11 px-10 rounded-xl font-bold shadow-lg shadow-primary/20">
                {isPending ? "Processing..." : editingCar ? "Update Vehicle" : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
