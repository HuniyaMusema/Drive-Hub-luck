import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SavedCarsProvider } from "@/contexts/SavedCarsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useSettings } from "@/hooks/useSettings";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CarsForSale from "./pages/cars/CarsForSale";
import CarsForRent from "./pages/cars/CarsForRent";
import CarDetail from "./pages/cars/CarDetail";
import Lottery from "./pages/lottery/Lottery";
import LotterySelect from "./pages/lottery/LotterySelect";
import LotteryPayments from "./pages/lottery/LotteryPayments";
import GenerateLotteryNumbers from "./pages/lottery/GenerateLotteryNumbers";
import LotteryParticipants from "./pages/lottery/LotteryParticipants";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLottery from "./pages/admin/AdminLottery";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import Contact from "./pages/Contact";
import SavedCars from "./pages/SavedCars";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PlatformTitle = () => {
  const { settings } = useSettings();
  const platformName = settings?.General?.platformName || "Drive Hub";
  
  useEffect(() => {
    document.title = `${platformName} | Car Sales & Rentals`;
  }, [platformName]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
      <LanguageProvider>
      <AuthProvider>
      <SavedCarsProvider>
        <PlatformTitle />
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/cars/sale" element={<CarsForSale />} />
            <Route path="/cars/rent" element={<CarsForRent />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lottery/select" element={<LotterySelect />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/saved-cars" element={<SavedCars />} />

            {/* User */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user", "admin", "lottery_staff"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["user", "admin", "lottery_staff"]}><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={["user", "admin", "lottery_staff"]}><Notifications /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin", "lottery_staff"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/lottery" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLottery /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />

            {/* Admin + Lottery Staff */}
            <Route path="/admin/lottery-payments" element={<ProtectedRoute allowedRoles={["admin", "lottery_staff"]}><LotteryPayments /></ProtectedRoute>} />
            <Route path="/admin/generate-lottery" element={<ProtectedRoute allowedRoles={["admin", "lottery_staff"]}><GenerateLotteryNumbers /></ProtectedRoute>} />
            <Route path="/admin/lottery-participants" element={<ProtectedRoute allowedRoles={["admin", "lottery_staff"]}><LotteryParticipants /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </SavedCarsProvider>
      </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
);

export default App;
