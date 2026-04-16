import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCars, useCreateCar, useUpdateCar, useDeleteCar, useUploadImage, Car } from "@/hooks/useCars";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Upload, Image as ImageIcon, X, Car as CarIcon, MapPin, Calendar, Tag, Info, Fuel, Settings2, Users, Loader2, Sparkles, RefreshCw, Layers, Check } from "lucide-react";
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
        toast({ title: t("carUpdated"), description: t("vehicleDetailsSaved") });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: t("carAdded"), description: t("newVehicleAdded") });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast({ title: t("toastError"), description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: t("carDeleted"), description: t("vehicleRemoved") });
    } catch (err: any) {
      toast({ title: t("toastError"), description: err.message, variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#4CBFBF]/10 flex items-center justify-center border border-[#4CBFBF]/20 shadow-sm">
            <CarIcon className="h-7 w-7 text-[#4CBFBF]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CBFBF]/10 text-[#4CBFBF] text-[9px] font-black uppercase tracking-[0.2em] mb-2 border border-[#4CBFBF]/20 shadow-sm">
              <Sparkles className="h-3 w-3" /> {t("inventoryControl")}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("carManagement")}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{t("addEditRemoveVehicles")}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder={t("searchByName")} 
              className="w-full pl-11 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CBFBF]/20 h-12 text-slate-900 font-bold placeholder:text-slate-400 transition-all shadow-sm" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button 
            className="rounded-2xl bg-[#4CBFBF] text-[#050505] hover:bg-[#3fb0b0] h-12 px-8 font-black uppercase text-[10px] tracking-widest border-0 transition-all shadow-xl shadow-[#4CBFBF]/15 hover:scale-105 active:scale-95" 
            onClick={openAdd}
          >
            <Plus className="h-5 w-5 mr-2" /> 
            <span>{t("addVehicle")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 min-w-12 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
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
          { label: t("totalFleet") || "Total Fleet", value: stats.total, color: "text-slate-900", bg: "bg-slate-100", icon: CarIcon, borderColor: "border-slate-200" },
          { label: t("forSale") || "For Sale", value: stats.forSale, color: "text-[#f5b027]", bg: "bg-[#f5b027]/10", icon: Tag, borderColor: "border-[#f5b027]/20" },
          { label: t("forRent") || "For Rent", value: stats.forRent, color: "text-[#4CBFBF]", bg: "bg-[#4CBFBF]/10", icon: Calendar, borderColor: "border-[#4CBFBF]/20" },
          { label: t("available") || "Available", value: stats.available, color: "text-emerald-500", bg: "bg-emerald-400/10", icon: Layers, borderColor: "border-emerald-400/20" },
        ].map(({ label, value, color, bg, icon: Icon, borderColor }) => (
          <div key={label} className={`rounded-[2rem] p-6 border ${borderColor} bg-white hover:-translate-y-1 transition-all group overflow-hidden relative shadow-lg shadow-slate-100`}>
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
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden mb-12">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
             <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("vehicleDetails")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("type")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("priceBirr")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("status")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {isLoading ? (
                <tr>
                   <td colSpan={5} className="py-40 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 className="h-14 w-14 animate-spin text-[#4CBFBF]/30" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{t("fetchingInventory")}</p>
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
                   <tr key={car.id} className="hover:bg-slate-50 transition-all group border-b border-slate-100">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 bg-slate-100 group-hover:scale-110 transition-transform duration-700">
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
                          <p className="font-black text-slate-900 text-lg group-hover:text-[#4CBFBF] transition-colors leading-none mb-2">{car.name}</p>
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
                          ? "bg-[#f5b027]/10 text-[#f5b027] border-[#f5b027]/20" 
                          : "bg-[#4CBFBF]/10 text-[#4CBFBF] border-[#4CBFBF]/20"
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
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" 
                          : "bg-red-400/10 text-red-400 border-red-400/20"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${car.available ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" : "bg-red-400"}`} />
                        {car.available ? t("available") : t("unavailable")}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:border-[#f5b027]/40 text-slate-400 hover:text-[#f5b027] hover:bg-[#f5b027]/10 transition-all shadow-sm" 
                          onClick={() => openEdit(car)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:border-red-400/40 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all shadow-sm"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                           <AlertDialogContent className="rounded-[2.5rem] border-slate-200 bg-white shadow-2xl p-10 overflow-hidden relative text-slate-900">
                            <AlertDialogHeader>
                              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-6 border border-red-100 shadow-sm">
                                <AlertTriangle className="h-10 w-10" strokeWidth={2.5} />
                              </div>
                              <AlertDialogTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                                {t("confirmDeletion")}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 font-bold text-sm tracking-wide mt-4">
                                {t("confirmDeleteCarWarning")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-10 gap-4">
                              <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex-1 uppercase tracking-widest text-[10px] transition-all">{t("cancel")}</AlertDialogCancel>
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
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
           <span>{t("showingRecords")} {filteredCars.length} {t("ofRecords")} {carsData.length} {t("recordsLabel")}</span>
           <span className="flex items-center gap-2 text-[#f5b027]"><Info className="h-3.5 w-3.5" /> {t("systemSynchronized")}</span>
        </div>
      </div>

       {/* Car Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[1440px] h-[92vh] p-0 overflow-hidden bg-white border-none rounded-[3.5rem] shadow-2xl flex flex-col">
          <header className="px-10 h-24 shrink-0 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-4 ring-primary/5">
                <CarIcon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  {editingCar ? t("editVehicleDetails") : t("addNewVehicle")}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1.5">{t("inventoryControl") || "System Inventory"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 text-xs tracking-widest uppercase" onClick={() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit()}>
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {editingCar ? t("updateVehicle") : t("addVehicle")}
              </Button>
              <button className="rounded-2xl h-14 w-14 bg-slate-100/50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center hover:bg-slate-100" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 group/form bg-white">
            {/* LEFT COLUMN: VISUALS & DESC */}
            <div className="h-full overflow-y-auto p-10 border-r border-slate-50 space-y-10 custom-scrollbar-teal bg-slate-50/20">
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t("vehicleShowcaseImage")}</Label>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t("highResAspect")}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {imagePreview ? (
                      <div className="relative group w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-sm ring-8 ring-slate-100/50">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 backdrop-blur-[2px]">
                          <Label htmlFor="image-upload" className="cursor-pointer bg-white text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all hover:scale-110 active:scale-95 shadow-lg">
                            <Upload className="h-4 w-4" /> {t("changeImage") || t("selectImage")}
                          </Label>
                          <Button type="button" variant="ghost" className="bg-red-500/90 text-white rounded-2xl h-14 w-14 shadow-lg transition-all" onClick={() => { setImageFile(null); setImagePreview(""); setFormData({...formData, image: ""}); }}>
                            <X className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full aspect-[21/9] rounded-[3rem] border-2 border-dashed border-slate-200 bg-white hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden group/upload shadow-sm ring-8 ring-slate-100/50">
                        <div className="flex flex-col items-center gap-4 text-slate-300 group-hover/upload:text-primary transition-all relative z-10 py-10">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover/upload:scale-110 group-hover/upload:-rotate-6 transition-all border border-slate-100">
                            <Upload className="h-6 w-6" strokeWidth={3} />
                          </div>
                          <div className="text-center">
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1">{t("clickToUploadImage")}</span>
                             <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase">Max 5MB • PNG / JPG / WEBP</p>
                          </div>
                        </div>
                      </Label>
                    )}
                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t("vehicleDescription")}</Label>
                  </div>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder={t("descPlaceholder")} 
                    className="h-[30vh] rounded-[2rem] border-slate-200 bg-white p-8 text-sm font-bold text-slate-700 focus:ring-primary/20 resize-none leading-relaxed shadow-sm transition-all focus:bg-white placeholder:text-slate-300 ring-8 ring-slate-100/50" 
                  />
                </div>
            </div>

            {/* RIGHT COLUMN: CORE DATA */}
            <div className="h-full overflow-y-auto p-10 space-y-12 custom-scrollbar-teal">
               {/* 1. Identity & Location */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CarIcon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("identityLocation")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("make")}</Label>
                      <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black focus:bg-white transition-all shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("model")}</Label>
                      <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Camry SE" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black focus:bg-white transition-all shadow-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("year")}</Label>
                      <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2024" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black focus:bg-white transition-all shadow-sm pointer-events-auto" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("location")}</Label>
                      <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Addis Ababa" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black focus:bg-white transition-all shadow-sm" />
                    </div>
                  </div>
               </div>

               {/* 2. Specs */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings2 className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("technicalSpecs")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("mileageLabel")}</Label>
                      <Input value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} placeholder="0 km" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("seatsLabel")}</Label>
                      <Input type="number" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} placeholder="5" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("fuelLabel")}</Label>
                      <Select value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-slate-900 shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="Gasoline">{t("gasoline")}</SelectItem>
                           <SelectItem value="Diesel">{t("diesel")}</SelectItem>
                           <SelectItem value="Electric">{t("electric")}</SelectItem>
                           <SelectItem value="Hybrid">{t("hybrid")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("gearboxLabel")}</Label>
                      <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-slate-900 shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Automatic">{t("auto")}</SelectItem>
                          <SelectItem value="Manual">{t("manual")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
               </div>

               {/* 3. Pricing (Clean High Visibility) */}
               <div className="space-y-8 bg-[#4CBFBF]/5 p-8 rounded-[2.5rem] border border-[#4CBFBF]/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                        <Tag className="h-4 w-4" /> {t("price")}
                      </Label>
                      <span className="text-[9px] font-black text-[#4CBFBF]/60 bg-[#4CBFBF]/10 px-3 py-1 rounded-full uppercase tracking-widest">{settings?.General?.defaultCurrency || 'ETB'}</span>
                    </div>
                    <div className="relative">
                      <Input 
                        type="text" required 
                        value={formData.price} 
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({...formData, price: raw ? Number(raw).toLocaleString() : ""});
                        }} 
                        placeholder="0" 
                        className="h-20 rounded-2xl font-black text-5xl text-primary bg-white border-primary/20 px-8 focus-visible:ring-primary/40 shadow-xl shadow-primary/5 tracking-tighter tabular-nums" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("dealType")}</Label>
                      <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-black text-xs uppercase tracking-widest shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="sale">{t("sale")}</SelectItem>
                          <SelectItem value="rent">{t("rent")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t("availability")}</Label>
                      <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-black text-[9px] uppercase tracking-widest shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="available">{t("availableCaps")}</SelectItem>
                          <SelectItem value="unavailable">{t("soldRentedCaps")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
               </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
