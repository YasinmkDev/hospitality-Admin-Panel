import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { lightTheme } from "@/lib/theme";
import AdminLayout from "@/components/layout/AdminLayout";
import Login from "./pages/Login";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Floors from "./pages/Floors";
import Rooms from "./pages/Rooms";
import RoomLayout from "./pages/RoomLayout";
import Beds from "./pages/Beds";
import RoomTypes from "./pages/RoomTypes";
import RoomFeatures from "./pages/RoomFeatures";
import RoomProducts from "./pages/RoomProducts";
import RoomRates from "./pages/RoomRates";
import Seasons from "./pages/Seasons";
import Reservations from "./pages/Reservations";
import ReservationsDnr from "./pages/ReservationsDnr";
import Housekeeping from "./pages/Housekeeping";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={lightTheme}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/forgot-password" element={<Login />} />
            <Route path="/reset-password" element={<Login />} />
            <Route element={<AuthGuard><AdminLayout /></AuthGuard>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/floors" element={<Floors />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/layout" element={<RoomLayout />} />
              <Route path="/beds" element={<Beds />} />
              <Route path="/room-types" element={<RoomTypes />} />
              <Route path="/room-features" element={<RoomFeatures />} />
              <Route path="/room-products" element={<RoomProducts />} />
              <Route path="/room-rates" element={<RoomRates />} />
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/reservations/dnr" element={<ReservationsDnr />} />
              <Route path="/housekeeping" element={<Housekeeping />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
