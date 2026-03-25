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
import {
  Settings, Shield, Ticket, Power, ScrollText, Bell, Database,
  Save, Upload, RotateCcw, Download, Trash2, FileDown,
} from "lucide-react";

interface GeneralSettings {
  platformName: string;
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
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

type LogEntry = { id: string; timestamp: string; actor: string; action: string; type: "admin" | "lottery_staff" };

const defaultGeneral: GeneralSettings = {
  platformName: "Gech (ጌች)",
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
  ticketPrice: 25,
  maxTicketsPerUser: 5,
  drawFrequency: "weekly",
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

const demoLogs: LogEntry[] = [
  { id: "1", timestamp: "2026-03-25 14:32", actor: "Admin User", action: "Updated lottery ticket price to $25", type: "admin" },
  { id: "2", timestamp: "2026-03-25 13:15", actor: "Lottery Staff", action: "Verified payment PAY-2903", type: "lottery_staff" },
  { id: "3", timestamp: "2026-03-24 18:40", actor: "Admin User", action: "Disabled user registration", type: "admin" },
  { id: "4", timestamp: "2026-03-24 16:10", actor: "Lottery Staff", action: "Generated lottery numbers for Draw #18", type: "lottery_staff" },
  { id: "5", timestamp: "2026-03-24 09:00", actor: "Admin User", action: "Enabled maintenance mode", type: "admin" },
];

function load<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function AdminSettings() {
  const { toast } = useToast();

  const [general, setGeneral] = useState<GeneralSettings>(() => load("gech-general", defaultGeneral));
  const [security, setSecurity] = useState<SecuritySettings>(() => load("gech-security", defaultSecurity));
  const [lottery, setLottery] = useState<LotterySettings>(() => load("gech-lottery-settings", defaultLottery));
  const [operational, setOperational] = useState<OperationalSettings>(() => load("gech-operational", defaultOperational));
  const [notifications, setNotifications] = useState<NotificationSettings>(() => load("gech-notifications", defaultNotifications));
  const [backup, setBackup] = useState<BackupSettings>(() => load("gech-backup", defaultBackup));
  const [logFilter, setLogFilter] = useState<"all" | "admin" | "lottery_staff">("all");

  const save = (key: string, data: unknown, label: string) => {
    persist(key, data);
    toast({ title: "Settings saved", description: `${label} settings updated successfully.` });
    window.dispatchEvent(new CustomEvent("settings-updated", { detail: key }));
  };

  const filteredLogs = logFilter === "all" ? demoLogs : demoLogs.filter((l) => l.type === logFilter);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage platform configuration and operational controls.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted p-1 rounded-xl">
          <TabsTrigger value="general" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" /> General</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="lottery" className="gap-1.5 text-xs"><Ticket className="h-3.5 w-3.5" /> Lottery</TabsTrigger>
          <TabsTrigger value="operational" className="gap-1.5 text-xs"><Power className="h-3.5 w-3.5" /> Operations</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5 text-xs"><ScrollText className="h-3.5 w-3.5" /> Logs</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="backup" className="gap-1.5 text-xs"><Database className="h-3.5 w-3.5" /> Backup</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-card-foreground">General System Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input value={general.platformName} onChange={(e) => setGeneral({ ...general, platformName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <label className="flex items-center justify-center border-2 border-dashed border-input rounded-lg p-4 cursor-pointer hover:border-accent transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Upload logo</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select value={general.defaultCurrency} onValueChange={(v) => setGeneral({ ...general, defaultCurrency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select value={general.defaultLanguage} onValueChange={(v) => setGeneral({ ...general, defaultLanguage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">Amharic (አማርኛ)</SelectItem>
                    <SelectItem value="om">Afaan Oromoo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={general.timezone} onValueChange={(v) => setGeneral({ ...general, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={general.dateFormat} onValueChange={(v) => setGeneral({ ...general, dateFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => save("gech-general", general, "General")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-card-foreground">Security & Access</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Enable User Registration</p>
                  <p className="text-xs text-muted-foreground">Allow new users to create accounts</p>
                </div>
                <Switch checked={security.registrationEnabled} onCheckedChange={(v) => setSecurity({ ...security, registrationEnabled: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input type="number" min={6} max={32} value={security.minPasswordLength} onChange={(e) => setSecurity({ ...security, minPasswordLength: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" min={5} max={1440} value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Require Uppercase Characters</p>
                  <p className="text-xs text-muted-foreground">Password must contain at least one uppercase letter</p>
                </div>
                <Switch checked={security.requireUppercase} onCheckedChange={(v) => setSecurity({ ...security, requireUppercase: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Require Numbers</p>
                  <p className="text-xs text-muted-foreground">Password must contain at least one digit</p>
                </div>
                <Switch checked={security.requireNumbers} onCheckedChange={(v) => setSecurity({ ...security, requireNumbers: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Allow Multi-Login</p>
                  <p className="text-xs text-muted-foreground">Allow same account to be logged in on multiple devices</p>
                </div>
                <Switch checked={security.multiLoginEnabled} onCheckedChange={(v) => setSecurity({ ...security, multiLoginEnabled: v })} />
              </div>
            </div>
            <Button onClick={() => save("gech-security", security, "Security")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Security Settings
            </Button>
          </div>
        </TabsContent>

        {/* Lottery */}
        <TabsContent value="lottery">
          <div className="space-y-6">
            {/* Module toggle */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-card-foreground">Lottery Module</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    When disabled, users cannot view lottery, buy tickets, or upload payments. Staff cannot verify or generate numbers. Admin retains view access.
                  </p>
                </div>
                <Switch checked={lottery.moduleEnabled} onCheckedChange={(v) => setLottery({ ...lottery, moduleEnabled: v })} />
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-card-foreground">Lottery Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ticket Price</Label>
                  <Input type="number" min={1} value={lottery.ticketPrice} onChange={(e) => setLottery({ ...lottery, ticketPrice: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Tickets per User</Label>
                  <Input type="number" min={1} max={20} value={lottery.maxTicketsPerUser} onChange={(e) => setLottery({ ...lottery, maxTicketsPerUser: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Draw Frequency</Label>
                  <Select value={lottery.drawFrequency} onValueChange={(v) => setLottery({ ...lottery, drawFrequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number Range (Min)</Label>
                  <Input type="number" min={1} value={lottery.numberRangeMin} onChange={(e) => setLottery({ ...lottery, numberRangeMin: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Number Range (Max)</Label>
                  <Input type="number" min={1} value={lottery.numberRangeMax} onChange={(e) => setLottery({ ...lottery, numberRangeMax: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Auto-Close Before Draw (min)</Label>
                  <Input type="number" min={0} value={lottery.autoCloseMinutes} onChange={(e) => setLottery({ ...lottery, autoCloseMinutes: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            {/* Staff Permissions */}
            <div className="bg-card rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-card-foreground">Lottery Staff Permissions</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Payment Verification</p>
                  <p className="text-xs text-muted-foreground">Allow staff to verify/reject payments</p>
                </div>
                <Switch checked={lottery.staffPaymentVerification} onCheckedChange={(v) => setLottery({ ...lottery, staffPaymentVerification: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Number Generation</p>
                  <p className="text-xs text-muted-foreground">Allow staff to generate lottery numbers</p>
                </div>
                <Switch checked={lottery.staffNumberGeneration} onCheckedChange={(v) => setLottery({ ...lottery, staffNumberGeneration: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Admin Override</p>
                  <p className="text-xs text-muted-foreground">Allow admin to override staff decisions</p>
                </div>
                <Switch checked={lottery.adminOverride} onCheckedChange={(v) => setLottery({ ...lottery, adminOverride: v })} />
              </div>
            </div>

            <Button onClick={() => save("gech-lottery-settings", lottery, "Lottery")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Lottery Settings
            </Button>
          </div>
        </TabsContent>

        {/* Operational */}
        <TabsContent value="operational">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-card-foreground">Operational Controls</h2>
            <p className="text-xs text-muted-foreground">Master switches for emergency shutdown or audits.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Enable Entire Platform</p>
                  <p className="text-xs text-muted-foreground">Turning off shuts down the entire platform for all users</p>
                </div>
                <Switch checked={operational.platformEnabled} onCheckedChange={(v) => setOperational({ ...operational, platformEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Lottery Module</p>
                </div>
                <Switch checked={operational.lotteryModuleEnabled} onCheckedChange={(v) => setOperational({ ...operational, lotteryModuleEnabled: v })} />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Mode Message</Label>
                <Textarea
                  placeholder="We're currently performing scheduled maintenance. Please check back later."
                  value={operational.maintenanceMessage}
                  onChange={(e) => setOperational({ ...operational, maintenanceMessage: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <Button onClick={() => save("gech-operational", operational, "Operational")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Operational Settings
            </Button>
          </div>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-semibold text-card-foreground">System Logs</h2>
              <div className="flex gap-2">
                <Select value={logFilter} onValueChange={(v) => setLogFilter(v as typeof logFilter)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="lottery_staff">Staff Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileDown className="h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {log.actor} · {log.timestamp}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.type === "admin" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                    {log.type === "admin" ? "Admin" : "Staff"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-card-foreground">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send email alerts to users and admins</p>
                </div>
                <Switch checked={notifications.emailEnabled} onCheckedChange={(v) => setNotifications({ ...notifications, emailEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Send SMS alerts for critical events</p>
                </div>
                <Switch checked={notifications.smsEnabled} onCheckedChange={(v) => setNotifications({ ...notifications, smsEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Large Payment Alerts</p>
                  <p className="text-xs text-muted-foreground">Alert admin for payments above threshold</p>
                </div>
                <Switch checked={notifications.adminAlertLargePayment} onCheckedChange={(v) => setNotifications({ ...notifications, adminAlertLargePayment: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Suspicious Activity Alerts</p>
                  <p className="text-xs text-muted-foreground">Alert admin when suspicious behavior detected</p>
                </div>
                <Switch checked={notifications.adminAlertSuspicious} onCheckedChange={(v) => setNotifications({ ...notifications, adminAlertSuspicious: v })} />
              </div>
            </div>
            <Button onClick={() => save("gech-notifications", notifications, "Notification")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Notification Settings
            </Button>
          </div>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup">
          <div className="bg-card rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-card-foreground">Backup & Recovery</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select value={backup.backupFrequency} onValueChange={(v) => setBackup({ ...backup, backupFrequency: v })}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-1.5" onClick={() => toast({ title: "Backup started", description: "Manual backup has been initiated." })}>
                  <Database className="h-4 w-4" /> Trigger Manual Backup
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <RotateCcw className="h-4 w-4" /> Restore from Backup
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Download className="h-4 w-4" /> Download Latest Backup
                </Button>
              </div>
            </div>
            <Button onClick={() => save("gech-backup", backup, "Backup")} className="gap-1.5">
              <Save className="h-4 w-4" /> Save Backup Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
