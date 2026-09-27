import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/layout/Navbar";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const PlanTrip = lazy(() => import("./pages/PlanTrip"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SavedTrips = lazy(() => import("./pages/SavedTrips"));
const TripDetails = lazy(() => import("./pages/TripDetails"));
const EditTrip = lazy(() => import("./pages/EditTrip"));
const DestinationPlaces = lazy(() => import("./pages/DestinationPlaces"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-sm text-slate-500">
                Loading...
              </div>
            </div>
          }
        >
          <Routes>
            {/* ========================================
                PUBLIC ROUTES
            ======================================== */}

            <Route path="/" element={<Home />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />

              <Route path="/signup" element={<Signup />} />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />
            </Route>

            {/* ========================================
                PROTECTED ROUTES
            ======================================== */}

            <Route element={<ProtectedRoute />}>
              <Route path="/plan-trip" element={<PlanTrip />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/saved-trips" element={<SavedTrips />} />

              <Route
                path="/saved-trips/:id"
                element={<TripDetails />}
              />

              <Route
                path="/saved-trips/:id/edit"
                element={<EditTrip />}
              />

              <Route
                path="/destination-places"
                element={<DestinationPlaces />}
              />
            </Route>

            {/* ========================================
                404 ROUTE
            ======================================== */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;