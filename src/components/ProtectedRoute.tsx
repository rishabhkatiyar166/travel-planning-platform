import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute() {

  const {
    isLoggedIn,
    isAuthLoading,
  } = useAuth();


  /*
   * ========================================
   * WAIT FOR AUTH INITIALIZATION
   * ========================================
   *
   * When the browser refreshes, AuthContext
   * needs a moment to read localStorage.
   *
   * Don't redirect during that moment.
   */

  if (isAuthLoading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">

            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

          </div>


          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking your session...
          </p>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * NOT LOGGED IN
   * ========================================
   */

  if (!isLoggedIn) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /*
   * ========================================
   * LOGGED IN
   * ========================================
   */

  return <Outlet />;

}


export default ProtectedRoute;