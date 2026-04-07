import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSettings, useAuditLogs, useBackups, useCreateBackup } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Settings, Shield, Ticket, Power, ScrollText, Bell, Database,
  Save, Upload, RotateCcw, Download, Trash2, FileDown,
  Globe, Landmark, Calendar, Mail, Phone, MapPin, Lock, UserPlus, 
  Smartphone, HardDrive, History, ArrowRight, Loader2, Sparkles
} from "lucide-react";

interface GeneralSettings {
  platformName: string;
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

interface SecuritySettings {
  registrationEnabled: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  sessionTimeout: number;
  multiLoginEnabled: boolean;
}

interface LotterySettings {
  moduleEnabled: boolean;
  ticketPrice: number;
  maxTicketsPerUser: number;
  drawFrequency: string;
  numberRangeMin: number;
  numberRangeMax: number;
  autoCloseMinutes: number;
  staffPaymentVerification: boolean;
  staffNumberGeneration: boolean;
  adminOverride: boolean;
}

interface OperationalSettings {
  platformEnabled: boolean;
  lotteryModuleEnabled: boolean;
  salesModuleEnabled: boolean;
  rentalsModuleEnabled: boolean;
  maintenanceMessage: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  adminAlertLargePayment: boolean;
  adminAlertSuspicious: boolean;
}

interface BackupSettings {
  backupFrequency: string;
}

const defaultGeneral: GeneralSettings = {
  platformName: "Drive Hub",
  defaultCurrency: "ETB",
  defaultLanguage: "en",
  timezone: "Africa/Addis_Ababa",
  dateFormat: "DD/MM/YYYY",
};

const defaultSecurity: SecuritySettings = {
  registrationEnabled: true,
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  sessionTimeout: 30,
  multiLoginEnabled: false,
};

const defaultLottery: LotterySettings = {
  moduleEnabled: true,
  ticketPrice: 200,
  maxTicketsPerUser: 5,
  drawFrequency: "manual",
  numberRangeMin: 1,
  numberRangeMax: 100,
  autoCloseMinutes: 30,
  staffPaymentVerification: true,
  staffNumberGeneration: true,
  adminOverride: true,
};

const defaultOperational: OperationalSettings = {
  platformEnabled: true,
  lotteryModuleEnabled: true,
  salesModuleEnabled: true,
  rentalsModuleEnabled: true,
  maintenanceMessage: "",
};

const defaultNotifications: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  adminAlertLargePayment: true,
  adminAlertSuspicious: true,
};

const defaultBackup: BackupSettings = {
  backupFrequency: "daily",
};

