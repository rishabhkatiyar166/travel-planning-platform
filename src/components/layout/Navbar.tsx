import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  const handleDashboardClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* ========================================
            LOGO
        ======================================== */}

        <NavLink to="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
            ✈️
          </span>

          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline sm:text-xl">
            Travel Planner
          </span>
        </NavLink>

        {/* ========================================
            NAVIGATION
        ======================================== */}

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${getNavLinkClass({ isActive })} hidden sm:inline-flex`
            }
          >
            Home
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/plan-trip" className={getNavLinkClass}>
                <span className="sm:hidden">Plan</span>
                <span className="hidden sm:inline">Plan Trip</span>
              </NavLink>

              <NavLink
                to="/saved-trips"
                className={({ isActive }) =>
                  `${getNavLinkClass({ isActive })} hidden md:inline-flex`
                }
              >
                Saved Trips
              </NavLink>

              <button
                type="button"
                onClick={handleDashboardClick}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
              >
                Dashboard
              </button>

              <div className="ml-1 hidden h-8 w-px bg-slate-200 lg:block" />

              <span
                className="hidden max-w-40 truncate rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 lg:block"
                title={user?.name || user?.email}
              >
                {user?.name || user?.email}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-lg border px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                    isActive
                      ? "border-slate-900 bg-slate-100 text-slate-900"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition sm:px-4 ${
                    isActive
                      ? "bg-slate-700"
                      : "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                  }`
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
