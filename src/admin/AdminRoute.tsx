import { Navigate, Outlet } from "react-router-dom";
import { USER_ROLE } from "@/constants/domain";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute() {
  const { user } = useAuth();
  return user?.role === USER_ROLE.ADMIN ? <Outlet /> : <Navigate to="/" replace />;
}
