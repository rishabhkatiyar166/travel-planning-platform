import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./components/PublicRoute";

import Navbar from "./components/layout/Navbar";

import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SavedTrips from "./pages/SavedTrips";
import TripDetails from "./pages/TripDetails";
import EditTrip from "./pages/EditTrip";
import DestinationPlaces from "./pages/DestinationPlaces";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <Routes>
          {/* ========================================
              PUBLIC ROUTES
          ======================================== */}

          <Route path="/" element={<Home />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />

            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* ========================================
              PROTECTED ROUTES
          ======================================== */}

          <Route element={<ProtectedRoute />}>
            <Route path="/plan-trip" element={<PlanTrip />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/saved-trips" element={<SavedTrips />} />

            <Route path="/saved-trips/:id" element={<TripDetails />} />

            <Route path="/saved-trips/:id/edit" element={<EditTrip />} />

            <Route path="/destination-places" element={<DestinationPlaces />} />
          </Route>

          {/* ========================================
              404 ROUTE
          ======================================== */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
