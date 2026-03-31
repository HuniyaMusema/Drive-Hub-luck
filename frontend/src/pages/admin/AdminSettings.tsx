import { useState, useEffect } from "react";
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
        toast({ title: "Settings saved", description: `${label} settings updated successfully.` });
        if (key === "General" && data.defaultLanguage) setLanguage(data.defaultLanguage);
      },
      onError: (err: any) => {
        toast({ title: "Save failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleCreateBackup = () => {
    toast({ title: "Starting Backup", description: "Triggering manual database backup..." });
    createBackupMutation.mutate(undefined, {
      onSuccess: () => toast({ title: "Backup Finalized", description: "Remote SQL dump created successfully." }),
      onError: (err: any) => toast({ title: "Backup error", description: err.message, variant: "destructive" })
    });
  };

  const filteredLogs = logFilter === "all" ? auditLogs : auditLogs.filter((l: any) => {
    if (logFilter === "admin") return l.action_type !== "PAYMENT_VERIFIED"; 
    return l.action_type === "PAYMENT_VERIFIED";
  });

  const SectionHeader = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
        <Icon className="h-6 w-6 text-primary" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground font-medium">{desc}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary/20">
            <Sparkles className="h-3 w-3" /> system core
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t("settings")}</h1>
          <p className="text-sm text-muted-foreground font-medium">Fine-tune your platform experience and operational parameters.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-8 animate-fade-in-up">
        <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/40 w-fit flex flex-wrap gap-1 shadow-sm backdrop-blur-sm">
          <TabsTrigger value="general" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Settings className="h-4 w-4" /> {t("general")}</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Shield className="h-4 w-4" /> {t("security")}</TabsTrigger>
          <TabsTrigger value="lottery" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Ticket className="h-4 w-4" /> {t("lottery")}</TabsTrigger>
          <TabsTrigger value="operational" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Power className="h-4 w-4" /> {t("operational")}</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Bell className="h-4 w-4" /> {t("notifications")}</TabsTrigger>
          <TabsTrigger value="backup" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><Database className="h-4 w-4" /> {t("backup")}</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"><ScrollText className="h-4 w-4" /> {t("logs")}</TabsTrigger>
        </TabsList>

        <div className="max-w-4xl">
          {/* General */}
          <TabsContent value="general" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60 relative overflow-hidden">
              <SectionHeader icon={Globe} title={t("generalSettings")} desc="Base configuration for your platform presence." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("platformName")}</Label>
                    <Input className="rounded-xl h-12 bg-muted/20 border-border/60" value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("defaultLanguage")}</Label>
                    <Select value={general.defaultLanguage} onValueChange={(v) => setGeneral({ ...general, defaultLanguage: v })}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/60 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-border/60">
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="am">🇪🇹 Amharic (አማርኛ)</SelectItem>
                        <SelectItem value="om">🇪🇹 Afaan Oromoo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("defaultCurrency")}</Label>
                    <div className="flex gap-2">
                      <Select value={general.defaultCurrency} onValueChange={(v) => setGeneral({ ...general, defaultCurrency: v })}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/60 font-bold tabular-nums"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/60">
                           <SelectItem value="ETB">ETB (Birr)</SelectItem>
                           <SelectItem value="USD">USD (Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("dateFormat")}</Label>
                    <Select value={general.dateFormat} onValueChange={(v) => setGeneral({ ...general, dateFormat: v })}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/60 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/60">
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-border/60 space-y-6">
                <div className="flex items-center gap-3">
                  <Landmark className="h-5 w-5 text-primary opacity-50" />
                  <h3 className="font-bold text-foreground">{t("contactInformation")}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3" /> {t("contactEmail")}</Label>
                    <Input className="rounded-xl h-11 bg-muted/10 border-border/60" type="email" value={general.contactEmail || ""} onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {t("contactPhone")}</Label>
                    <Input className="rounded-xl h-11 bg-muted/10 border-border/60" value={general.contactPhone || ""} onChange={(e) => setGeneral({ ...general, contactPhone: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><MapPin className="h-3 w-3" /> {t("physicalAddress")}</Label>
                    <Input className="rounded-xl h-11 bg-muted/10 border-border/60" value={general.contactAddress || ""} onChange={(e) => setGeneral({ ...general, contactAddress: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => save("General", general, t("general"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20 hover:scale-105 transition-all" disabled={updateSetting.isPending}>
                  {updateSetting.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : <><Save className="h-4 w-4 mr-2" /> {t("saveGeneralSettings")}</>}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <SectionHeader icon={Lock} title={t("securityAccess")} desc="Enforce password policies and session behavior." />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/40 group hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{t("enableRegistration")}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t("registrationDesc")}</p>
                    </div>
                  </div>
                  <Switch checked={security.registrationEnabled} onCheckedChange={(v) => setSecurity({ ...security, registrationEnabled: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("minPasswordLength")}</Label>
                    <Input type="number" min={6} className="rounded-xl h-12 bg-muted/20 border-border/60 font-bold tabular-nums" value={security.minPasswordLength} onChange={(e) => setSecurity({ ...security, minPasswordLength: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("sessionTimeout")} (min)</Label>
                    <Input type="number" min={5} className="rounded-xl h-12 bg-muted/20 border-border/60 font-bold tabular-nums" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {[
                    { label: t("requireUppercase"), desc: t("uppercaseDesc"), key: "requireUppercase" },
                    { label: t("requireNumbers"), desc: t("numbersDesc"), key: "requireNumbers" },
                    { label: t("allowMultiLogin"), desc: t("multiLoginDesc"), key: "multiLoginEnabled" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/10 transition-colors">
                       <div>
                         <p className="text-sm font-bold text-foreground">{item.label}</p>
                         <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                       </div>
                       <Switch checked={(security as any)[item.key]} onCheckedChange={(v) => setSecurity({ ...security, [item.key]: v })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => save("Security", security, t("security"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" disabled={updateSetting.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {t("saveSecuritySettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Lottery */}
          <TabsContent value="lottery" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <SectionHeader icon={Ticket} title={t("lotteryConfiguration")} desc="Core mechanics and pricing for your car lotteries." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                  <Label className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1 block">{t("ticketPrice")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                    <Input type="number" className="pl-6 h-12 bg-transparent border-none text-xl font-extrabold tabular-nums focus-visible:ring-0" value={lottery.ticketPrice} onChange={(e) => setLottery({ ...lottery, ticketPrice: Number(e.target.value) })} />
                  </div>
                </div>
                
                <div className="space-y-2 p-5 bg-card rounded-2xl border border-border/60">
                   <Label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1 block">Max Tickets/User</Label>
                   <Input type="number" className="h-10 bg-muted/20 border-border/60 font-bold tabular-nums rounded-xl" value={lottery.maxTicketsPerUser} onChange={(e) => setLottery({ ...lottery, maxTicketsPerUser: Number(e.target.value) })} />
                </div>

                <div className="space-y-2 p-5 bg-card rounded-2xl border border-border/60">
                  <Label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1 block">{t("drawFrequency")}</Label>
                  <Select value={lottery.drawFrequency} onValueChange={(v) => setLottery({ ...lottery, drawFrequency: v })}>
                    <SelectTrigger className="h-10 bg-muted/20 border-border/60 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="manual">Manual (Staff Triggered)</SelectItem>
                      <SelectItem value="weekly">Weekly Automatic</SelectItem>
                      <SelectItem value="daily">Daily Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest px-1">{t("staffPermissions")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Can Verify Payments", key: "staffPaymentVerification" },
                    { label: "Can Generate Numbers", key: "staffNumberGeneration" },
                    { label: "Admin Can Override Staff", key: "adminOverride" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/10 transition-colors">
                      <p className="text-xs font-bold text-foreground">{item.label}</p>
                      <Switch checked={(lottery as any)[item.key]} onCheckedChange={(v) => setLottery({ ...lottery, [item.key]: v })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => save("Lottery", lottery, t("lottery"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" disabled={updateSetting.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {t("saveLotterySettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Operational */}
          <TabsContent value="operational" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <SectionHeader icon={Power} title={t("operationalControls")} desc="High-level platform switches and maintenance mode." />
              
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20 relative overflow-hidden group transition-all hover:bg-destructive/10">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform shadow-inner">
                        <Power className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-destructive">{t("enableEntirePlatform")}</p>
                        <p className="text-xs font-medium text-muted-foreground max-w-md">{t("platformShutdownDesc")}</p>
                      </div>
                    </div>
                    <Switch checked={operational.platformEnabled} onCheckedChange={(v) => setOperational({ ...operational, platformEnabled: v })} />
                  </div>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Lottery Engine", desc: "Toggle ticketing and draws", key: "lotteryModuleEnabled" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 rounded-2xl border border-border/40 hover:border-primary/20 transition-all">
                       <div>
                         <p className="text-sm font-bold text-foreground">{item.label}</p>
                         <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                       </div>
                       <Switch checked={(operational as any)[item.key]} onCheckedChange={(v) => setOperational({ ...operational, [item.key]: v })} />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <Textarea className="h-4 w-4 text-primary opacity-50" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("maintenanceMessageLabel")}</Label>
                  </div>
                  <Textarea
                    placeholder="We're currently performing scheduled maintenance. Please check back later."
                    className="rounded-2xl border-border/60 min-h-[100px] bg-muted/10 p-5 text-sm font-medium focus:ring-primary/20"
                    value={operational.maintenanceMessage}
                    onChange={(e) => setOperational({ ...operational, maintenanceMessage: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => save("Operational", operational, t("operational"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" disabled={updateSetting.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {t("saveOperationalSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <SectionHeader icon={Bell} title={t("notificationSettings")} desc="Control how and when admins and users are alerted." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Email Engine", icon: Mail, key: "emailEnabled" },
                  { label: "SMS Gateway", icon: Smartphone, key: "smsEnabled" },
                  { label: "Large Payment Alerts", icon: Landmark, key: "adminAlertLargePayment" },
                  { label: "Security/Suspicious Alerts", icon: Shield, key: "adminAlertSuspicious" }
                ].map((item) => (
                  <div key={item.key} className="p-5 rounded-2xl border border-border/40 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                    </div>
                    <Switch checked={(notifications as any)[item.key]} onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <Button onClick={() => save("Notifications", notifications, t("notifications"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" disabled={updateSetting.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {t("saveNotificationSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Backup */}
          <TabsContent value="backup" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <SectionHeader icon={HardDrive} title={t("backupRecovery")} desc="Secure your data with cloud snapshots and manual dumps." />
              
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t("backupFrequency")}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto-snapshot schedule</p>
                    </div>
                  </div>
                  <Select value={backup.backupFrequency} onValueChange={(v) => setBackup({ ...backup, backupFrequency: v })}>
                    <SelectTrigger className="w-32 h-10 rounded-xl bg-card border-border/60 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 rounded-2xl border-border/60 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all font-bold" onClick={handleCreateBackup} disabled={createBackupMutation.isPending}>
                    {createBackupMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCcw className="h-5 w-5" />}
                    <span>{t("manualBackup")}</span>
                  </Button>
                  <Button variant="outline" className="h-20 rounded-2xl border-border/60 flex flex-col items-center justify-center gap-2 hover:bg-accent/5 hover:border-accent/40 transition-all font-bold opacity-50 cursor-not-allowed">
                    <RotateCcw className="h-5 w-5" />
                    <span>Rollback System</span>
                  </Button>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest font-display">{t("remoteSnapshots")}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold">AWS S3 / DigitalOcean Spaces</p>
                   </div>
                   <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                     {backups.map((b: any) => (
                       <div key={b.file} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/10 transition-colors group">
                         <div className="flex items-center gap-3">
                           <HardDrive className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                           <span className="font-mono text-[11px] font-bold text-foreground truncate max-w-[200px]">{b.file}</span>
                           <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted font-bold tracking-tighter tabular-nums">{Math.round(b.size / 1024)} KB</span>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                           <Download className="h-4 w-4" />
                         </Button>
                       </div>
                     ))}
                     {backups.length === 0 && (
                       <div className="flex flex-col items-center justify-center py-10 opacity-30">
                          <HardDrive className="h-10 w-10 mb-2" strokeWidth={1} />
                          <p className="text-xs font-bold uppercase tracking-widest italic">{t("noLogsFound")}</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => save("Backup", backup, t("backup"))} className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" disabled={updateSetting.isPending}>
                  <Save className="h-4 w-4 mr-2" /> {t("saveBackupSettings")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs" className="space-y-6 outline-none">
            <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5 border border-border/60">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                 <SectionHeader icon={History} title={t("systemLogs")} desc="Audit trail of critical administrative and staff actions." />
                 <div className="flex gap-2">
                    <Select value={logFilter} onValueChange={(v) => setLogFilter(v as typeof logFilter)}>
                      <SelectTrigger className="w-[160px] h-9 rounded-xl bg-muted/20 border-border/60 font-bold text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">Everywhere</SelectItem>
                        <SelectItem value="admin">Admin Only</SelectItem>
                        <SelectItem value="lottery_staff">Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
                {filteredLogs.map((log: any) => {
                  const isAdmin = log.action_type.includes('SETTINGS') || log.action_type.includes('USER');
                  return (
                    <div key={log.id} className="relative pl-10 group">
                      <div className={`absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-card z-10 transition-transform group-hover:scale-110 shadow-sm
                        ${isAdmin ? "bg-purple-500/10 text-purple-600" : "bg-primary/10 text-primary"}`}>
                        {isAdmin ? <Shield className="h-4 w-4" /> : <ScrollText className="h-4 w-4" />}
                      </div>
                      <div className="p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/10 transition-all hover:shadow-md hover:scale-[1.01]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">{log.action_type}</p>
                          <span className="text-[10px] font-bold text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded-full">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-3">
                          <span className="text-foreground font-bold">{log.user_name}</span> performed action from IP {log.details?.ip || "unknown"}
                        </p>
                        <div className="p-3 bg-black/5 rounded-xl border border-border/30 overflow-hidden">
                           <pre className="text-[10px] font-mono text-muted-foreground/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                             {JSON.stringify(log.details, null, 2)}
                           </pre>
                        </div>
                        <p className="text-[10px] text-right mt-2 text-muted-foreground font-bold tracking-tighter tabular-nums uppercase">
                          {new Date(log.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {filteredLogs.length === 0 && (
                   <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed text-muted-foreground italic font-medium text-sm">
                      No logs matching your current filters.
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
