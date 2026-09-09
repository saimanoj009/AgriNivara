import { Navigate, Outlet } from "react-router-dom";
import { getAuthRole, isAuthenticated } from "../services/api";

export function ProtectedRoute({ role }: { role?: "user" | "admin" }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    const currentRole = getAuthRole();
    if (role && currentRole !== role) {
        return <Navigate to={currentRole === "admin" ? "/admin" : "/dashboard"} replace />;
    }
    return <Outlet />;
}