export default function AdminSettings() {
  const { toast } = useToast();
  const { settings, updateSetting, isLoading: settingsLoading } = useSettings();
  const { t, setLanguage } = useLanguage();
  const { data: auditLogs = [], isLoading: logsLoading } = useAuditLogs();
  const { data: backups = [], isLoading: backupsLoading } = useBackups();
  const createBackupMutation = useCreateBackup();

  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity);
  const [lottery, setLottery] = useState<LotterySettings>(defaultLottery);
  const [operational, setOperational] = useState<OperationalSettings>(defaultOperational);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [backup, setBackup] = useState<BackupSettings>(defaultBackup);
  const [logFilter, setLogFilter] = useState<"all" | "admin" | "lottery_staff">("all");

  useEffect(() => {
    if (settings) {
      if (settings["General"]) setGeneral({ ...defaultGeneral, ...settings["General"] });
      if (settings["Security"]) setSecurity({ ...defaultSecurity, ...settings["Security"] });
      if (settings["Lottery"]) setLottery({ ...defaultLottery, ...settings["Lottery"] });
      if (settings["Operational"]) setOperational({ ...defaultOperational, ...settings["Operational"] });
      if (settings["Notifications"]) setNotifications({ ...defaultNotifications, ...settings["Notifications"] });
      if (settings["Backup"]) setBackup({ ...defaultBackup, ...settings["Backup"] });
    }
  }, [settings]);

  const save = (key: string, data: any, label: string) => {
    updateSetting.mutate({ key, value: data }, {
      onSuccess: () => {
        toast({ title: t("settingsSynchronized"), description: `${label} ${t("profileSynchronized")}` });
        if (key === "General" && data.defaultLanguage) setLanguage(data.defaultLanguage);
      },
      onError: (err: any) => {
        toast({ title: t("saveFailed"), description: err.message, variant: "destructive" });
      }
    });
  };

  const handleCreateBackup = () => {
    toast({ title: t("adminStartingBackup"), description: t("adminTriggeringBackup") });
    createBackupMutation.mutate(undefined, {
      onSuccess: () => toast({ title: t("adminBackupFinalized"), description: t("adminBackupSuccess") }),
      onError: (err: any) => toast({ title: t("backupError"), description: err.message, variant: "destructive" })
    });
  };

  const handleSaveAll = () => {
    save("General", general, t("general"));
    save("Security", security, t("security"));
    save("Lottery", lottery, t("lottery"));
    save("Operational", operational, t("operational"));
    save("Notifications", notifications, t("notifications"));
    save("Backup", backup, t("backup"));
  };

  const filteredLogs = logFilter === "all" ? auditLogs : auditLogs.filter((l: any) => {
    if (logFilter === "admin") return l.action_type !== "PAYMENT_VERIFIED"; 
    return l.action_type === "PAYMENT_VERIFIED";
  });

  const SectionHeader = ({ icon: Icon, title, desc, color = "text-[#4CBFBF]" }: { icon: any, title: string, desc: string, color?: string }) => (
    <div className="flex items-center gap-5 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
        <Icon className={cn("h-7 w-7", color)} strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{desc}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f5b027]/10 flex items-center justify-center border border-[#f5b027]/20 shadow-sm">
            <Settings className="h-7 w-7 text-[#f5b027]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("settings")}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">{t("configureSystemCore")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button
            variant="ghost"
            className="rounded-2xl border border-slate-200 bg-white h-11 px-6 font-black text-slate-400 hover:text-slate-900 transition-all shadow-sm"
            onClick={() => {
              if (settings) {
                setGeneral(settings.General || defaultGeneral);
                setSecurity(settings.Security || defaultSecurity);
                setLottery(settings.Lottery || defaultLottery);
                setOperational(settings.Operational || defaultOperational);
                setNotifications(settings.Notifications || defaultNotifications);
                setBackup(settings.Backup || defaultBackup);
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("settingsReset")}
          </Button>
           <Button
            className="rounded-2xl bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] h-11 px-8 font-black uppercase text-[10px] tracking-widest border-0 transition-all shadow-xl shadow-[#4CBFBF]/10 hover:scale-105 active:scale-95"
            onClick={handleSaveAll}
            disabled={updateSetting.isPending}
          >
            {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t("saveSettings")}
          </Button>
        </div>
      </div>

       <Tabs defaultValue="general" className="space-y-10 animate-fade-in">
        <TabsList className="bg-white border border-slate-200 p-2 rounded-[2rem] h-auto flex flex-wrap gap-2 shadow-xl shadow-slate-100">
          {[
            { id: "general", icon: Globe, label: t("settingsGeneral") },
            { id: "operational", icon: Power, label: t("settingsOperational") },
            { id: "security", icon: Shield, label: t("settingsSecurity") },
            { id: "lottery", icon: Ticket, label: t("settingsLottery") },
            { id: "notifications", icon: Bell, label: t("settingsNotifications") },
            { id: "backup", icon: Database, label: t("settingsBackups") },
            { id: "logs", icon: History, label: t("settingsAudit") },
          ].map((tab) => (
             <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-500 data-[state=active]:bg-[#4CBFBF] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-[#4CBFBF]/10"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="max-w-4xl">
          {/* General */}
           <TabsContent value="general" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={Globe} title={t("generalSettings")} desc={t("adminGeneralDesc")} color="text-[#f5b027]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t("platformName")}</Label>
                    <Input className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#f5b027]/20 font-black text-slate-900 px-6 shadow-sm placeholder:text-slate-400" value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
                  </div>
                  
                   <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t("defaultLanguage")}</Label>
                    <Select value={general.defaultLanguage} onValueChange={(v) => setGeneral({ ...general, defaultLanguage: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[#f5b027]/20 font-black text-slate-900 px-6 shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white border-slate-200 shadow-2xl text-slate-900">
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="am">🇪🇹 Amharic (አማርኛ)</SelectItem>
                        <SelectItem value="om">🇪🇹 Afaan Oromoo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t("defaultCurrency")}</Label>
                    <Select value={general.defaultCurrency} onValueChange={(v) => setGeneral({ ...general, defaultCurrency: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[#f5b027]/20 font-black text-slate-900 px-6 shadow-sm tabular-nums"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white border-slate-200 shadow-2xl text-slate-900">
                         <SelectItem value="ETB">ETB (Birr)</SelectItem>
                         <SelectItem value="USD">USD (Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                     <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t("dateFormat")}</Label>
                    <Select value={general.dateFormat} onValueChange={(v) => setGeneral({ ...general, dateFormat: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-[#f5b027]/20 font-black text-slate-900 px-6 shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white border-slate-200 shadow-2xl text-slate-900">
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-14 pt-14 border-t border-slate-100 space-y-10">
                <div className="flex items-center gap-3">
                  <Landmark className="h-6 w-6 text-amber-500" />
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-sm">{t("contactInformation")}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2"><Mail className="h-4 w-4" /> {t("contactEmail")}</Label>
                    <Input className="rounded-2xl h-14 bg-slate-50 border-slate-100 focus:ring-amber-500/20 font-black text-slate-900 px-6 shadow-sm" type="email" value={general.contactEmail || ""} onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2"><Phone className="h-4 w-4" /> {t("contactPhone")}</Label>
                    <Input className="rounded-2xl h-14 bg-slate-50 border-slate-100 focus:ring-amber-500/20 font-black text-slate-900 px-6 shadow-sm font-mono" value={general.contactPhone || ""} onChange={(e) => setGeneral({ ...general, contactPhone: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2"><MapPin className="h-4 w-4" /> {t("physicalAddress")}</Label>
                    <Input className="rounded-2xl h-14 bg-slate-50 border-slate-100 focus:ring-amber-500/20 font-black text-slate-900 px-6 shadow-sm" value={general.contactAddress || ""} onChange={(e) => setGeneral({ ...general, contactAddress: e.target.value })} />
                  </div>
                </div>
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("General", general, t("general"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#3df0a2]/10 bg-[#3df0a2] text-slate-950 hover:bg-[#34ce8b] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  {updateSetting.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-4" /> : <Save className="h-5 w-5 mr-4" />} {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Operational */}
          <TabsContent value="operational" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={Power} title={t("operationalControls")} desc={t("adminOperationalDesc")} color="text-red-500" />
              
              <div className="space-y-10">
                <div className="p-10 rounded-[2.5rem] bg-red-50 border border-red-100 relative overflow-hidden group/shutdown transition-all hover:bg-red-100/50 shadow-sm">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 group-hover/shutdown:scale-110 transition-transform shadow-sm">
                        <Power className="h-8 w-8" />
                      </div>
                      <div>
                         <p className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{t("enableEntirePlatform")}</p>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-md leading-relaxed">{t("platformShutdownDesc")}</p>
                      </div>
                    </div>
                    <Switch checked={operational.platformEnabled} onCheckedChange={(v) => setOperational({ ...operational, platformEnabled: v })} className="data-[state=checked]:bg-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: t("adminLotteryEngine"), desc: t("adminToggleTicketing"), key: "lotteryModuleEnabled" },
                    { label: "Sales Engine", desc: "Toggle Vehicle Sales", key: "salesModuleEnabled" },
                    { label: "Rental Engine", desc: "Toggle Vehicle Rentals", key: "rentalsModuleEnabled" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:border-[#4CBFBF]/40 transition-all group/toggle">
                       <div>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">{item.desc}</p>
                       </div>
                       <Switch checked={(operational as any)[item.key]} onCheckedChange={(v) => setOperational({ ...operational, [item.key]: v })} className="data-[state=checked]:bg-[#4CBFBF]" />
                    </div>
                  ))}
                </div>

                 <div className="space-y-4 pt-8">
                  <div className="flex items-center gap-2 ml-1">
                    <ScrollText className="h-4 w-4 text-slate-400" />
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t("maintenanceMessageLabel")}</Label>
                  </div>
                  <Textarea
                    placeholder="We're currently performing scheduled maintenance. Please check back later."
                    className="rounded-[2.5rem] border-slate-200 min-h-[140px] bg-slate-50 p-8 text-sm font-black text-slate-900 focus:ring-[#f5b027]/20 leading-relaxed placeholder:text-slate-400 shadow-sm"
                    value={operational.maintenanceMessage}
                    onChange={(e) => setOperational({ ...operational, maintenanceMessage: e.target.value })}
                  />
                </div>
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("Operational", operational, t("operational"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  {updateSetting.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-4" /> : <Save className="h-5 w-5 mr-4" />} {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Security */}
          <TabsContent value="security" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={Lock} title={t("securityAccess")} desc={t("adminSecurityDesc")} color="text-[#f5b027]" />
              
              <div className="space-y-10">
                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 group/security hover:bg-slate-100 transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#f5b027]/10 flex items-center justify-center text-[#f5b027] group-hover/security:scale-110 transition-transform border border-[#f5b027]/20 shadow-sm">
                      <UserPlus className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{t("enableRegistration")}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{t("registrationDesc")}</p>
                    </div>
                  </div>
                  <Switch checked={security.registrationEnabled} onCheckedChange={(v) => setSecurity({ ...security, registrationEnabled: v })} className="data-[state=checked]:bg-[#4CBFBF]" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">{t("minPasswordLength")}</Label>
                    <Input type="number" min={6} className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus:ring-[#f5b027]/20 font-black text-slate-900 px-6 tabular-nums shadow-sm" value={security.minPasswordLength} onChange={(e) => setSecurity({ ...security, minPasswordLength: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">{t("sessionTimeout")} (min)</Label>
                    <Input type="number" min={5} className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus:ring-[#f5b027]/20 font-black text-slate-900 px-6 tabular-nums shadow-sm" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })} />
                  </div>
                </div>

                </div>

                <div className="space-y-4 pt-8">
                  {[
                    { label: t("requireUppercase"), desc: t("uppercaseDesc"), key: "requireUppercase" },
                    { label: t("requireNumbers"), desc: t("numbersDesc"), key: "requireNumbers" },
                    { label: t("allowMultiLogin"), desc: t("multiLoginDesc"), key: "multiLoginEnabled" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-8 rounded-[2rem] border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all group/toggle">
                       <div>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">{item.desc}</p>
                       </div>
                       <Switch checked={(security as any)[item.key]} onCheckedChange={(v) => setSecurity({ ...security, [item.key]: v })} className="data-[state=checked]:bg-[#4CBFBF]" />
                    </div>
                  ))}
                </div>
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("Security", security, t("security"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  <Save className="h-5 w-5 mr-4" /> {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Lottery */}
          <TabsContent value="lottery" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={Ticket} title={t("lotteryConfiguration")} desc={t("adminLotteryDesc")} color="text-[#f5b027]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4 p-8 bg-[#f5b027]/10 rounded-[2.5rem] border border-[#f5b027]/20 shadow-sm">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5b027] mb-1 block leading-none">{t("ticketPrice")}</Label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-[#f5b027] text-3xl">ETB</span>
                    <Input type="number" className="pl-16 h-16 bg-transparent border-none text-4xl font-black tabular-nums focus-visible:ring-0 text-slate-900 shadow-none placeholder:text-[#f5b027]/20" value={lottery.ticketPrice} onChange={(e) => setLottery({ ...lottery, ticketPrice: Number(e.target.value) })} />
                  </div>
                </div>
                
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 block leading-none">{t("adminMaxTicketsPerUser")}</Label>
                   <Input type="number" className="h-14 bg-transparent border-none font-black tabular-nums text-4xl text-slate-900 px-0 w-full focus-visible:ring-0" value={lottery.maxTicketsPerUser} onChange={(e) => setLottery({ ...lottery, maxTicketsPerUser: Number(e.target.value) })} />
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{t("perDrawLimit")}</p>
                </div>

                <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block leading-none">{t("drawFrequency")}</Label>
                  <Select value={lottery.drawFrequency} onValueChange={(v) => setLottery({ ...lottery, drawFrequency: v })}>
                    <SelectTrigger className="h-14 bg-white border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-[#f5b027] px-6 shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 bg-white text-slate-900 shadow-xl">
                      <SelectItem value="manual">{t("adminManualStaffTriggered")}</SelectItem>
                      <SelectItem value="weekly">{t("adminWeeklyAuto")}</SelectItem>
                      <SelectItem value="daily">{t("adminDailyAuto")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-14 space-y-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-2">{t("staffPermissions")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: t("staffCanVerify"), key: "staffPaymentVerification" },
                    { label: t("staffCanGenerate"), key: "staffNumberGeneration" },
                    { label: t("adminCanOverride"), key: "adminOverride" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-8 rounded-[2rem] border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all group/perm">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</p>
                      <Switch checked={(lottery as any)[item.key]} onCheckedChange={(v) => setLottery({ ...lottery, [item.key]: v })} className="data-[state=checked]:bg-[#4CBFBF]" />
                    </div>
                  ))}
                </div>
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("Lottery", lottery, t("lottery"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  <Save className="h-5 w-5 mr-4" /> {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={Bell} title={t("notificationSettings")} desc={t("adminNotificationsDesc")} color="text-[#f5b027]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: t("adminEmailEngine"), icon: Mail, key: "emailEnabled", color: "text-[#f5b027]", bg: "bg-[#f5b027]/10" },
                  { label: t("adminSmsGateway"), icon: Smartphone, key: "smsEnabled", color: "text-[#f5b027]", bg: "bg-[#f5b027]/10" },
                  { label: t("dashEstRevenue"), icon: Landmark, key: "adminAlertLargePayment", color: "text-[#f5b027]", bg: "bg-[#f5b027]/10" },
                  { label: t("adminSecurityAlerts"), icon: Shield, key: "adminAlertSuspicious", color: "text-red-400", bg: "bg-red-400/10" }
                ].map((item) => (
                  <div key={item.key} className="p-10 rounded-[2.5rem] border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-all group/notif shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover/notif:scale-110 transition-transform border border-slate-200", item.bg, item.color)}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-[0.15em] leading-none">{item.label}</p>
                    </div>
                    <Switch checked={(notifications as any)[item.key]} onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })} className="data-[state=checked]:bg-[#4CBFBF]" />
                  </div>
                ))}
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("Notifications", notifications, t("notifications"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  <Save className="h-5 w-5 mr-4" /> {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Backup */}
          <TabsContent value="backup" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden group">
              <SectionHeader icon={HardDrive} title={t("backupRecovery")} desc={t("adminBackupDesc")} color="text-[#f5b027]" />
              
              <div className="space-y-12">
                <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#f5b027]/10 flex items-center justify-center text-[#f5b027] shadow-sm border border-[#f5b027]/20">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{t("backupFrequency")}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("adminAutoSnapshotSchedule")}</p>
                    </div>
                  </div>
                  <Select value={backup.backupFrequency} onValueChange={(v) => setBackup({ ...backup, backupFrequency: v })}>
                    <SelectTrigger className="w-44 h-14 rounded-2xl bg-white border-slate-200 font-black uppercase text-[10px] tracking-[0.25em] text-slate-900 px-8 shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 bg-white text-slate-900 shadow-xl">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Button variant="ghost" className="h-32 rounded-[2.5rem] border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 hover:bg-[#f5b027]/10 hover:border-[#f5b027]/40 transition-all group/backup shadow-sm border" onClick={handleCreateBackup} disabled={createBackupMutation.isPending}>
                    {createBackupMutation.isPending ? <Loader2 className="h-7 w-7 animate-spin text-[#f5b027]" /> : <RotateCcw className="h-7 w-7 text-[#f5b027] group-hover/backup:rotate-180 transition-transform duration-700" />}
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">{t("manualBackup")}</span>
                  </Button>
                  <Button variant="ghost" className="h-32 rounded-[2.5rem] border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 opacity-30 cursor-not-allowed border transition-all">
                    <RotateCcw className="h-7 w-7 text-slate-600" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">{t("adminRollbackSystem")}</span>
                  </Button>
                </div>

                <div className="space-y-8 pt-4">
                   <div className="flex items-center justify-between px-2">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("remoteSnapshots")}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-[#f5b027] font-black uppercase tracking-widest bg-[#f5b027]/10 px-4 py-2 rounded-full border border-[#f5b027]/20 shadow-sm">
                         <Database className="h-3 w-3" />
                         <span>{t("storageProvider")}: AWS S3</span>
                      </div>
                   </div>
                   
                   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-6 custom-scrollbar-amber">
                     {backups.map((b: any) => (
                       <div key={b.file} className="flex items-center justify-between p-8 rounded-[2rem] border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all group/file shadow-sm">
                         <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover/file:border-[#f5b027]/40 group-hover/file:text-[#f5b027] transition-all">
                             <HardDrive className="h-6 w-6" />
                           </div>
                           <div>
                             <span className="font-mono text-xs font-bold text-slate-900 block truncate max-w-[250px] leading-none mb-1.5">{b.file}</span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{Math.round(b.size / 1024)} KB • {t("sqlDatabaseSnapshot")}</span>
                           </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-500 hover:text-[#f5b027] hover:bg-[#f5b027]/10 rounded-2xl transition-all border border-transparent hover:border-[#f5b027]/20">
                           <Download className="h-6 w-6" />
                         </Button>
                       </div>
                     ))}
                     {backups.length === 0 && (
                       <div className="flex flex-col items-center justify-center py-24 opacity-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50">
                          <HardDrive className="h-16 w-16 mb-4 text-slate-400" strokeWidth={1} />
                          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{t("noLogsFound")}</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>

               <div className="mt-14 flex justify-end">
                <Button onClick={() => save("Backup", backup, t("backup"))} className="rounded-2xl h-16 px-12 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-105 active:scale-95" disabled={updateSetting.isPending}>
                  <Save className="h-5 w-5 mr-4" /> {t("saveGeneralSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

           {/* Logs */}
          <TabsContent value="logs" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-8 mb-16">
                 <SectionHeader icon={History} title={t("systemLogs")} desc={t("adminLogsDesc")} color="text-[#f5b027]" />
                 <div className="flex gap-4">
                    <Select value={logFilter} onValueChange={(v) => setLogFilter(v as typeof logFilter)}>
                      <SelectTrigger className="w-52 h-14 rounded-2xl bg-slate-50 border-slate-200 font-black uppercase text-[10px] tracking-[0.2em] text-slate-900 px-8 shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 bg-white text-slate-900 shadow-xl">
                        <SelectItem value="all">{t("adminEverywhere")}</SelectItem>
                        <SelectItem value="admin">{t("adminOnly")}</SelectItem>
                        <SelectItem value="lottery_staff">{t("staffOnly")}</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-8 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[3px] before:bg-slate-200">
                {filteredLogs.map((log: any) => {
                  const isAdmin = log.action_type.includes('SETTINGS') || log.action_type.includes('USER');
                  return (
                    <div key={log.id} className="relative pl-16 group/log">
                      <div className={`absolute left-0 top-1 w-11 h-11 rounded-2xl flex items-center justify-center ring-[6px] ring-white z-10 transition-all group-hover/log:scale-110 shadow-lg border border-slate-200
                        ${isAdmin ? "bg-[#f5b027] text-white" : "bg-slate-100 text-slate-500"}`}>
                        {isAdmin ? <Shield className="h-5 w-5" /> : <ScrollText className="h-5 w-5" />}
                      </div>
                      <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all hover:shadow-xl hover:border-[#f5b027]/20 shadow-sm group-hover/log:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover/log:text-[#f5b027] transition-colors leading-none">{log.action_type}</p>
                          <span className="text-[10px] font-black text-slate-500 tabular-nums bg-white px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">
                          <span className="text-slate-900">{log.user_name}</span> {t("performedActionFromIp")} <span className="text-[#f5b027]">{log.details?.ip || t("unknown")}</span>
                        </p>
                        <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner group-hover/log:border-[#f5b027]/10 transition-colors">
                           <pre className="text-[10px] font-mono text-slate-500 group-hover/log:text-slate-600 transition-colors overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar-amber max-h-[150px]">
                             {JSON.stringify(log.details, null, 2)}
                           </pre>
                        </div>
                        <p className="text-[9px] text-right mt-4 text-slate-600 font-black tracking-[0.3em] tabular-nums uppercase">
                          {new Date(log.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {filteredLogs.length === 0 && (
                   <div className="text-center py-28 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 italic font-black text-[11px] uppercase tracking-[0.4em]">
                      {t("adminNoLogsMatching")}
                   </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </AdminLayout>
  );
}

