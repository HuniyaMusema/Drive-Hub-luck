import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCars, useCreateCar, useUpdateCar, useDeleteCar, useUploadImage, Car } from "@/hooks/useCars";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Upload, Image as ImageIcon, X, Car as CarIcon, MapPin, Calendar, Tag, Info, Fuel, Settings2, Users, Loader2, Sparkles, RefreshCw, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: carsData = [], isLoading } = useCars();
  const createMutation = useCreateCar();
  const updateMutation = useUpdateCar();
  const deleteMutation = useDeleteCar();
  const uploadMutation = useUploadImage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { settings } = useSettings();
  
  const filteredCars = useMemo(() => {
    return carsData.filter((c) => 
      !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [carsData, search]);

  const stats = useMemo(() => ({
    total: carsData.length,
    forSale: carsData.filter(c => c.type === 'sale').length,
    forRent: carsData.filter(c => c.type === 'rental').length,
    available: carsData.filter(c => c.available).length,
  }), [carsData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['cars'] });
    setTimeout(() => setIsRefreshing(false), 600);
  };

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
      price: car.price.toString(),
      type: car.type === 'rental' ? 'rent' : 'sale',
      status: car.available ? 'available' : 'unavailable',
      description: car.description,
      image: car.image,
      location: "",
      mileage: car.mileage || "",
      fuel: car.fuel || "Gasoline",
      transmission: car.transmission || "Automatic",
      seats: (car.seats || 5).toString()
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
        year: Number(formData.year),
        seats: Number(formData.seats)
      };

      if (editingCar) {
        await updateMutation.mutateAsync({ id: editingCar.id, data: payload });
        toast({ title: t("carUpdated") || "Car Updated", description: t("vehicleDetailsSaved") || "Vehicle details have been saved." });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: t("carAdded") || "Car Added", description: t("newVehicleAdded") || "New vehicle has been added to inventory." });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: t("carDeleted") || "Car Deleted", description: t("vehicleRemoved") || "Vehicle removed from inventory." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <CarIcon className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-1 border border-primary/20">
              <Sparkles className="h-2.5 w-2.5" /> inventory control
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("carManagement")}</h1>
            <p className="text-sm text-muted-foreground font-medium">{t("addEditRemoveVehicles")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("searchByName")} 
              className="pl-9 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-primary/30 h-10 shadow-sm" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button 
            className="rounded-2xl h-10 px-6 font-extrabold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2" 
            onClick={openAdd}
          >
            <Plus className="h-5 w-5" /> 
            <span>{t("addVehicle")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 min-w-10 rounded-2xl border-border/60 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Fleet", value: stats.total, color: "text-foreground", bg: "bg-primary/5", icon: CarIcon },
          { label: "For Sale", value: stats.forSale, color: "text-blue-600", bg: "bg-blue-500/5", icon: Tag },
          { label: "For Rent", value: stats.forRent, color: "text-purple-600", bg: "bg-purple-500/5", icon: Calendar },
          { label: "Available", value: stats.available, color: "text-emerald-600", bg: "bg-emerald-500/5", icon: Layers },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-3xl p-5 border border-border/60 bg-card hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative shadow-sm`}>
             <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl ${bg}`} />
             <div className="flex items-center justify-between relative z-10">
               <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-widest mb-1">{label}</p>
                  <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
               </div>
               <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${color}`} />
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Inventory Grid/Table Section */}
      <div className="bg-card rounded-3xl shadow-2xl shadow-primary/5 border border-border/60 overflow-hidden mb-12">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60 text-left">
                <th className="px-6 py-5 font-extrabold uppercase tracking-widest text-[10px] text-muted-foreground">{t("vehicleDetails")}</th>
                <th className="px-6 py-5 font-extrabold uppercase tracking-widest text-[10px] text-muted-foreground">{t("type")}</th>
                <th className="px-6 py-5 font-extrabold uppercase tracking-widest text-[10px] text-muted-foreground">{t("priceBirr")}</th>
                <th className="px-6 py-5 font-extrabold uppercase tracking-widest text-[10px] text-muted-foreground">{t("status")}</th>
                <th className="px-6 py-5 font-extrabold uppercase tracking-widest text-[10px] text-muted-foreground text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("fetchingInventory") || "Connecting to Inventory..."}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                     <div className="flex flex-col items-center gap-3 opacity-30">
                        <CarIcon className="h-16 w-16 mb-2" strokeWidth={1} />
                        <p className="font-black text-xs uppercase tracking-widest">{t("noVehiclesInventory")}</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-border/60 bg-muted group-hover:scale-105 transition-transform duration-500">
                          <img 
                            src={car.image} 
                            alt={car.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                             <span className="text-[8px] text-white font-bold uppercase tracking-tighter">View Media</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors leading-tight">{car.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 font-bold">
                             <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                                <Calendar className="h-2.5 w-2.5" /> {car.year}
                             </div>
                             <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 uppercase tracking-tighter">
                                <Fuel className="h-2.5 w-2.5" /> {car.fuel || "Gas"}
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all ${
                        car.type === "sale" 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      }`}>
                        {car.type === "sale" ? t("sale") : t("rental")}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-black tabular-nums text-foreground text-lg tracking-tight">
                       {Number(car.price).toLocaleString()} <span className="text-[10px] text-muted-foreground font-extrabold uppercase">{settings?.General?.defaultCurrency || 'ETB'}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all ${
                        car.available 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
                        {car.available ? t("available") : t("unavailable")}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-2xl bg-card border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shadow-sm" 
                          onClick={() => openEdit(car)}
                        >
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-2xl bg-card border border-border/60 hover:border-destructive/40 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all shadow-sm"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-border/60 p-8 shadow-2xl">
                            <AlertDialogHeader>
                              <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                                <AlertTriangle className="h-8 w-8" strokeWidth={2.5} />
                              </div>
                              <AlertDialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                {t("confirmDeletion")}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground font-medium text-base">
                                {t("areYouSureDeleteCar")} This vehicle will be permanently removed from the public listings.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-3">
                              <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold flex-1">{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(car.id)} 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 px-8 font-black flex-1 shadow-xl shadow-destructive/20"
                              >
                                {t("deleteCar")}
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
        <div className="bg-muted/20 px-6 py-4 border-t border-border/60 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
           <span>Showing {filteredCars.length} of {carsData.length} records</span>
           <span className="flex items-center gap-1"><Info className="h-3 w-3" /> system synchronized</span>
        </div>
      </div>

      {/* Car Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] border-border/60 p-0 overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
          <div className="bg-primary/5 p-8 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                  {editingCar ? <Settings2 className="h-6 w-6 text-primary" strokeWidth={2.5} /> : <Plus className="h-6 w-6 text-primary" strokeWidth={2.5} />}
               </div>
               <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">{editingCar ? t("editVehicleDetails") : t("addNewVehicle")}</h2>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-0.5">Configuration Panel v2.0</p>
               </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 group/form">
            {/* Visual Section */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                <ImageIcon className="h-3 w-3" /> {t("vehicleShowcaseImage")}
              </Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative group w-full aspect-[21/9] rounded-[2rem] overflow-hidden border border-border/40 bg-muted shadow-2xl shadow-primary/5">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                      <Label htmlFor="image-upload" className="cursor-pointer bg-white text-black px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all hover:scale-110 active:scale-95 shadow-xl">
                        <Upload className="h-4 w-4" /> {t("changeImage") || "UPDATE IMAGE"}
                      </Label>
                      <Button type="button" variant="ghost" className="bg-red-500/20 hover:bg-red-500 text-white rounded-2xl h-11 w-11 shadow-xl" onClick={() => { setImageFile(null); setImagePreview(""); setFormData({...formData, image: ""}); }}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full aspect-[21/9] rounded-[2rem] border-2 border-dashed border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-all relative z-10 py-6">
                      <div className="w-16 h-16 rounded-3xl bg-background flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                        <Upload className="h-6 w-6" strokeWidth={2.5} />
                      </div>
                      <div className="text-center">
                         <span className="text-xs font-black uppercase tracking-widest block">{t("clickToUploadImage")}</span>
                         <p className="text-[10px] font-bold mt-1 opacity-60">High-resolution PNG / WEBP recommended</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Label>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            {/* Core Data Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               <div className="space-y-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1"><CarIcon className="h-3 w-3" /> {t("make")} & {t("model")}</Label>
                    <div className="flex gap-3">
                       <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" className="h-12 rounded-2xl font-bold bg-muted/40 border-border/40" />
                       <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Camry SE" className="h-12 rounded-2xl font-bold bg-muted/40 border-border/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block"><Calendar className="h-3 w-3 inline mr-1" /> {t("year")}</Label>
                        <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2024" className="h-11 rounded-xl bg-muted/20 border-border/40 font-black tabular-nums" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block"><MapPin className="h-3 w-3 inline mr-1" /> {t("location")}</Label>
                        <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Addis Ababa" className="h-11 rounded-xl bg-muted/20 border-border/40 font-bold" />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-1"><Tag className="h-3 w-3" /> {t("price")} & {t("dealType")}</Label>
                    <div className="flex gap-4">
                       <div className="relative flex-1">
                          <Input 
                            type="text" required 
                            value={formData.price} 
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setFormData({...formData, price: raw ? Number(raw).toLocaleString() : ""});
                            }} 
                            placeholder="Price" className="h-14 rounded-2xl font-black text-2xl text-primary bg-primary/5 border-primary/20 pl-8 pr-12 focus-visible:ring-primary/20" 
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary/40">$</span>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase tracking-tighter">{settings?.General?.defaultCurrency || 'ETB'}</span>
                       </div>
                       <div className="w-[120px]">
                          <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                            <SelectTrigger className="h-14 rounded-2xl bg-card border-border/60 font-black text-xs uppercase tracking-widest shadow-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                              <SelectItem value="sale">{t("sale")}</SelectItem>
                              <SelectItem value="rent">{t("rent")}</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1"><Layers className="h-3 w-3" /> {t("specifications")}</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-muted-foreground/60 uppercase ml-1">Mileage</p>
                          <Input value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} placeholder="0 km" className="h-10 rounded-xl bg-muted/10" />
                       </div>
                       <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-muted-foreground/60 uppercase ml-1">Seats</p>
                          <Input type="number" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} placeholder="5" className="h-10 rounded-xl bg-muted/10 font-black" />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Fuel System</Label>
                      <Select value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border/60 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                           {["Gasoline", "Diesel", "Electric", "Hybrid"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Gearbox</Label>
                      <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-border/60 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Automatic">Auto</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1"><Info className="h-3 w-3" /> {t("availability")}</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                      <SelectTrigger className="h-11 rounded-xl border-border/60 font-black text-xs uppercase tracking-widest bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="available">MARK AS AVAILABLE</SelectItem>
                        <SelectItem value="unavailable">MARK AS SOLD / RENTED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1"><Info className="h-3 w-3" /> {t("vehicleDescription")}</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="List technical highlights, condition, service history and other unique selling points..." 
                className="min-h-[160px] rounded-[2rem] border-border/60 bg-muted/5 p-6 text-sm font-medium focus:ring-primary/20 resize-none leading-relaxed shadow-inner" 
              />
            </div>
          </form>

          <footer className="p-8 border-t border-border/40 bg-card flex justify-between items-center">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[8px] font-black">AI</div>)}
                <div className="w-14 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-black text-muted-foreground ml-3 shadow-inner">+99 INVENTORY</div>
             </div>
             <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-12 px-8 rounded-2xl font-bold hover:bg-muted/50">{t("cancel")}</Button>
                <Button onClick={handleSubmit} disabled={isPending} className="h-12 px-10 rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95">
                  {isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> PROCESSING…</> : (editingCar ? t("updateVehicle") : t("addVehicle"))}
                </Button>
             </div>
          </footer>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
