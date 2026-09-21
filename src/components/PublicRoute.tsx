import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  /*
   * Password reset is a special case.
   *
   * Supabase creates a temporary authenticated
   * session when the user clicks the reset link.
   *
   * Therefore, we must allow /reset-password
   * even when isLoggedIn is true.
   */

  if (location.pathname === "/reset-password") {
    return <Outlet />;
  }

  /*
   * Normal public pages such as Login and Signup
   * should redirect logged-in users to Dashboard.
   */

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;