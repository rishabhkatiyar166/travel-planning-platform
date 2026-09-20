import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserTrips,
  type Trip,
} from "../services/tripService";

const DASHBOARD_SKELETON_STATS = [0, 1, 2, 3] as const;

const RecentTripCard = memo(function RecentTripCard({
  trip,
}: {
  trip: Trip;
}) {
  const origin = trip.origin || "—";
  const destination = trip.destination || "—";
  const duration = trip.duration || "—";
  const budget = trip.budget || "—";
  const travelDate = trip.travelDate || null;

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:ring-offset-2 sm:p-6"
    >
      <p className="text-sm font-medium text-slate-500">Route</p>

      <h3 className="mt-2 break-words text-xl font-bold text-slate-900">
        {origin} → {destination}
      </h3>

      <dl className="mt-5 space-y-3">
        <div className="flex justify-between gap-4">
          <dt className="text-sm text-slate-500">Duration</dt>
          <dd className="break-words text-right text-sm font-semibold text-slate-800">
            {duration}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-sm text-slate-500">Budget</dt>
          <dd className="break-words text-right text-sm font-semibold text-slate-800">
            {budget}
          </dd>
        </div>

        {travelDate && (
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-slate-500">Date</dt>
            <dd className="break-words text-right text-sm font-semibold text-slate-800">
              {travelDate}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex gap-3">
        <Link
          to={`/saved-trips/${trip.id}`}
          aria-label={`View trip from ${origin} to ${destination}`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition motion-reduce:transition-none hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
        >
          View
        </Link>

        <Link
          to={`/saved-trips/${trip.id}/edit`}
          aria-label={`Edit trip from ${origin} to ${destination}`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition motion-reduce:transition-none hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
        >
          Edit
        </Link>
      </div>
    </div>
  );
});

function Dashboard() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const selectedTripId = searchParams.get("tripId");

  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  /*
   * ========================================
   * LOAD USER TRIPS
   * ========================================
   */

  /*
   * Keep authentication redirect separate from
   * trip loading so the data-loading effect only
   * responds to the logged-in user.
   */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  /*
   * Load trips only when the logged-in user changes.
   * Unrelated dashboard state does not retrigger this work.
   */
  useEffect(() => {
    let mounted = true;

    const loadTrips = async () => {
      if (!user) {
        if (mounted) {
          setTrips([]);
          setLoadError(false);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoading(true);
        setLoadError(false);
      }

      try {
        const userTrips = await getUserTrips(user.id);

        if (!mounted) {
          return;
        }

        setTrips(userTrips);
        setLoadError(false);
      } catch (error) {
        console.error("Load dashboard trips error:", error);

        if (!mounted) {
          return;
        }

        setTrips([]);
        setLoadError(true);
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
  }, [user, loadRetryKey]);

  /*
   * ========================================
   * LOAD ERROR
   * ========================================
   */

  if (!loading && loadError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <section
          aria-labelledby="dashboard-error-heading"
          aria-describedby="dashboard-error-description"
          className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8"
          role="alert"
        >
          {loading && (
            <p className="sr-only" role="status" aria-live="polite">
              Trying to load your trips again.
            </p>
          )}
          <h1 id="dashboard-error-heading" className="text-2xl font-bold text-slate-900">
            We couldn't load your trips
          </h1>
          <p id="dashboard-error-description" className="mt-3 text-slate-600">
            Your saved trip data could not be read. Try loading the dashboard again.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setLoadRetryKey((key) => key + 1)}
              aria-busy={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition motion-reduce:transition-none hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100 disabled:cursor-wait disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Trying Again…" : "Try Again"}
            </button>

            <Link
              to="/saved-trips"
              aria-label="Open your saved trips"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition motion-reduce:transition-none hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
            >
              View Saved Trips
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ========================================
   * SELECTED TRIP
   * ========================================
   */

  const selectedTrip = useMemo(
    () =>
      selectedTripId
        ? trips.find((trip) => trip.id.toString() === selectedTripId) ?? null
        : null,
    [selectedTripId, trips]
  );

  const selectedTripNotFound = Boolean(selectedTripId) && !selectedTrip;

  /*
   * ========================================
   * MOST RECENT TRIP
   * ========================================
   */

  const latestTrip = trips.length > 0 ? trips[0] : null;

  const totalTrips = trips.length;
  const hasTrips = totalTrips > 0;

  /*
   * Prepare the recent-trip list once per trips change
   * instead of sorting/copying it during every render.
   */
  const recentTrips = useMemo(
    () => trips.slice(0, 6),
    [trips]
  );

  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div
          className="mx-auto min-w-0 max-w-7xl"
          aria-busy="true"
          role="status"
          aria-live="polite"
          aria-label="Dashboard loading"
        >
          <p className="sr-only">Loading dashboard…</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div aria-hidden="true" className="h-4 w-24 motion-reduce:animate-none animate-pulse rounded bg-slate-200" />
              <div aria-hidden="true" className="h-8 w-64 motion-reduce:animate-none animate-pulse rounded bg-slate-200 sm:w-80" />
            </div>
            <div aria-hidden="true" className="h-10 w-full motion-reduce:animate-none animate-pulse rounded-lg bg-slate-200 sm:w-28" />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div aria-hidden="true" className="bg-slate-900 p-6 md:p-8">
              <div className="h-4 w-28 motion-reduce:animate-none animate-pulse rounded bg-slate-700" />
              <div className="mt-4 h-10 w-3/4 max-w-xl motion-reduce:animate-none animate-pulse rounded bg-slate-700" />
              <div className="mt-4 h-4 w-2/3 max-w-lg motion-reduce:animate-none animate-pulse rounded bg-slate-700" />
            </div>

            <div aria-hidden="true" className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {DASHBOARD_SKELETON_STATS.map((index) => (
                <div key={index} className="bg-white p-5">
                  <div className="h-3 w-20 motion-reduce:animate-none animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-7 w-28 motion-reduce:animate-none animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="h-72 motion-reduce:animate-none animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2" />
            <div className="h-72 motion-reduce:animate-none animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * DASHBOARD
   * ========================================
   */

  return (
    <>
      <a
        href="#dashboard-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Skip to dashboard content
      </a>

      <main
        id="dashboard-content"
        tabIndex={-1}
        aria-busy={loading}
        className="min-h-screen bg-slate-50 px-4 py-8 outline-none sm:px-6 sm:py-12"
      >
        <div className="mx-auto min-w-0 max-w-7xl">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Overview
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-3 text-slate-600">
              Welcome back,{" "}
              <span className="break-words font-semibold text-slate-900">
                {user?.name || user?.email}
              </span>
              .
            </p>
          </div>

          <Link
            to="/plan-trip"
            aria-label="Plan a new trip"
            className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white transition motion-reduce:transition-none hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
          >
            + Plan New Trip
          </Link>

        </div>


        {/* ========================================
            STAT CARDS
        ======================================== */}

        <dl aria-label="Dashboard statistics" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Trips */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:border-slate-300 focus-within:shadow-md motion-reduce:hover:translate-y-0">

            <dt className="text-sm font-medium text-slate-500">
              Total Trips
            </dt>

            <dd className="mt-3 break-words text-3xl font-bold text-slate-900">
              {totalTrips}
            </dd>

            <p className="mt-1 text-sm text-slate-500">
              Saved travel plans
            </p>

          </div>


          {/* Latest Destination */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:border-slate-300 focus-within:shadow-md motion-reduce:hover:translate-y-0">

            <dt className="text-sm font-medium text-slate-500">
              Latest Destination
            </dt>

            <dd className="mt-3 break-words text-xl font-bold text-slate-900">
              {latestTrip
                ? latestTrip.destination
                : "—"}
            </dd>

            <p className="mt-1 text-sm text-slate-500">
              Most recently saved trip
            </p>

          </div>


          {/* Travelers */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:border-slate-300 focus-within:shadow-md motion-reduce:hover:translate-y-0">

            <dt className="text-sm font-medium text-slate-500">
              Latest Travelers
            </dt>

            <dd className="mt-3 break-words text-3xl font-bold text-slate-900">
              {latestTrip?.travelers || "—"}
            </dd>

            <p className="mt-1 text-sm text-slate-500">
              People on latest trip
            </p>

          </div>


          {/* Duration */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:border-slate-300 focus-within:shadow-md motion-reduce:hover:translate-y-0">

            <dt className="text-sm font-medium text-slate-500">
              Latest Duration
            </dt>

            <dd className="mt-3 break-words text-xl font-bold text-slate-900">
              {latestTrip?.duration || "—"}
            </dd>

            <p className="mt-1 text-sm text-slate-500">
              Latest planned journey
            </p>

          </div>

        </dl>


        {/* ========================================
            SELECTED TRIP
        ======================================== */}

        {selectedTrip && (

          <section
            aria-labelledby="selected-trip-heading"
            aria-live="polite"
            className="mt-8"
          >

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition motion-reduce:transition-none hover:border-slate-300 hover:shadow-md md:p-8">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Selected Trip
                  </p>

                  <h2 id="selected-trip-heading" className="mt-2 break-words text-2xl font-bold text-slate-900">
                    {selectedTrip.origin} →{" "}
                    {selectedTrip.destination}
                  </h2>

                </div>

                <Link
                  to={`/saved-trips/${selectedTrip.id}`}
                  aria-label={`View full details for ${selectedTrip.origin} to ${selectedTrip.destination}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-center text-sm font-semibold text-slate-600 transition motion-reduce:transition-none hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
                >
                  View Full Details →
                </Link>

              </div>


              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    From
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {selectedTrip.origin}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    To
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {selectedTrip.destination}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Duration
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {selectedTrip.duration}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Budget
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {selectedTrip.budget}
                  </p>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ========================================
            SELECTED TRIP NOT FOUND
        ======================================== */}

        {selectedTripNotFound && hasTrips && (
          <section
            aria-labelledby="selected-trip-not-found-heading"
            role="alert"
            className="mt-8"
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
              <h2
                id="selected-trip-not-found-heading"
                className="text-lg font-bold text-amber-950"
              >
                Trip not found
              </h2>
              <p className="mt-2 text-sm text-amber-900">
                The trip you tried to open is no longer available. You can choose one of your saved trips below.
              </p>
              <Link
                to="/saved-trips"
                className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 transition motion-reduce:transition-none hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
              >
                View Saved Trips
              </Link>
            </div>
          </section>
        )}


        {/* ========================================
            NO TRIPS
        ======================================== */}

        {!hasTrips ? (

          <section aria-labelledby="empty-trips-heading" className="mt-8">

            <div
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
              role="region"
              aria-describedby="empty-trips-description"
            >

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                ✈️
              </div>

              <h2 id="empty-trips-heading" className="mt-5 text-2xl font-bold text-slate-900">
                Start Planning Your Journey
              </h2>

              <p id="empty-trips-description" className="mx-auto mt-3 max-w-lg text-slate-600">
                You don't have any saved trips yet.
                Create your first travel plan and
                it will appear here.
              </p>

              <Link
                to="/plan-trip"
                aria-label="Plan your first trip"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition motion-reduce:transition-none hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
              >
                Plan Your First Trip
              </Link>

            </div>

          </section>

        ) : (

          /* ========================================
             RECENT TRIPS
          ======================================== */

          <section aria-labelledby="recent-trips-heading" className="mt-8">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Your Plans
                </p>

                <h2 id="recent-trips-heading" className="mt-1 text-2xl font-bold text-slate-900">
                  Recent Trips
                </h2>

              </div>

              <Link
                to="/saved-trips"
                aria-label="View all saved trips"
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-center text-sm font-semibold text-slate-600 transition motion-reduce:transition-none hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
              >
                View All →
              </Link>

            </div>


            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {recentTrips.map((trip) => (
                <RecentTripCard key={trip.id} trip={trip} />
              ))}

            </div>

          </section>

        )}


        {/* ========================================
            QUICK ACTIONS
        ======================================== */}

        <section aria-labelledby="quick-actions-heading" className="mt-10">

          <h2 id="quick-actions-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <Link
              to="/plan-trip"
              aria-label="Plan a new trip"
              className="flex min-h-11 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
            >

              <p className="font-bold text-slate-900">
                Plan a Trip
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create a new travel plan.
              </p>

            </Link>


            <Link
              to="/saved-trips"
              aria-label="Open saved trips"
              className="flex min-h-11 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
            >

              <p className="font-bold text-slate-900">
                Saved Trips
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage your existing trips.
              </p>

            </Link>


            <Link
              to="/"
              aria-label="Explore the home page"
              className="flex min-h-11 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition motion-reduce:transition-none hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:active:scale-100"
            >

              <p className="font-bold text-slate-900">
                Explore
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Return to the home page.
              </p>

            </Link>

          </div>

        </section>

        </div>
      </main>
    </>
  );
}

export default Dashboard;