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
import { cn } from "@/lib/utils";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
            <CarIcon className="h-7 w-7 text-amber-600" strokeWidth={2.5} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2 border border-amber-100 shadow-sm">
              <Sparkles className="h-3 w-3" /> {t("inventoryControl") || "INVENTORY CONTROL"}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("carManagement")}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{t("addEditRemoveVehicles")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder={t("searchByName")} 
              className="w-full pl-11 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-12 text-slate-900 font-bold placeholder:text-slate-400 transition-all shadow-sm" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button 
            className="rounded-2xl bg-[#3df0a2] text-slate-950 hover:bg-[#34ce8b] h-12 px-8 font-black uppercase text-[10px] tracking-widest border-0 transition-all shadow-xl shadow-[#3df0a2]/15 hover:scale-105 active:scale-95" 
            onClick={openAdd}
          >
            <Plus className="h-5 w-5 mr-2" /> 
            <span>{t("addVehicle")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 min-w-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: t("totalFleet") || "Total Fleet", value: stats.total, color: "text-slate-900", bg: "bg-amber-50", icon: CarIcon, borderColor: "border-slate-100" },
          { label: t("forSale") || "For Sale", value: stats.forSale, color: "text-amber-600", bg: "bg-amber-50", icon: Tag, borderColor: "border-amber-100" },
          { label: t("forRent") || "For Rent", value: stats.forRent, color: "text-blue-600", bg: "bg-blue-50", icon: Calendar, borderColor: "border-blue-100" },
          { label: t("available") || "Available", value: stats.available, color: "text-emerald-600", bg: "bg-emerald-50", icon: Layers, borderColor: "border-emerald-100" },
        ].map(({ label, value, color, bg, icon: Icon, borderColor }) => (
          <div key={label} className={`rounded-[2rem] p-6 border ${borderColor} bg-white hover:-translate-y-1 transition-all group overflow-hidden relative shadow-xl shadow-slate-200/50`}>
             <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-3xl ${bg}`} />
             <div className="flex items-center justify-between relative z-10">
               <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">{label}</p>
                  <p className={`text-4xl font-black tabular-nums tracking-tighter ${color}`}>{value}</p>
               </div>
               <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center border border-slate-50 shadow-sm`}>
                  <Icon className={`h-7 w-7 ${color}`} />
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Inventory Grid/Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-12">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">{t("vehicleDetails")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">{t("type")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">{t("priceBirr")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">{t("status")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="py-40 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 className="h-14 w-14 animate-spin text-amber-500/30" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("fetchingInventory") || "Connecting to Inventory..."}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                        <CarIcon className="h-20 w-20 mb-2 text-slate-300" strokeWidth={1} />
                        <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-300">{t("noVehiclesInventory")}</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-lg border border-slate-100 bg-slate-50 group-hover:scale-110 transition-transform duration-700">
                          <img 
                            src={car.image} 
                            alt={car.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg group-hover:text-amber-600 transition-colors leading-none mb-2">{car.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 font-black">
                             <div className="flex items-center gap-1.5 text-[9px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                <Calendar className="h-3 w-3" /> {car.year}
                             </div>
                             <div className="flex items-center gap-1.5 text-[9px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-[0.1em]">
                                <Fuel className="h-3 w-3" /> {car.fuel || "Gas"}
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm transition-all ${
                        car.type === "sale" 
                          ? "bg-amber-50 text-amber-600 border-amber-100" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {car.type === "sale" ? t("sale") : t("rental")}
                      </span>
                    </td>
                    <td className="px-8 py-8 font-black tabular-nums text-slate-900 text-xl tracking-tighter">
                       {Number(car.price).toLocaleString()} <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">{settings?.General?.defaultCurrency || 'ETB'}</span>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm transition-all ${
                        car.available 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${car.available ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500"}`} />
                        {car.available ? t("available") : t("unavailable")}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm" 
                          onClick={() => openEdit(car)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:border-red-400 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-slate-100 bg-white shadow-xl p-10 overflow-hidden relative">
                            <AlertDialogHeader>
                              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mb-6 border border-red-100 shadow-sm">
                                <AlertTriangle className="h-10 w-10" strokeWidth={2.5} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                                {t("confirmDeletion")}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 font-bold text-sm tracking-wide mt-4">
                                {t("areYouSureDeleteCar")} This vehicle will be permanently removed from the public listings. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 gap-4">
                              <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex-1 uppercase tracking-widest text-[10px] transition-all">{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(car.id)} 
                                className="bg-red-500 text-white hover:bg-red-600 rounded-2xl h-14 px-10 font-black flex-1 shadow-lg shadow-red-500/20 uppercase tracking-[0.2em] text-[10px] border-0 transition-all hover:scale-105 active:scale-95"
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
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
           <span>Showing {filteredCars.length} of {carsData.length} records</span>
           <span className="flex items-center gap-2 text-amber-500/50"><Info className="h-3.5 w-3.5" /> system synchronized</span>
        </div>
      </div>

      {/* Car Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl rounded-[3rem] border-slate-100 bg-white p-0 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          <div className="bg-slate-50 p-10 border-b border-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm border border-amber-100">
                  {editingCar ? <Settings2 className="h-8 w-8 text-amber-600" strokeWidth={2.5} /> : <Plus className="h-8 w-8 text-amber-600" strokeWidth={2.5} />}
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{editingCar ? t("editVehicleDetails") : t("addNewVehicle")}</h2>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mt-2">Vehicle Configuration Module v3.0</p>
               </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all" onClick={() => setIsOpen(false)}><X className="h-6 w-6" /></Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 custom-scrollbar-amber space-y-12 group/form">
            {/* Visual Section */}
            <div className="space-y-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 flex items-center gap-3 mb-4">
                <ImageIcon className="h-4 w-4" /> {t("vehicleShowcaseImage")}
              </Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative group w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                      }}
                    />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 backdrop-blur-[2px]">
                      <Label htmlFor="image-upload" className="cursor-pointer bg-amber-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all hover:scale-110 active:scale-95 shadow-lg">
                        <Upload className="h-4 w-4" /> {t("changeImage") || "UPDATE IMAGE"}
                      </Label>
                      <Button type="button" variant="ghost" className="bg-red-500 text-white rounded-2xl h-14 w-14 shadow-lg transition-all" onClick={() => { setImageFile(null); setImagePreview(""); setFormData({...formData, image: ""}); }}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full aspect-[21/9] rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer relative overflow-hidden group/upload">
                    <div className="flex flex-col items-center gap-4 text-slate-400 group-hover/upload:text-amber-600 transition-all relative z-10 py-10">
                      <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-sm group-hover/upload:scale-110 group-hover/upload:-rotate-6 transition-all border border-slate-100">
                        <Upload className="h-8 w-8" strokeWidth={2.5} />
                      </div>
                      <div className="text-center">
                         <span className="text-[11px] font-black uppercase tracking-[0.3em] block mb-2">{t("clickToUploadImage")}</span>
                         <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">High-resolution PNG / WEBP recommended</p>
                      </div>
                    </div>
                  </Label>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            {/* Core Data Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
               <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 mb-2"><CarIcon className="h-4 w-4" /> {t("make")} & {t("model")}</Label>
                    <div className="flex gap-4">
                       <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" className="h-14 rounded-2xl font-black bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-amber-500/20 shadow-sm" />
                       <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Camry SE" className="h-14 rounded-2xl font-black bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-amber-500/20 shadow-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block"><Calendar className="h-4 w-4 inline mr-2" /> {t("year")}</Label>
                        <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2024" className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black tabular-nums text-slate-900" />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block"><MapPin className="h-4 w-4 inline mr-2" /> {t("location")}</Label>
                        <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Addis Ababa" className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-slate-900" />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-2 flex items-center gap-3"><Tag className="h-4 w-4" /> {t("price")} & {t("dealType")}</Label>
                    <div className="flex gap-4">
                       <div className="relative flex-1">
                          <Input 
                            type="text" required 
                            value={formData.price} 
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setFormData({...formData, price: raw ? Number(raw).toLocaleString() : ""});
                            }} 
                            placeholder="Price" className="h-16 rounded-2xl font-black text-3xl text-amber-600 bg-amber-50 border-amber-200 pl-10 pr-16 focus-visible:ring-amber-500/20 shadow-sm" 
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-600/40 tabular-nums"></span>
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-600/40 uppercase tracking-tighter tabular-nums">{settings?.General?.defaultCurrency || 'ETB'}</span>
                       </div>
                       <div className="w-[140px]">
                          <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                            <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-200 font-black text-xs uppercase tracking-[0.2em] shadow-sm text-slate-900"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 bg-white text-slate-900 shadow-xl">
                              <SelectItem value="sale">{t("sale")}</SelectItem>
                              <SelectItem value="rent">{t("rent")}</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </div>
               </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 mb-2"><Layers className="h-4 w-4" /> {t("specifications")}</Label>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Mileage</p>
                          <Input value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} placeholder="0 km" className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-900" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Seats</p>
                          <Input type="number" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} placeholder="5" className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-900 font-black" />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Fuel System</Label>
                      <Select value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-slate-900 px-6"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl bg-white border-slate-200 text-slate-900 shadow-xl">
                           {["Gasoline", "Diesel", "Electric", "Hybrid"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Gearbox</Label>
                      <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-slate-900 px-6"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl bg-white border-slate-200 text-slate-900 shadow-xl">
                          <SelectItem value="Automatic">Auto</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 mb-2"><Info className="h-4 w-4" /> {t("availability")}</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-[0.2em] bg-slate-50 text-slate-900 px-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white border-slate-200 text-slate-900 shadow-xl">
                        <SelectItem value="available">MARK AS AVAILABLE</SelectItem>
                        <SelectItem value="unavailable">MARK AS SOLD / RENTED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 mb-2"><Info className="h-4 w-4" /> {t("vehicleDescription")}</Label>
              <div className="relative group/text">
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="List technical highlights, condition, service history and other unique selling points..." 
                  className="min-h-[180px] rounded-[2.5rem] border-slate-200 bg-slate-50 p-8 text-sm font-bold text-slate-900 focus:ring-amber-500/20 resize-none leading-relaxed shadow-sm transition-all" 
                />
              </div>
            </div>
          </form>

          <footer className="p-10 border-t border-slate-100 bg-slate-50 flex justify-end items-center">
             <div className="flex gap-6">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 hover:bg-white transition-all">{t("cancel")}</Button>
                <Button onClick={handleSubmit} disabled={isPending} className="h-14 px-12 rounded-2xl bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#3df0a2]/15 transition-all hover:scale-[1.05] active:scale-95 border-0">
                  {isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-3" /> PROCESSINGâ€¦</> : (editingCar ? t("updateVehicle") : t("addVehicle"))}
                </Button>
             </div>
          </footer>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

