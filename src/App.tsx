import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CarsForSale from "./pages/cars/CarsForSale";
import CarsForRent from "./pages/cars/CarsForRent";
import CarDetail from "./pages/cars/CarDetail";
import Lottery from "./pages/lottery/Lottery";
import LotterySelect from "./pages/lottery/LotterySelect";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminLottery from "./pages/admin/AdminLottery";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/lottery/select" element={<LotterySelect />} />
          <Route path="/payment" element={<Payment />} />

          {/* User */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/rentals" element={<AdminRentals />} />
          <Route path="/admin/lottery" element={<AdminLottery />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
