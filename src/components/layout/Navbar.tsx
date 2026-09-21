import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) => {
    return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  const getMobileNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) => {
    return `block w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ========================================
            TOP BAR
        ======================================== */}

        <div className="flex min-h-16 items-center justify-between gap-4">
          {/* LOGO */}

          <NavLink
            to="/"
            onClick={closeMenu}
            className="group flex shrink-0 items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lg shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              ✈️
            </span>

            <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              <span className="sm:inline">Travel Planner</span>
            </span>
          </NavLink>

          {/* ========================================
              DESKTOP NAVIGATION
          ======================================== */}

          <div className="hidden items-center gap-1 sm:flex sm:gap-2">
            <NavLink
              to="/"
              end
              className={getNavLinkClass}
            >
              Home
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink
                  to="/plan-trip"
                  className={getNavLinkClass}
                >
                  Plan Trip
                </NavLink>

                <NavLink
                  to="/saved-trips"
                  className={getNavLinkClass}
                >
                  Saved Trips
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className={getNavLinkClass}
                >
                  Dashboard
                </NavLink>

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

          {/* ========================================
              MOBILE MENU BUTTON
          ======================================== */}

          <button
            type="button"
            onClick={() =>
              setIsMenuOpen((previous) => !previous)
            }
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50 sm:hidden"
          >
            {isMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>

        {/* ========================================
            MOBILE NAVIGATION
        ======================================== */}

        {isMenuOpen && (
          <div className="border-t border-slate-200 py-3 sm:hidden">
            <div className="space-y-1">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={getMobileNavLinkClass}
              >
                Home
              </NavLink>

              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/plan-trip"
                    onClick={closeMenu}
                    className={getMobileNavLinkClass}
                  >
                    ✈️ Plan Trip
                  </NavLink>

                  <NavLink
                    to="/saved-trips"
                    onClick={closeMenu}
                    className={getMobileNavLinkClass}
                  >
                    🧳 Saved Trips
                  </NavLink>

                  <NavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className={getMobileNavLinkClass}
                  >
                    📊 Dashboard
                  </NavLink>

                  <div className="my-2 border-t border-slate-200" />

                  <div className="px-4 py-2">
                    <p className="truncate text-sm font-medium text-slate-600">
                      {user?.name || user?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className={getMobileNavLinkClass}
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="block w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;