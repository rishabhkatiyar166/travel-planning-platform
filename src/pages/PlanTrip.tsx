import EmptyState from "../components/ui/EmptyState";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addTrip,
  type Trip,
} from "../services/tripService";

interface LocationResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (location: LocationResult) => void;
}

function LocationSearch({
  id,
  label,
  value,
  placeholder,
  onChange,
  onSelect,
}: LocationSearchProps) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchText = value.trim();

    if (searchText.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchText,
          )}&count=5&language=en&format=json`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to search locations.");
        }

        const data = await response.json();

        setResults(data.results ?? []);
        setShowResults(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Location search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const formatLocation = (location: LocationResult) => {
    const parts = [
      location.name,
      location.admin1,
      location.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const handleSelect = (location: LocationResult) => {
    onSelect(location);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setShowResults(false);
            }, 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-11 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 placeholder:text-slate-400"
        />

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.map((location) => (
            <button
              key={location.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(location);
              }}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
            >
              <span className="mt-0.5 text-lg">📍</span>

              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {location.name}
                </span>

                <span className="mt-0.5 block truncate text-sm text-slate-500">
                  {formatLocation(location)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        !loading &&
        value.trim().length >= 2 &&
        results.length === 0 && (
          <div className="absolute z-50 mt-2 w-full">
            <EmptyState
              compact
              icon="📍"
              title="No locations found"
              description="Try a different city, landmark, or a more specific search."
            />
          </div>
        )}
    </div>
  );
}

function PlanTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    duration: "",
    budget: "",
    travelDate: "",
    travelers: "1",
  });

  const [error, setError] = useState("");

  const [selectedOrigin, setSelectedOrigin] =
    useState<LocationResult | null>(null);

  const [selectedDestination, setSelectedDestination] =
    useState<LocationResult | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (name === "origin") {
      setSelectedOrigin(null);
    }

    if (name === "destination") {
      setSelectedDestination(null);
    }
  };

  /*
   * ========================================
   * SUBMIT
   * ========================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    /*
     * LOGIN CHECK
     */

    if (!user) {
      navigate("/login");
      return;
    }

    /*
     * REQUIRED FIELD VALIDATION
     */

    if (
      !formData.origin.trim() ||
      !formData.destination.trim() ||
      !formData.duration ||
      !formData.budget ||
      !formData.travelDate ||
      !formData.travelers
    ) {
      setError("Please fill in all fields.");
      return;
    }

    /*
     * LOCATION VALIDATION
     */

    if (!selectedOrigin) {
      setError(
        "Please select your starting location from the search suggestions.",
      );
      return;
    }

    if (!selectedDestination) {
      setError(
        "Please select your destination from the search suggestions.",
      );
      return;
    }

    /*
     * SAME LOCATION VALIDATION
     */

    if (selectedOrigin.id === selectedDestination.id) {
      setError(
        "Starting location and destination cannot be the same.",
      );
      return;
    }

    if (
      formData.origin.trim().toLowerCase() ===
      formData.destination.trim().toLowerCase()
    ) {
      setError(
        "Starting location and destination cannot be the same.",
      );
      return;
    }

    /*
     * TRAVELERS VALIDATION
     */

    const travelers = Number(formData.travelers);

    if (
      !Number.isInteger(travelers) ||
      travelers < 1 ||
      travelers > 50
    ) {
      setError(
        "Number of travelers must be between 1 and 50.",
      );
      return;
    }

    /*
     * BUDGET VALIDATION
     */

    const budget = Number(formData.budget);

    if (!Number.isFinite(budget) || budget <= 0) {
      setError(
        "Please enter a valid budget greater than ₹0.",
      );
      return;
    }

    /*
     * ========================================
     * CREATE NEW TRIP
     * ========================================
     *
     * IMPORTANT:
     * Supabase generates the real ID.
     * Therefore we use id: 0 here.
     */

    const newTrip: Trip = {
      id: 0,

      origin: formData.origin.trim(),

      destination: formData.destination.trim(),

      duration: formData.duration,

      budget: `₹${budget.toLocaleString("en-IN")}`,

      travelDate: formData.travelDate,

      travelers,

      userEmail: user.email,

      originLatitude: selectedOrigin.latitude,

      originLongitude: selectedOrigin.longitude,

      destinationLatitude: selectedDestination.latitude,

      destinationLongitude: selectedDestination.longitude,

      itinerary: [],
    };

    /*
     * ========================================
     * SAVE TO SUPABASE
     * ========================================
     */

    try {
      const savedTrip = await addTrip(
        newTrip,
        user.id,
      );

      /*
       * ========================================
       * OPEN EXACT TRIP
       * ========================================
       */

      navigate(`/saved-trips/${savedTrip.id}`);
    } catch (error) {
      console.error("Create trip error:", error);

      setError(
        "Unable to create your trip. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Travel Planner
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Plan Your Trip
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Add your route, dates, travelers, and budget
                to create your travel plan.
              </p>
            </div>

            <div className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 sm:block">
              ✈️ Start planning
            </div>
          </div>
        </div>

        {/* FORM CARD */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
            >
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* ========================================
                ROUTE
            ======================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  01 · Route
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Where are you going?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and select both locations from the suggestions.
                </p>
              </div>

              {/* STARTING LOCATION */}

              <LocationSearch
                id="origin"
                label="Starting Location"
                value={formData.origin}
                placeholder="Search starting location..."
                onChange={(value) => {
                  setFormData((previousData) => ({
                    ...previousData,
                    origin: value,
                  }));

                  setSelectedOrigin(null);
                }}
                onSelect={(location) => {
                  setFormData((previousData) => ({
                    ...previousData,
                    origin: location.name,
                  }));

                  setSelectedOrigin(location);
                }}
              />

              {/* DESTINATION */}

              <div className="mt-5">
                <LocationSearch
                  id="destination"
                  label="Destination"
                  value={formData.destination}
                  placeholder="Search destination..."
                  onChange={(value) => {
                    setFormData((previousData) => ({
                      ...previousData,
                      destination: value,
                    }));

                    setSelectedDestination(null);
                  }}
                  onSelect={(location) => {
                    setFormData((previousData) => ({
                      ...previousData,
                      destination: location.name,
                    }));

                    setSelectedDestination(location);
                  }}
                />
              </div>
            </div>

            {/* ========================================
                DATE + TRAVELERS
            ======================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  02 · Schedule
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  When are you travelling?
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {/* TRAVEL DATE */}

                <div>
                  <label
                    htmlFor="travelDate"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Travel Date
                  </label>

                  <input
                    id="travelDate"
                    name="travelDate"
                    type="date"
                    value={formData.travelDate}
                    onChange={handleChange}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {/* TRAVELERS */}

                <div>
                  <label
                    htmlFor="travelers"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Number of Travelers
                  </label>

                  <input
                    id="travelers"
                    name="travelers"
                    type="number"
                    value={formData.travelers}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    placeholder="e.g. 2"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

              </div>
            </div>

            {/* ========================================
                DURATION
            ======================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  03 · Stay
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  How long will you stay?
                </h2>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Trip Duration
                </label>

                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={(event) =>
                    setFormData((previousData) => ({
                      ...previousData,
                      duration: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">
                    Select trip duration
                  </option>

                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="3 days">3 days</option>
                  <option value="4 days">4 days</option>
                  <option value="5 days">5 days</option>
                  <option value="6 days">6 days</option>
                  <option value="7 days">7 days</option>
                  <option value="10 days">10 days</option>
                  <option value="14 days">14 days</option>
                  <option value="custom">
                    More than 14 days
                  </option>
                </select>
              </div>
            </div>

            {/* ========================================
                BUDGET
            ======================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  04 · Budget
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  What is your estimated budget?
                </h2>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Estimated Budget
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₹
                  </span>

                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    min="1"
                    step="100"
                    placeholder="25000"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-9 pr-4 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Enter the total estimated budget for your trip.
                </p>
              </div>
            </div>

            {/* ========================================
                SELECTED LOCATIONS
            ======================================== */}

            {(selectedOrigin || selectedDestination) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Selected Locations
                </p>

                <div className="mt-4 space-y-4">

                  {/* ORIGIN */}

                  {selectedOrigin && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📍</span>

                      <div>
                        <p className="text-xs text-slate-500">
                          Starting Location
                        </p>

                        <p className="font-semibold text-slate-900">
                          {selectedOrigin.name}
                          {selectedOrigin.country
                            ? `, ${selectedOrigin.country}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Coordinates:{" "}
                          {selectedOrigin.latitude.toFixed(4)},{" "}
                          {selectedOrigin.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DESTINATION */}

                  {selectedDestination && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🏁</span>

                      <div>
                        <p className="text-xs text-slate-500">
                          Destination
                        </p>

                        <p className="font-semibold text-slate-900">
                          {selectedDestination.name}
                          {selectedDestination.country
                            ? `, ${selectedDestination.country}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Coordinates:{" "}
                          {selectedDestination.latitude.toFixed(4)},{" "}
                          {selectedDestination.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ========================================
                TRIP PREVIEW
            ======================================== */}

            {(formData.origin ||
              formData.destination ||
              formData.travelDate ||
              formData.travelers) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Trip Preview
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-slate-500">
                      Route
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formData.origin || "Starting point"} →{" "}
                      {formData.destination || "Destination"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formData.travelDate || "Not selected"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Travelers
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formData.travelers || "0"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Duration
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formData.duration || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Budget
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formData.budget
                        ? `₹${Number(formData.budget).toLocaleString(
                            "en-IN",
                          )}`
                        : "Not specified"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================
                BUTTONS
            ======================================== */}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">

              <button
                type="button"
                onClick={() => navigate("/saved-trips")}
                className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md sm:flex-1"
              >
                Create Trip
              </button>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

export default PlanTrip;