import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getTripById,
  updateTrip,
  type Trip,
} from "../services/tripService";

import LocationSearch, {
  type LocationResult,
} from "../components/LocationSearch";


/*
 * ========================================
 * EDIT TRIP
 * ========================================
 */

function EditTrip() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  /*
   * ========================================
   * TRIP STATE
   * ========================================
   */

  const [trip, setTrip] =
    useState<Trip | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * ========================================
   * FORM STATE
   * ========================================
   */

  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [travelDate, setTravelDate] =
    useState("");

  const [travelers, setTravelers] =
    useState("1");


  /*
   * ========================================
   * SELECTED LOCATIONS
   * ========================================
   *
   * These store the locations selected
   * from the search suggestions.
   */

  const [selectedOrigin, setSelectedOrigin] =
    useState<LocationResult | null>(null);

  const [
    selectedDestination,
    setSelectedDestination,
  ] = useState<LocationResult | null>(null);


  /*
   * ========================================
   * COORDINATES
   * ========================================
   */

  const [originLatitude, setOriginLatitude] =
    useState<number | undefined>(
      undefined
    );

  const [originLongitude, setOriginLongitude] =
    useState<number | undefined>(
      undefined
    );

  const [
    destinationLatitude,
    setDestinationLatitude,
  ] = useState<number | undefined>(
    undefined
  );

  const [
    destinationLongitude,
    setDestinationLongitude,
  ] = useState<number | undefined>(
    undefined
  );


  /*
   * ========================================
   * LOAD TRIP
   * ========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadTrip = async () => {
      /*
       * User must be logged in.
       */

      if (!user) {
        navigate("/login");
        return;
      }

      /*
       * Trip ID is required.
       */

      if (!id) {
        if (mounted) {
          setError("Trip not found.");
          setLoading(false);
        }
        return;
      }

      /*
       * Get ONLY this user's trip from Supabase.
       */

      let selectedTrip: Trip | null = null;

      try {
        selectedTrip = await getTripById(id, user.id);
      } catch (loadError) {
        console.error("Load trip error:", loadError);

        if (mounted) {
          setError("Unable to load this trip. Please try again.");
          setLoading(false);
        }

        return;
      }

      /*
       * Trip doesn't exist.
       */

      if (!selectedTrip) {

      setError(
        "Trip not found or you do not have permission to edit it."
      );

      setLoading(false);

      return;

    }


    /*
     * Store complete trip.
     */

    setTrip(selectedTrip);


    /*
     * ========================================
     * LOAD FORM DATA
     * ========================================
     */

    setOrigin(
      selectedTrip.origin
    );

    setDestination(
      selectedTrip.destination
    );

    setDuration(
      selectedTrip.duration
    );

    setBudget(
      selectedTrip.budget
    );

    setTravelDate(
      selectedTrip.travelDate || ""
    );

    setTravelers(
      String(
        selectedTrip.travelers || 1
      )
    );


    /*
     * ========================================
     * LOAD COORDINATES
     * ========================================
     */

    setOriginLatitude(
      selectedTrip.originLatitude
    );

    setOriginLongitude(
      selectedTrip.originLongitude
    );

    setDestinationLatitude(
      selectedTrip.destinationLatitude
    );

    setDestinationLongitude(
      selectedTrip.destinationLongitude
    );


    /*
     * ========================================
     * RESTORE SELECTED ORIGIN
     * ========================================
     *
     * Existing trips don't store the
     * Open-Meteo location ID, so we use
     * a temporary ID.
     *
     * The coordinates are the important part.
     */

    if (
      selectedTrip.originLatitude !==
        undefined &&
      selectedTrip.originLongitude !==
        undefined
    ) {

      setSelectedOrigin({
        id: -1,
        name: selectedTrip.origin,
        latitude:
          selectedTrip.originLatitude,
        longitude:
          selectedTrip.originLongitude,
      });

    }


    /*
     * ========================================
     * RESTORE SELECTED DESTINATION
     * ========================================
     */

    if (
      selectedTrip.destinationLatitude !==
        undefined &&
      selectedTrip.destinationLongitude !==
        undefined
    ) {

      setSelectedDestination({
        id: -2,
        name: selectedTrip.destination,
        latitude:
          selectedTrip.destinationLatitude,
        longitude:
          selectedTrip.destinationLongitude,
      });

    }


      if (mounted) {
        setLoading(false);
      }
    };

    loadTrip();

    return () => {
      mounted = false;
    };
  }, [id, user, navigate]);


  /*
   * ========================================
   * SUBMIT
   * ========================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError("");


    /*
     * ========================================
     * AUTH CHECK
     * ========================================
     */

    if (!user) {

      navigate("/login");

      return;

    }


    /*
     * ========================================
     * ID CHECK
     * ========================================
     */

    if (!id) {

      setError("Trip not found.");

      return;

    }


    /*
     * ========================================
     * ORIGIN VALIDATION
     * ========================================
     */

    if (!origin.trim()) {

      setError(
        "Please select your starting location."
      );

      return;

    }


    /*
     * ========================================
     * DESTINATION VALIDATION
     * ========================================
     */

    if (!destination.trim()) {

      setError(
        "Please select your destination."
      );

      return;

    }


    /*
     * ========================================
     * LOCATION SELECTION VALIDATION
     * ========================================
     *
     * If the user changes the text manually,
     * selectedOrigin / selectedDestination
     * become null.
     *
     * Therefore the user must select a
     * real location from the suggestions.
     */

    if (!selectedOrigin) {

      setError(
        "Please select your starting location from the search suggestions."
      );

      return;

    }


    if (!selectedDestination) {

      setError(
        "Please select your destination from the search suggestions."
      );

      return;

    }


    /*
     * ========================================
     * SAME LOCATION VALIDATION
     * ========================================
     */

    if (
      selectedOrigin.id ===
      selectedDestination.id
    ) {

      setError(
        "Starting location and destination cannot be the same."
      );

      return;

    }


    /*
     * Also compare names.
     */

    if (
      origin.trim().toLowerCase() ===
      destination.trim().toLowerCase()
    ) {

      setError(
        "Starting location and destination cannot be the same."
      );

      return;

    }


    /*
     * ========================================
     * DURATION VALIDATION
     * ========================================
     */

    if (!duration.trim()) {

      setError(
        "Please enter the trip duration."
      );

      return;

    }


    /*
     * ========================================
     * BUDGET VALIDATION
     * ========================================
     *
     * Existing budgets may look like:
     *
     * ₹25,000
     *
     * or:
     *
     * 25000
     *
     * Remove currency symbols and commas
     * before validating.
     */

    if (!budget.trim()) {

      setError(
        "Please enter your budget."
      );

      return;

    }


    const budgetNumber =
      Number(
        budget
          .replace(/[₹,\s]/g, "")
      );


    if (
      !Number.isFinite(
        budgetNumber
      ) ||
      budgetNumber <= 0
    ) {

      setError(
        "Please enter a valid budget greater than ₹0."
      );

      return;

    }


    /*
     * ========================================
     * DATE VALIDATION
     * ========================================
     */

    if (!travelDate) {

      setError(
        "Please select your travel date."
      );

      return;

    }


    /*
     * ========================================
     * TRAVELER VALIDATION
     * ========================================
     */

    const travelerCount =
      Number(travelers);


    if (
      !Number.isInteger(
        travelerCount
      ) ||
      travelerCount < 1 ||
      travelerCount > 50
    ) {

      setError(
        "Travelers must be between 1 and 50."
      );

      return;

    }


    /*
     * ========================================
     * COORDINATE VALIDATION
     * ========================================
     */

    const hasOriginCoordinates =
      originLatitude !== undefined &&
      originLongitude !== undefined;


    const hasDestinationCoordinates =
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined;


    /*
     * New locations selected from the
     * search suggestions should always
     * have coordinates.
     */

    if (!hasOriginCoordinates) {

      setError(
        "Starting location coordinates are missing. Please select the location again."
      );

      return;

    }


    if (!hasDestinationCoordinates) {

      setError(
        "Destination coordinates are missing. Please select the location again."
      );

      return;

    }


    /*
     * ========================================
     * SAME COORDINATES VALIDATION
     * ========================================
     */

    if (
      originLatitude ===
        destinationLatitude &&
      originLongitude ===
        destinationLongitude
    ) {

      setError(
        "Starting location and destination cannot be the same."
      );

      return;

    }


    /*
     * ========================================
     * SAVE
     * ========================================
     */

    setSaving(true);


    /*
     * Keep the budget format consistent
     * with PlanTrip.
     */

    const formattedBudget =
      `₹${budgetNumber.toLocaleString(
        "en-IN"
      )}`;


    try {
      const updatedTrip = await updateTrip(
        id,
        user.id,
        {

          /*
           * Route
           */

          origin:
            origin.trim(),

          destination:
            destination.trim(),


          /*
           * Trip details
           */

          duration:
            duration.trim(),

          budget:
            formattedBudget,

          travelDate,

          travelers:
            travelerCount,


          /*
           * Coordinates
           */

          originLatitude,

          originLongitude,

          destinationLatitude,

          destinationLongitude,

        }
      );

      /*
       * ========================================
       * UPDATE FAILED
       * ========================================
       */

      if (!updatedTrip) {
        setError("Unable to update this trip.");
        setSaving(false);
        return;
      }

      /*
       * ========================================
       * SUCCESS
       * ========================================
       *
       * Go directly to the exact trip.
       */

      navigate(`/saved-trips/${updatedTrip.id}`);
    } catch (updateError) {
      console.error("Update trip error:", updateError);
      setError("Unable to update this trip. Please try again.");
      setSaving(false);
    }
  };


  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {

    return (

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <p className="text-slate-600">
              Loading trip...
            </p>

          </div>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * TRIP NOT FOUND
   * ========================================
   */

  if (!trip) {

    return (

      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              ✈️
            </div>


            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Trip Not Found
            </h1>


            <p className="mt-3 text-slate-600">
              {error ||
                "This trip doesn't exist or doesn't belong to your account."}
            </p>


            <Link
              to="/saved-trips"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Saved Trips
            </Link>

          </div>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * MAIN FORM
   * ========================================
   */

  return (

    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">

      <div className="mx-auto max-w-3xl">


        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-8">
          <Link
            to={`/saved-trips/${trip.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-0.5 hover:text-slate-900"
          >
            <span>←</span>
            Back to Trip
          </Link>

          <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Manage Trip
            </p>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Edit Trip
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                  Update your route, schedule, travelers, or budget. Your
                  existing trip will be updated without creating a duplicate.
                </p>
              </div>

              <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 sm:block">
                Trip #{trip.id}
              </span>
            </div>
          </div>
        </div>


        {/* ========================================
            FORM CARD
        ======================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10"
        >


          {/* ========================================
              ERROR
          ======================================== */}

          {error && (

            <div
              role="alert"
              className="mb-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >

              <span className="mt-0.5">⚠️</span>
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>

          )}


          {/* ========================================
              ROUTE
          ======================================== */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                01 · Route
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Journey Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search and select the locations you want to travel between.
              </p>
            </div>

          <div className="grid gap-6 md:grid-cols-2">


            {/* ========================================
                ORIGIN
            ======================================== */}

            <LocationSearch
              id="origin"
              label="Starting Location"
              value={origin}
              placeholder="Search starting location..."
              onChange={(value) => {

                setOrigin(value);

                /*
                 * User manually changed the text.
                 *
                 * Therefore the previous location
                 * and coordinates are no longer valid.
                 */

                setSelectedOrigin(null);

                setOriginLatitude(
                  undefined
                );

                setOriginLongitude(
                  undefined
                );

              }}
              onSelect={(location) => {

                /*
                 * Save selected location name.
                 */

                setOrigin(
                  location.name
                );


                /*
                 * Save complete location.
                 */

                setSelectedOrigin(
                  location
                );


                /*
                 * IMPORTANT:
                 *
                 * Update coordinates too.
                 */

                setOriginLatitude(
                  location.latitude
                );

                setOriginLongitude(
                  location.longitude
                );

              }}
            />


            {/* ========================================
                DESTINATION
            ======================================== */}

            <LocationSearch
              id="destination"
              label="Destination"
              value={destination}
              placeholder="Search destination..."
              onChange={(value) => {

                setDestination(value);

                /*
                 * Previous selection is no
                 * longer valid.
                 */

                setSelectedDestination(
                  null
                );

                setDestinationLatitude(
                  undefined
                );

                setDestinationLongitude(
                  undefined
                );

              }}
              onSelect={(location) => {

                /*
                 * Save selected location name.
                 */

                setDestination(
                  location.name
                );


                /*
                 * Save complete location.
                 */

                setSelectedDestination(
                  location
                );


                /*
                 * Update coordinates.
                 */

                setDestinationLatitude(
                  location.latitude
                );

                setDestinationLongitude(
                  location.longitude
                );

              }}
            />

          </div>
          </div>


          {/* ========================================
              SELECTED LOCATION INFORMATION
          ======================================== */}

          {(selectedOrigin ||
            selectedDestination) && (

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Selected Locations
              </p>


              <div className="mt-4 space-y-4">


                {/* Origin */}

                {selectedOrigin && (

                  <div className="flex items-start gap-3">

                    <span className="text-lg">
                      📍
                    </span>


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
                        {selectedOrigin.latitude.toFixed(
                          4
                        )}
                        ,{" "}
                        {selectedOrigin.longitude.toFixed(
                          4
                        )}
                      </p>

                    </div>

                  </div>

                )}


                {/* Destination */}

                {selectedDestination && (

                  <div className="flex items-start gap-3">

                    <span className="text-lg">
                      🏁
                    </span>


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
                        {selectedDestination.latitude.toFixed(
                          4
                        )}
                        ,{" "}
                        {selectedDestination.longitude.toFixed(
                          4
                        )}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}


          {/* ========================================
              TRIP DETAILS
          ======================================== */}

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                02 · Trip Details
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Travel Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your date, duration, group size, and budget up to date.
              </p>
            </div>

          <div className="grid gap-6 md:grid-cols-2">


            {/* ========================================
                TRAVEL DATE
            ======================================== */}

            <div>

              <label
                htmlFor="travelDate"
                className="block text-sm font-semibold text-slate-700"
              >
                Travel Date
              </label>


              <input
                id="travelDate"
                type="date"
                value={travelDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setTravelDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />

            </div>


            {/* ========================================
                TRAVELERS
            ======================================== */}

            <div>

              <label
                htmlFor="travelers"
                className="block text-sm font-semibold text-slate-700"
              >
                Number of Travelers
              </label>


              <input
                id="travelers"
                type="number"
                min="1"
                max="50"
                value={travelers}
                onChange={(event) =>
                  setTravelers(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />

            </div>


            {/* ========================================
                DURATION
            ======================================== */}

            <div>

              <label
                htmlFor="duration"
                className="block text-sm font-semibold text-slate-700"
              >
                Trip Duration
              </label>


              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(event) =>
                  setDuration(
                    event.target.value
                  )
                }
                placeholder="e.g. 5 days"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 placeholder:text-slate-400"
              />

            </div>


            {/* ========================================
                BUDGET
            ======================================== */}

            <div>

              <label
                htmlFor="budget"
                className="block text-sm font-semibold text-slate-700"
              >
                Estimated Budget
              </label>


              <input
                id="budget"
                type="text"
                value={budget}
                onChange={(event) =>
                  setBudget(
                    event.target.value
                  )
                }
                placeholder="e.g. ₹25,000"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 placeholder:text-slate-400"
              />

            </div>

          </div>
          </div>


          {/* ========================================
              COORDINATE INFORMATION
          ======================================== */}

          {(originLatitude !== undefined ||
            destinationLatitude !== undefined) && (

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex gap-3">

                <span className="text-lg">
                  🗺️
                </span>


                <div>

                  <p className="font-semibold text-slate-900">
                    Map coordinates available
                  </p>


                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Location coordinates are stored
                    with this trip. If you change a
                    location, select the new location
                    from the search suggestions so
                    the map route is updated correctly.
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* ========================================
              BUTTONS
          ======================================== */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            {/* Cancel */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/saved-trips/${trip.id}`
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>


            {/* Save */}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >

              {saving
                ? "Saving Changes..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </main>

  );
}

export default EditTrip;