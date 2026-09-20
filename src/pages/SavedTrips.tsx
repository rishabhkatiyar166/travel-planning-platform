import EmptyState from "../components/ui/EmptyState";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { SavedTripsSkeleton } from "../components/ui/Skeleton";

import { getUserTrips, deleteTrip, type Trip } from "../services/tripService";

import {
  getTripStatus,
  getTripCountdownText,
  formatTripDate,
} from "../utils/tripUtils";

function SavedTrips() {
  const navigate = useNavigate();

  const { user } = useAuth();

  /*
   * ========================================
   * TRIP STATE
   * ========================================
   */

  const [trips, setTrips] = useState<Trip[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * ========================================
   * SEARCH STATE
   * ========================================
   */

  const [searchQuery, setSearchQuery] = useState("");

  /*
   * ========================================
   * FILTER STATE
   * ========================================
   */

  const [searchParams, setSearchParams] = useSearchParams();

  const filterFromUrl = searchParams.get("filter");

  const initialFilter =
    filterFromUrl === "Upcoming" ||
    filterFromUrl === "Today" ||
    filterFromUrl === "Past"
      ? filterFromUrl
      : "All";

  const [tripFilter, setTripFilter] = useState(initialFilter);

  /*
   * ========================================
   * SORT STATE
   * ========================================
   */

  const [sortOption, setSortOption] = useState("Newest");

  /*
   * ========================================
   * LOAD USER TRIPS
   * ========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadTrips = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const userTrips = await getUserTrips(user.id);

        if (!mounted) {
          return;
        }

        setTrips(userTrips);
      } catch {
        if (!mounted) {
          return;
        }

        setError("Unable to load your trips. Please try again.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  /*
   * Keep the selected filter synchronized with
   * the URL query parameter.
   */
  useEffect(() => {
    const urlFilter = searchParams.get("filter");

    if (
      urlFilter === "Upcoming" ||
      urlFilter === "Today" ||
      urlFilter === "Past" ||
      urlFilter === "All"
    ) {
      setTripFilter(urlFilter);
    } else {
      setTripFilter("All");
    }
  }, [searchParams]);

  /*
   * ========================================
   * TRIP STATUS SUMMARY
   * ========================================
   */

  const tripStats = useMemo(() => {
    return {
      total: trips.length,
      upcoming: trips.filter(
        (trip) => getTripStatus(trip.travelDate) === "upcoming",
      ).length,
      today: trips.filter((trip) => getTripStatus(trip.travelDate) === "today")
        .length,
      completed: trips.filter(
        (trip) => getTripStatus(trip.travelDate) === "past",
      ).length,
    };
  }, [trips]);

  /*
   * ========================================
   * DELETE TRIP
   * ========================================
   */

  const handleDelete = async (tripId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const deleted = await deleteTrip(tripId, user.id);

      if (!deleted) {
        setError("Trip could not be deleted.");
        return;
      }

      const updatedTrips = await getUserTrips(user.id);

      setTrips(updatedTrips);
    } catch {
      setError("Unable to delete the trip. Please try again.");
    }
  };

  /*
   * ========================================
   * FILTERED + SORTED TRIPS
   * ========================================
   */

  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matchingTrips = trips.filter((trip) => {
      /*
       * ========================================
       * SEARCH
       * ========================================
       *
       * Search by:
       *
       * - Origin
       * - Destination
       * - Duration
       */

      const matchesSearch =
        !query ||
        trip.origin.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        trip.duration.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      /*
       * ========================================
       * TRIP DATE FILTER
       * ========================================
       */

      if (!trip.travelDate) {
        /*
         * Trips without a date are shown
         * only when "All" is selected.
         */

        return tripFilter === "All";
      }

      const status = getTripStatus(trip.travelDate);

      /*
       * ========================================
       * TODAY
       * ========================================
       */

      if (tripFilter === "Today") {
        return status === "today";
      }

      /*
       * ========================================
       * UPCOMING
       * ========================================
       *
       * Today's trip is also considered
       * upcoming for filtering purposes.
       */

      if (tripFilter === "Upcoming") {
        return status === "upcoming" || status === "today";
      }

      /*
       * ========================================
       * PAST
       * ========================================
       */

      if (tripFilter === "Past") {
        return status === "past";
      }

      /*
       * ========================================
       * ALL
       * ========================================
       */

      return true;
    });

    /*
     * ========================================
     * SORT TRIPS
     * ========================================
     *
     * Create a new array so the original
     * trips state is never mutated.
     */

    return [...matchingTrips].sort((a, b) => {
      /*
       * Trips without a travel date are
       * placed at the end for date sorting.
       */

      if (sortOption === "Newest" || sortOption === "Oldest") {
        if (!a.travelDate && !b.travelDate) {
          return 0;
        }

        if (!a.travelDate) {
          return 1;
        }

        if (!b.travelDate) {
          return -1;
        }

        const dateA = new Date(a.travelDate).getTime();

        const dateB = new Date(b.travelDate).getTime();

        if (sortOption === "Newest") {
          return dateB - dateA;
        }

        return dateA - dateB;
      }

      /*
       * Destination A-Z
       */

      if (sortOption === "Destination") {
        return a.destination.localeCompare(b.destination);
      }

      return 0;
    });
  }, [trips, searchQuery, tripFilter, sortOption]);

  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return (
      <main
        className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12"
        aria-busy="true"
      >
        <div className="mx-auto max-w-6xl">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <SavedTripsSkeleton />
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * MAIN UI
   * ========================================
   */

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* ========================================
            HEADER
        ======================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              My Trips
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Saved Trips
            </h1>

            <p className="mt-3 text-slate-600">
              View and manage all your saved travel plans.
            </p>
          </div>

          <Link
            to="/plan-trip"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
          >
            + Plan New Trip
          </Link>
        </div>

        {/* ========================================
            TRIP STATUS SUMMARY
        ======================================== */}

        {trips.length > 0 && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Trips
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {tripStats.total}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Saved travel plans
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🧳
                </div>
              </div>
            </div>

            {/* UPCOMING */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Upcoming Trips
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {tripStats.upcoming}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Trips planned ahead
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  ✈️
                </div>
              </div>
            </div>

            {/* TODAY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Trips Today
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {tripStats.today}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Journeys starting today
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                  🎉
                </div>
              </div>
            </div>

            {/* COMPLETED */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Trips
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {tripStats.completed}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Past travel plans
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  ✅
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================
            NO TRIPS AT ALL
        ======================================== */}

        {trips.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon="✈️"
              title="No saved trips"
              description="You haven't created any trips yet. Start by planning your first journey."
              action={
                <Link
                  to="/plan-trip"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Plan Your First Trip
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* ========================================
                SEARCH + FILTERS
            ======================================== */}

            <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                {/* SEARCH */}

                <div className="w-full lg:max-w-xl">
                  <label
                    htmlFor="tripSearch"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Search Trips
                  </label>

                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>

                    <input
                      id="tripSearch"
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by origin, destination, or duration..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                {/* FILTER */}

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Trip Status
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {["All", "Upcoming", "Today", "Past"].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setTripFilter(filter);

                          if (filter === "All") {
                            setSearchParams({});
                          } else {
                            setSearchParams({ filter });
                          }
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          tripFilter === filter
                            ? "bg-slate-900 text-white"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SORT */}

                <div className="w-full lg:w-auto">
                  <label
                    htmlFor="tripSort"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Sort By
                  </label>

                  <select
                    id="tripSort"
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 lg:min-w-48"
                  >
                    <option value="Newest">Newest Travel Date</option>

                    <option value="Oldest">Oldest Travel Date</option>

                    <option value="Destination">Destination A-Z</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ========================================
                RESULTS COUNT
            ======================================== */}

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredTrips.length}
                </span>{" "}
                {filteredTrips.length === 1 ? "trip" : "trips"}
                {tripFilter !== "All" && (
                  <>
                    {" "}
                    <span className="text-slate-400">· {tripFilter}</span>
                  </>
                )}
              </p>

              {(searchQuery || tripFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTripFilter("All");
                    setSearchParams({});
                  }}
                  className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* ========================================
                NO FILTER RESULTS
            ======================================== */}

            {filteredTrips.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  compact
                  icon="🔍"
                  title="No matching trips"
                  description="Try a different search or change the trip filter."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setTripFilter("All");
                        setSearchParams({});
                      }}
                      className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Show All Trips
                    </button>
                  }
                />
              </div>
            ) : (
              /* ========================================
                 TRIP GRID
              ======================================== */

              <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip) => {
                  /*
                   * Calculate status once for this trip.
                   */

                  const status = getTripStatus(trip.travelDate);

                  const countdown = getTripCountdownText(trip.travelDate);

                  return (
                    <div
                      key={trip.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* ========================================
                          ROUTE
                      ======================================== */}

                      <p className="text-sm font-medium text-slate-500">
                        Route
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        {trip.origin}
                        {" → "}
                        {trip.destination}
                      </h2>

                      {/* ========================================
                          TRIP DETAILS
                      ======================================== */}

                      <div className="mt-6 space-y-3">
                        {/* DURATION */}

                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-slate-500">
                            Duration
                          </span>

                          <span className="text-right text-sm font-semibold text-slate-800">
                            {trip.duration}
                          </span>
                        </div>

                        {/* TRAVEL DATE */}

                        {trip.travelDate && (
                          <div className="flex justify-between gap-4">
                            <span className="text-sm text-slate-500">
                              Travel Date
                            </span>

                            <span className="text-right text-sm font-semibold text-slate-800">
                              {formatTripDate(trip.travelDate)}
                            </span>
                          </div>
                        )}

                        {/* TRAVELERS */}

                        {trip.travelers !== undefined && (
                          <div className="flex justify-between gap-4">
                            <span className="text-sm text-slate-500">
                              Travelers
                            </span>

                            <span className="text-sm font-semibold text-slate-800">
                              {trip.travelers}
                            </span>
                          </div>
                        )}

                        {/* BUDGET */}

                        <div className="flex justify-between gap-4">
                          <span className="text-sm text-slate-500">Budget</span>

                          <span className="text-sm font-semibold text-slate-800">
                            {trip.budget}
                          </span>
                        </div>
                      </div>

                      {/* ========================================
                          TRIP STATUS + COUNTDOWN
                      ======================================== */}

                      {trip.travelDate && (
                        <div className="mt-5 space-y-2">
                          {status === "upcoming" && (
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              Upcoming
                            </span>
                          )}

                          {status === "today" && (
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Today 🎉
                            </span>
                          )}

                          {status === "past" && (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              Completed
                            </span>
                          )}

                          <p className="text-xs font-medium text-slate-500">
                            {countdown}
                          </p>
                        </div>
                      )}

                      {/* ========================================
                          ACTIONS
                      ======================================== */}

                      <div className="mt-6 flex flex-col gap-3">
                        {/* VIEW */}

                        <Link
                          to={`/saved-trips/${trip.id}`}
                          className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          View Trip
                        </Link>

                        {/* EDIT */}

                        <Link
                          to={`/saved-trips/${trip.id}/edit`}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit Trip
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => handleDelete(trip.id)}
                          className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete Trip
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default SavedTrips;
