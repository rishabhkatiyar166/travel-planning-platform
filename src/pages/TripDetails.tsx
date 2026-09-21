import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useAuth } from "../context/AuthContext";

const detailIconClass = "text-xl";

import {
  getTripById,
  updateTrip,
  type ExpenseCategory,
  type ItineraryItem,
  type Trip,
  type TripExpense,
} from "../services/tripService";

import {
  addItineraryItem,
  deleteItineraryItem,
  updateItineraryItem,
} from "../services/itineraryService";

import {
  getTripStatus,
  getTripCountdownText,
  formatTripDate,
} from "../utils/tripUtils";

/*
 * ========================================
 * FIX LEAFLET DEFAULT MARKER ICONS
 * ========================================
 */

const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <div
          style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
          "
        ></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const originIcon = createMarkerIcon("#0f172a");

const destinationIcon = createMarkerIcon("#dc2626");

/*
 * ========================================
 * ROUTE POINT TYPE
 * ========================================
 */

interface RoutePoint {
  lat: number;
  lng: number;
}

/*
 * ========================================
 * ROUTE INFORMATION
 * ========================================
 */

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

const expenseCategories: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Hotel",
  "Activities",
  "Other",
];

/*
 * ========================================
 * MAP VIEW CONTROLLER
 * ========================================
 *
 * Automatically fits the map around
 * origin + destination + route.
 */

interface MapViewProps {
  origin: RoutePoint;
  destination: RoutePoint;
  route: [number, number][];
}

function TripDetailsSkeleton() {
  return (
    <main
      className="trip-details-print min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-label="Loading trip details"
    >
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-4 w-36 rounded bg-slate-200" />

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-7 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-9 w-full max-w-2xl rounded bg-slate-200 sm:h-11" />
              <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-100" />
              <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-slate-100" />
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="h-10 w-full rounded-full bg-slate-200 sm:w-28" />
              <div className="h-10 w-full rounded-full bg-slate-100 sm:w-24" />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-7 w-72 max-w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-40 rounded bg-slate-100" />
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="h-3 w-16 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-24 rounded bg-slate-200" />
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-12 rounded-xl bg-slate-200" />
          <div className="h-12 rounded-xl bg-slate-200" />
          <div className="h-12 rounded-xl bg-slate-100" />
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-6">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-80 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-[300px] bg-slate-100 sm:h-[420px]" />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-48 rounded bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-16 rounded-xl bg-slate-100" />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-40 rounded bg-slate-200" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
          </div>
        </section>
      </div>
    </main>
  );
}

function MapView({ origin, destination, route }: MapViewProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] =
      route.length > 0
        ? route
        : [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ];

    if (points.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, [map, origin, destination, route]);

  return null;
}

/*
 * ========================================
 * FORMAT DISTANCE
 * ========================================
 */

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

/*
 * ========================================
 * FORMAT ROUTE TIME
 * ========================================
 */

function formatRouteDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

/*
 * ========================================
 * REUSABLE ERROR STATE
 * ========================================
 */

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-200 bg-red-50 text-red-900 ${
        compact ? "px-4 py-4" : "px-6 py-8 text-center md:px-8"
      }`}
    >
      <div className={compact ? "flex items-start gap-3" : "mx-auto max-w-xl"}>
        <div
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm ${
            compact ? "h-9 w-9" : "mx-auto h-14 w-14"
          }`}
        >
          ⚠️
        </div>

        <div className={compact ? "min-w-0" : "mt-4"}>
          <h3 className={`font-bold ${compact ? "text-sm" : "text-lg"}`}>
            {title}
          </h3>

          <p
            className={`leading-6 text-red-700 ${compact ? "mt-1 text-sm" : "mt-2 text-sm"}`}
          >
            {message}
          </p>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`inline-flex items-center justify-center rounded-lg bg-slate-900 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                compact ? "mt-3 px-3 py-2 text-xs" : "mt-5 px-4 py-2.5 text-sm"
              }`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type DeleteConfirmation =
  | {
      type: "itinerary";
      id: number;
      itemLabel: string;
    }
  | {
      type: "expense";
      id: number;
      itemLabel: string;
    }
  | null;

/*
 * ========================================
 * TRIP DETAILS
 * ========================================
 */

function TripDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  /*
   * ========================================
   * TRIP STATE
   * ========================================
   */

  const [trip, setTrip] = useState<Trip | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  /*
   * ========================================
   * ITINERARY STATE
   * ========================================
   */

  const [isAddingItineraryItem, setIsAddingItineraryItem] = useState(false);

  const [editingItineraryId, setEditingItineraryId] = useState<number | null>(
    null,
  );

  const [itineraryError, setItineraryError] = useState("");

  const [itineraryForm, setItineraryForm] = useState({
    day: 1,
    title: "",
    time: "",
    notes: "",
  });

  const [completedItineraryItems, setCompletedItineraryItems] = useState<
    Record<number, boolean>
  >({});

  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<
    ExpenseCategory | "All"
  >("All");
  const [expenseSort, setExpenseSort] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [expenseError, setExpenseError] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    description: "",
    category: "Food" as ExpenseCategory,
    date: new Date().toISOString().split("T")[0],
  });

  const itineraryTitleRef = useRef<HTMLInputElement>(null);
  const expenseAmountRef = useRef<HTMLInputElement>(null);
  const itineraryAddButtonRef = useRef<HTMLButtonElement>(null);
  const expenseAddButtonRef = useRef<HTMLButtonElement>(null);
  const expenseFileInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>(null);

  /*
   * ========================================
   * ROUTE STATE
   * ========================================
   */

  const [route, setRoute] = useState<RouteData | null>(null);

  const [routeLoading, setRouteLoading] = useState(false);

  const [routeError, setRouteError] = useState("");

  const [routeRetryKey, setRouteRetryKey] = useState(0);

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const shareFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /*
   * ========================================
   * LOAD EXACT TRIP
   * ========================================
   */

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!id) {
      setTrip(null);
      setLoading(false);
      return;
    }

    /*
     * Get ONLY the trip matching:
     *
     * 1. URL trip ID
     * 2. Logged-in user's ID
     */

    let mounted = true;

    const loadTrip = async () => {
      try {
        setLoadError("");

        const selectedTrip = await getTripById(id, user.id);

        if (!mounted) {
          return;
        }

        setTrip(selectedTrip);

        if (selectedTrip) {
          setExpenses(selectedTrip.expenses ?? []);
          setExpenseForm({
            amount: "",
            description: "",
            category: "Food",
            date: new Date().toISOString().split("T")[0],
          });
          setIsAddingExpense(false);
          setEditingExpenseId(null);
          setExpenseCategoryFilter("All");
          setExpenseSort("newest");
          setExpenseError("");
          setCompletedItineraryItems(
            selectedTrip.completedItineraryItems ?? {},
          );
        } else {
          setExpenses([]);
          setExpenseForm({
            amount: "",
            description: "",
            category: "Food",
            date: new Date().toISOString().split("T")[0],
          });
          setIsAddingExpense(false);
          setExpenseError("");
          setCompletedItineraryItems({});
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("Load trip error:", error);

        setLoadError(
          "Unable to load this trip. Please check your connection and try again.",
        );

        setTrip(null);
        setExpenses([]);
        setCompletedItineraryItems({});
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      mounted = false;
    };
  }, [id, user, navigate, loadRetryKey]);

  /*
   * ========================================
   * FETCH ROAD ROUTE
   * ========================================
   */

  useEffect(() => {
    if (!trip) {
      return;
    }

    if (
      trip.originLatitude === undefined ||
      trip.originLongitude === undefined ||
      trip.destinationLatitude === undefined ||
      trip.destinationLongitude === undefined
    ) {
      setRoute(null);

      setRouteError("Route information is unavailable for this trip.");

      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      setRouteLoading(true);
      setRouteError("");

      try {
        /*
         * OSRM expects:
         *
         * longitude,latitude
         */

        const origin = `${trip.originLongitude},${trip.originLatitude}`;

        const destination = `${trip.destinationLongitude},${trip.destinationLatitude}`;

        const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to calculate route.");
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          throw new Error("No route was found between these locations.");
        }

        const selectedRoute = data.routes[0];

        const coordinates = selectedRoute.geometry.coordinates.map(
          (point: [number, number]) => [point[1], point[0]] as [number, number],
        );

        setRoute({
          coordinates,
          distance: selectedRoute.distance,
          duration: selectedRoute.duration,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Route error:", error);

        setRoute(null);

        setRouteError(
          error instanceof Error ? error.message : "Unable to calculate route.",
        );
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();

    return () => {
      controller.abort();
    };
  }, [trip, routeRetryKey]);

  /*
   * ========================================
   * ITINERARY HELPERS
   * ========================================
   */

  const refreshTrip = async () => {
    if (!id || !user) {
      return;
    }

    try {
      const updatedTrip = await getTripById(id, user.id);

      setTrip(updatedTrip);

      if (updatedTrip) {
        setExpenses(updatedTrip.expenses ?? []);
        setCompletedItineraryItems(updatedTrip.completedItineraryItems ?? {});
      } else {
        setExpenses([]);
        setCompletedItineraryItems({});
      }
    } catch (error) {
      console.error("Refresh trip error:", error);
    }
  };

  const durationDays = useMemo(() => {
    if (!trip?.duration) {
      return 1;
    }

    const match = trip.duration.match(/\d+/);

    if (!match) {
      return 1;
    }

    const days = Number(match[0]);

    return Number.isFinite(days) && days > 0 ? days : 1;
  }, [trip?.duration]);

  const itineraryByDay = useMemo(() => {
    const items = trip?.itinerary ?? [];

    const days = Array.from({ length: durationDays }, (_, index) => index + 1);

    return days.map((day) => ({
      day,
      items: items
        .filter((item) => item.day === day)
        .sort((a, b) => {
          const timeA = a.time || "99:99";
          const timeB = b.time || "99:99";

          return timeA.localeCompare(timeB);
        }),
    }));
  }, [trip?.itinerary, durationDays]);

  const totalItineraryItems = trip?.itinerary?.length ?? 0;

  const completedItineraryCount = useMemo(() => {
    if (!trip?.itinerary) {
      return 0;
    }

    return trip.itinerary.filter((item) => completedItineraryItems[item.id])
      .length;
  }, [trip?.itinerary, completedItineraryItems]);

  const itineraryProgress =
    totalItineraryItems > 0
      ? Math.round((completedItineraryCount / totalItineraryItems) * 100)
      : 0;

  const toggleItineraryItemCompletion = async (itemId: number) => {
    if (!trip || !user) {
      return;
    }

    const updated = {
      ...completedItineraryItems,
      [itemId]: !completedItineraryItems[itemId],
    };

    try {
      const updatedTrip = await updateTrip(trip.id, user.id, {
        completedItineraryItems: updated,
      });

      if (!updatedTrip) {
        setItineraryError(
          "Unable to update itinerary completion. Please try again.",
        );
        return;
      }

      setTrip(updatedTrip);
      setCompletedItineraryItems(updatedTrip.completedItineraryItems ?? {});
    } catch (error) {
      console.error("Update itinerary completion error:", error);
      setItineraryError(
        "Unable to update itinerary completion. Please try again.",
      );
    }
  };

  const resetItineraryForm = () => {
    setItineraryForm({
      day: 1,
      title: "",
      time: "",
      notes: "",
    });

    setItineraryError("");
  };

  const handleItineraryFormChange = (
    field: "day" | "title" | "time" | "notes",
    value: string,
  ) => {
    setItineraryForm((current) => ({
      ...current,
      [field]: field === "day" ? Number(value) : value,
    }));
  };

  const closeItineraryForm = () => {
    setIsAddingItineraryItem(false);
    setEditingItineraryId(null);
    resetItineraryForm();
  };

  const closeExpenseForm = () => {
    setEditingExpenseId(null);
    resetExpenseForm();
    setIsAddingExpense(false);
  };

  useEffect(() => {
    if (isAddingItineraryItem || editingItineraryId !== null) {
      requestAnimationFrame(() => itineraryTitleRef.current?.focus());
    }
  }, [isAddingItineraryItem, editingItineraryId]);

  useEffect(() => {
    if (isAddingExpense) {
      requestAnimationFrame(() => expenseAmountRef.current?.focus());
    }
  }, [isAddingExpense]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isAddingItineraryItem || editingItineraryId !== null) {
        closeItineraryForm();
        itineraryAddButtonRef.current?.focus();
        return;
      }

      if (isAddingExpense) {
        closeExpenseForm();
        expenseAddButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddingItineraryItem, editingItineraryId, isAddingExpense]);

  useEffect(() => {
    if (!deleteConfirmation) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      deleteCancelButtonRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [deleteConfirmation]);

  useEffect(() => {
    if (!deleteConfirmation) {
      return;
    }

    const handleDeleteDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDeleteConfirmation(null);
        window.requestAnimationFrame(() => {
          deleteTriggerRef.current?.focus();
        });
      }
    };

    window.addEventListener("keydown", handleDeleteDialogKeyDown);

    return () =>
      window.removeEventListener("keydown", handleDeleteDialogKeyDown);
  }, [deleteConfirmation]);

  const handleAddItineraryItem = async () => {
    if (!user || !id) {
      return;
    }

    setItineraryError("");

    const title = itineraryForm.title.trim();

    if (!title) {
      setItineraryError("Please enter an activity name.");

      return;
    }

    if (itineraryForm.day < 1 || itineraryForm.day > durationDays) {
      setItineraryError(`Please choose a day between 1 and ${durationDays}.`);

      return;
    }

    const newItem = await addItineraryItem(id, user.id, {
      day: itineraryForm.day,
      title,
      time: itineraryForm.time,
      notes: itineraryForm.notes.trim(),
    });

    if (!newItem) {
      setItineraryError("Unable to add this activity. Please try again.");

      return;
    }

    refreshTrip();

    resetItineraryForm();

    setIsAddingItineraryItem(false);
  };

  const startEditingItineraryItem = (item: ItineraryItem) => {
    setEditingItineraryId(item.id);

    setItineraryError("");

    setItineraryForm({
      day: item.day,
      title: item.title,
      time: item.time ?? "",
      notes: item.notes ?? "",
    });

    setIsAddingItineraryItem(false);
  };

  const handleUpdateItineraryItem = async () => {
    if (!user || !id || editingItineraryId === null) {
      return;
    }

    setItineraryError("");

    const title = itineraryForm.title.trim();

    if (!title) {
      setItineraryError("Please enter an activity name.");

      return;
    }

    if (itineraryForm.day < 1 || itineraryForm.day > durationDays) {
      setItineraryError(`Please choose a day between 1 and ${durationDays}.`);

      return;
    }

    const updatedItem = await updateItineraryItem(
      id,
      user.id,
      editingItineraryId,
      {
        day: itineraryForm.day,
        title,
        time: itineraryForm.time,
        notes: itineraryForm.notes.trim(),
      },
    );

    if (!updatedItem) {
      setItineraryError("Unable to update this activity. Please try again.");

      return;
    }

    refreshTrip();

    setEditingItineraryId(null);

    resetItineraryForm();
  };

  const requestDeleteItineraryItem = (itemId: number, itemLabel: string) => {
    deleteTriggerRef.current =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;

    setDeleteConfirmation({
      type: "itinerary",
      id: itemId,
      itemLabel,
    });
  };

  const handleDeleteItineraryItem = async (itemId: number) => {
    if (!user || !id) {
      return;
    }

    setItineraryError("");

    const deleted = await deleteItineraryItem(id, user.id, itemId);

    if (!deleted) {
      setItineraryError("Unable to delete this activity. Please try again.");

      return;
    }

    if (editingItineraryId === itemId) {
      setEditingItineraryId(null);

      resetItineraryForm();
    }

    refreshTrip();
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const budgetAmount = useMemo(() => {
    if (!trip?.budget) {
      return null;
    }

    const numericValue = Number(trip.budget.replace(/[^0-9.]/g, ""));

    return Number.isFinite(numericValue) && numericValue > 0
      ? numericValue
      : null;
  }, [trip?.budget]);

  const remainingBudget =
    budgetAmount !== null ? budgetAmount - totalExpenses : null;

  const expenseProgress =
    budgetAmount !== null && budgetAmount > 0
      ? Math.min(Math.round((totalExpenses / budgetAmount) * 100), 100)
      : 0;

  const budgetUsagePercentage =
    budgetAmount !== null && budgetAmount > 0
      ? Math.round((totalExpenses / budgetAmount) * 100)
      : 0;

  const budgetAlert = useMemo(() => {
    if (budgetAmount === null) {
      return {
        level: "none" as const,
        title: "Set a trip budget to get alerts",
        message:
          "Add a budget while editing your trip to track spending against it.",
      };
    }

    if (totalExpenses >= budgetAmount) {
      return {
        level: "danger" as const,
        title: "You've reached your trip budget",
        message: `You're ₹${(totalExpenses - budgetAmount).toLocaleString("en-IN")} over budget.`,
      };
    }

    if (budgetUsagePercentage >= 75) {
      return {
        level: "warning" as const,
        title: "You're getting close to your budget",
        message: `${budgetUsagePercentage}% of your trip budget has been used.`,
      };
    }

    return {
      level: "healthy" as const,
      title: "Your budget is looking healthy",
      message: `${budgetUsagePercentage}% of your trip budget has been used.`,
    };
  }, [budgetAmount, totalExpenses, budgetUsagePercentage]);

  const expenseCategoryBreakdown = useMemo(() => {
    return expenseCategories.map((category) => {
      const amount = expenses
        .filter((expense) => expense.category === category)
        .reduce((total, expense) => total + expense.amount, 0);

      const percentage =
        totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;

      return {
        category,
        amount,
        percentage,
      };
    });
  }, [expenses, totalExpenses]);

  const expenseAnalytics = useMemo(() => {
    const averageExpense =
      expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const largestExpense = expenses.reduce<TripExpense | null>(
      (largest, expense) => {
        if (!largest || expense.amount > largest.amount) {
          return expense;
        }

        return largest;
      },
      null,
    );

    const spendingDays = new Set(
      expenses.map((expense) => expense.date).filter(Boolean),
    ).size;

    const averageDailySpending =
      spendingDays > 0 ? totalExpenses / spendingDays : 0;

    let insight = "Add expenses to see a spending insight.";

    if (expenses.length > 0 && largestExpense) {
      const largestPercentage =
        totalExpenses > 0
          ? Math.round((largestExpense.amount / totalExpenses) * 100)
          : 0;

      if (budgetAmount !== null && totalExpenses > budgetAmount) {
        insight = `You are over your trip budget by ₹${(totalExpenses - budgetAmount).toLocaleString("en-IN")}.`;
      } else if (largestPercentage >= 40) {
        insight = `Your largest expense, ${largestExpense.description}, accounts for ${largestPercentage}% of your total spending.`;
      } else if (budgetAmount !== null && budgetAmount > 0) {
        const usedPercentage = Math.round((totalExpenses / budgetAmount) * 100);
        insight = `You've used ${usedPercentage}% of your trip budget so far. Keep tracking your spending to stay on plan.`;
      } else {
        insight = `Your average expense is ₹${Math.round(averageExpense).toLocaleString("en-IN")}, across ${expenses.length} recorded ${expenses.length === 1 ? "expense" : "expenses"}.`;
      }
    }

    return {
      averageExpense,
      largestExpense,
      spendingDays,
      averageDailySpending,
      insight,
    };
  }, [expenses, totalExpenses, budgetAmount]);

  const dailyExpenseSummary = useMemo(() => {
    const totals = new Map<string, { amount: number; count: number }>();

    expenses.forEach((expense) => {
      const current = totals.get(expense.date) ?? {
        amount: 0,
        count: 0,
      };

      totals.set(expense.date, {
        amount: current.amount + expense.amount,
        count: current.count + 1,
      });
    });

    const days = Array.from(totals.entries())
      .map(([date, summary]) => ({
        date,
        amount: summary.amount,
        count: summary.count,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const maxAmount = days.reduce(
      (maximum, day) => Math.max(maximum, day.amount),
      0,
    );

    return days.map((day) => ({
      ...day,
      percentage:
        maxAmount > 0 ? Math.round((day.amount / maxAmount) * 100) : 0,
    }));
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    const filteredExpenses =
      expenseCategoryFilter === "All"
        ? expenses
        : expenses.filter(
            (expense) => expense.category === expenseCategoryFilter,
          );

    return filteredExpenses.slice().sort((a, b) => {
      if (expenseSort === "newest") {
        return b.date.localeCompare(a.date) || b.id - a.id;
      }

      if (expenseSort === "oldest") {
        return a.date.localeCompare(b.date) || a.id - b.id;
      }

      if (expenseSort === "highest") {
        return b.amount - a.amount || b.id - a.id;
      }

      return a.amount - b.amount || a.id - b.id;
    });
  }, [expenses, expenseCategoryFilter, expenseSort]);

  const resetExpenseForm = () => {
    setExpenseForm({
      amount: "",
      description: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setExpenseError("");
  };

  const handleAddExpense = async () => {
    if (!trip || !user) {
      return;
    }

    setExpenseError("");

    const amount = Number(expenseForm.amount);
    const description = expenseForm.description.trim();

    if (!expenseForm.amount || !Number.isFinite(amount) || amount <= 0) {
      setExpenseError("Please enter a valid expense amount.");
      return;
    }

    if (!expenseForm.date) {
      setExpenseError("Please select an expense date.");
      return;
    }

    if (!description) {
      setExpenseError("Please enter an expense description.");
      return;
    }

    const newExpense: TripExpense = {
      id: Date.now(),
      amount: Math.round(amount * 100) / 100,
      description,
      category: expenseForm.category,
      date: expenseForm.date,
    };

    const updatedExpenses = [...expenses, newExpense];

    try {
      const updatedTrip = await updateTrip(trip.id, user.id, {
        expenses: updatedExpenses,
      });

      if (!updatedTrip) {
        setExpenseError("Unable to save this expense. Please try again.");
        return;
      }

      setTrip(updatedTrip);
      setExpenses(updatedTrip.expenses ?? []);
      resetExpenseForm();
      setIsAddingExpense(false);
    } catch (error) {
      console.error("Add expense error:", error);
      setExpenseError("Unable to save this expense. Please try again.");
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleEditExpense = (expense: TripExpense) => {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      amount: String(expense.amount),
      description: expense.description,
      category: expense.category,
      date: expense.date,
    });
    setExpenseError("");
    setIsAddingExpense(true);
  };

  const handleUpdateExpense = async () => {
    if (!trip || !user || editingExpenseId === null) {
      return;
    }

    setExpenseError("");

    const amount = Number(expenseForm.amount);
    const description = expenseForm.description.trim();

    if (!expenseForm.amount || !Number.isFinite(amount) || amount <= 0) {
      setExpenseError("Please enter a valid expense amount.");
      return;
    }

    if (!expenseForm.date) {
      setExpenseError("Please select an expense date.");
      return;
    }

    if (!description) {
      setExpenseError("Please enter an expense description.");
      return;
    }

    const updatedExpenses = expenses.map((expense) =>
      expense.id === editingExpenseId
        ? {
            ...expense,
            amount: Math.round(amount * 100) / 100,
            description,
            category: expenseForm.category,
            date: expenseForm.date,
          }
        : expense,
    );

    try {
      const updatedTrip = await updateTrip(trip.id, user.id, {
        expenses: updatedExpenses,
      });

      if (!updatedTrip) {
        setExpenseError("Unable to update this expense. Please try again.");
        return;
      }

      setTrip(updatedTrip);
      setExpenses(updatedTrip.expenses ?? []);
      setEditingExpenseId(null);
      resetExpenseForm();
    } catch (error) {
      console.error("Update expense error:", error);
      setExpenseError("Unable to update this expense. Please try again.");
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleExportExpenses = () => {
    if (!trip || expenses.length === 0) {
      return;
    }

    const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = [
      ["Date", "Description", "Category", "Amount"],
      ...expenses.map((expense) => [
        expense.date || "Not specified",
        expense.description,
        expense.category,
        expense.amount.toFixed(2),
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip.origin}-to-${trip.destination}-expenses.csv`
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportExpenses = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      return;
    }

    const file = event.target.files?.[0];

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (!trip || !file) {
      return;
    }

    setExpenseError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setExpenseError("Please select a CSV file.");
      return;
    }

    try {
      const csvText = (await file.text()).replace(/^\uFEFF/, "");

      const parseCsv = (text: string): string[][] => {
        const rows: string[][] = [];
        let row: string[] = [];
        let value = "";
        let insideQuotes = false;

        for (let index = 0; index < text.length; index += 1) {
          const character = text[index];
          const nextCharacter = text[index + 1];

          if (character === '"') {
            if (insideQuotes && nextCharacter === '"') {
              value += '"';
              index += 1;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (character === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
          } else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
          ) {
            if (character === "\r" && nextCharacter === "\n") {
              index += 1;
            }

            row.push(value.trim());
            value = "";

            if (row.some((cell) => cell !== "")) {
              rows.push(row);
            }

            row = [];
          } else {
            value += character;
          }
        }

        if (value !== "" || row.length > 0) {
          row.push(value.trim());

          if (row.some((cell) => cell !== "")) {
            rows.push(row);
          }
        }

        return rows;
      };

      const rows = parseCsv(csvText);

      if (rows.length < 2) {
        setExpenseError(
          "The CSV file must contain a header row and at least one expense.",
        );
        return;
      }

      const headers = rows[0].map((header) =>
        header.toLowerCase().replace(/\s+/g, "").trim(),
      );

      const dateIndex = headers.indexOf("date");
      const descriptionIndex = headers.indexOf("description");
      const categoryIndex = headers.indexOf("category");
      const amountIndex = headers.indexOf("amount");

      if (
        dateIndex === -1 ||
        descriptionIndex === -1 ||
        categoryIndex === -1 ||
        amountIndex === -1
      ) {
        setExpenseError(
          "Invalid CSV format. Required columns: Date, Description, Category, Amount.",
        );
        return;
      }

      const importedExpenses: TripExpense[] = [];
      let skippedRows = 0;

      rows.slice(1).forEach((row) => {
        const amountText = row[amountIndex] ?? "";
        const description = (row[descriptionIndex] ?? "").trim();
        const date = (row[dateIndex] ?? "").trim();
        const categoryText = (row[categoryIndex] ?? "").trim();
        const amount = Number(amountText.replace(/₹|,/g, ""));

        const category = expenseCategories.find(
          (item) => item.toLowerCase() === categoryText.toLowerCase(),
        );

        if (
          !description ||
          !date ||
          !Number.isFinite(amount) ||
          amount <= 0 ||
          !category
        ) {
          skippedRows += 1;
          return;
        }

        importedExpenses.push({
          id: Date.now() + importedExpenses.length,
          amount: Math.round(amount * 100) / 100,
          description,
          category,
          date,
        });
      });

      if (importedExpenses.length === 0) {
        setExpenseError(
          "No valid expenses were found in the CSV file. Check the required columns and values.",
        );
        return;
      }

      const updatedExpenses = [...expenses, ...importedExpenses];

      try {
        const updatedTrip = await updateTrip(trip.id, user.id, {
          expenses: updatedExpenses,
        });

        if (!updatedTrip) {
          setExpenseError("Unable to import expenses. Please try again.");
          return;
        }

        setTrip(updatedTrip);
        setExpenses(updatedTrip.expenses ?? []);
      } catch (error) {
        console.error("Import expenses error:", error);
        setExpenseError("Unable to import expenses. Please try again.");
        return;
      }

      if (skippedRows > 0) {
        window.alert(
          `Imported ${importedExpenses.length} ${
            importedExpenses.length === 1 ? "expense" : "expenses"
          }. Skipped ${skippedRows} invalid ${
            skippedRows === 1 ? "row" : "rows"
          }.`,
        );
      } else {
        window.alert(
          `Successfully imported ${importedExpenses.length} ${
            importedExpenses.length === 1 ? "expense" : "expenses"
          }.`,
        );
      }
    } catch {
      setExpenseError(
        "Unable to read the CSV file. Please check that it is a valid CSV file.",
      );
    }
  };

  const handlePrintTrip = () => {
    window.print();
  };

  const showShareFeedback = (message: string) => {
    setShareFeedback(message);

    if (shareFeedbackTimerRef.current) {
      clearTimeout(shareFeedbackTimerRef.current);
    }

    shareFeedbackTimerRef.current = setTimeout(() => {
      setShareFeedback(null);
      shareFeedbackTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (shareFeedbackTimerRef.current) {
        clearTimeout(shareFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleShareTrip = async () => {
    if (!trip) {
      return;
    }

    const shareUrl = window.location.href;
    const shareText = `${trip.origin} to ${trip.destination}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `TravelPlan: ${shareText}`,
          text: `Check out my trip from ${trip.origin} to ${trip.destination}.`,
          url: shareUrl,
        });

        showShareFeedback("Trip shared successfully.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showShareFeedback("Trip link copied to your clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (copied) {
          showShareFeedback("Trip link copied to your clipboard.");
          return;
        }
      } catch {
        // Fall through to the user-facing error below.
      }

      showShareFeedback(
        "Unable to share the trip. Please copy the page link manually.",
      );
    }
  };

  const requestDeleteExpense = (expenseId: number, itemLabel: string) => {
    deleteTriggerRef.current =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;

    setDeleteConfirmation({
      type: "expense",
      id: expenseId,
      itemLabel,
    });
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!trip || !user) {
      return;
    }

    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== expenseId,
    );

    try {
      const updatedTrip = await updateTrip(trip.id, user.id, {
        expenses: updatedExpenses,
      });

      if (!updatedTrip) {
        setExpenseError("Unable to delete this expense. Please try again.");
        return;
      }

      setTrip(updatedTrip);
      setExpenses(updatedTrip.expenses ?? []);
    } catch (error) {
      console.error("Delete expense error:", error);
      setExpenseError("Unable to delete this expense. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) {
      return;
    }

    const confirmation = deleteConfirmation;
    setDeleteConfirmation(null);

    if (confirmation.type === "itinerary") {
      await handleDeleteItineraryItem(confirmation.id);
    } else {
      await handleDeleteExpense(confirmation.id);
    }

    window.requestAnimationFrame(() => {
      deleteTriggerRef.current?.focus();
    });
  };

  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return <TripDetailsSkeleton />;
  }

  /*
   * ========================================
   * TRIP NOT FOUND
   * ========================================
   */

  if (!trip) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {loadError ? (
            <ErrorState
              title="Unable to load trip"
              message={loadError}
              actionLabel="Try Again"
              onAction={() => {
                setLoadError("");
                setLoadRetryKey((key) => key + 1);
              }}
            />
          ) : (
            <ErrorState
              title="Trip not found"
              message="This trip doesn't exist or doesn't belong to your account. Check your saved trips and open it again."
              actionLabel="Back to Saved Trips"
              onAction={() => navigate("/saved-trips")}
            />
          )}
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * TRIP DATE + STATUS
   * ========================================
   */

  const formattedDate = formatTripDate(trip.travelDate);

  const tripStatus = getTripStatus(trip.travelDate);

  const tripCountdown = getTripCountdownText(trip.travelDate);

  /*
   * ========================================
   * CHECK COORDINATES
   * ========================================
   */

  const hasCoordinates =
    trip.originLatitude !== undefined &&
    trip.originLongitude !== undefined &&
    trip.destinationLatitude !== undefined &&
    trip.destinationLongitude !== undefined;

  /*
   * ========================================
   * MAP POINTS
   * ========================================
   */

  const originPoint: RoutePoint | null = hasCoordinates
    ? {
        lat: trip.originLatitude!,
        lng: trip.originLongitude!,
      }
    : null;

  const destinationPoint: RoutePoint | null = hasCoordinates
    ? {
        lat: trip.destinationLatitude!,
        lng: trip.destinationLongitude!,
      }
    : null;

  /*
   * ========================================
   * MAP CENTER
   * ========================================
   */

  const mapCenter: [number, number] =
    originPoint && destinationPoint
      ? [
          (originPoint.lat + destinationPoint.lat) / 2,
          (originPoint.lng + destinationPoint.lng) / 2,
        ]
      : [20.5937, 78.9629];

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <>
      <style>{`
        button:not(:disabled),
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button:not(:disabled):active,
        a:active {
          transform: translateY(1px);
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media print {
          @page { margin: 12mm; }

          html, body { background: white !important; }

          nav, button, input, select, label, .print-hide,
          .leaflet-control-container {
            display: none !important;
          }

          .trip-details-print {
            min-height: auto !important;
            padding: 0 !important;
            background: white !important;
          }

          .trip-details-print > div {
            max-width: none !important;
          }

          .trip-details-print .shadow-sm {
            box-shadow: none !important;
          }

          .trip-details-print .border-slate-200 {
            border-color: #d1d5db !important;
          }

          .trip-details-print [role="alert"] {
            display: none !important;
          }

          .trip-details-print section,
          .trip-details-print > div > div {
            break-inside: avoid;
          }
        }
      `}</style>

      <main className="trip-details-print min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {shareFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="print-hide fixed bottom-6 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {shareFeedback}
            </div>
          )}

          {/* ========================================
            HEADER
        ======================================== */}

          <div className="mb-8">
            <Link
              to="/saved-trips"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 print-hide inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-0.5 hover:text-slate-900"
            >
              <span>←</span>
              Back to Saved Trips
            </Link>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-7 sm:p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Trip Details
                  </p>

                  <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                    {trip.origin} <span className="text-slate-300">→</span>{" "}
                    {trip.destination}
                  </h1>

                  <p className="mt-3 max-w-2xl text-slate-600">
                    Everything you need for your journey, from route details to
                    travel information.
                  </p>
                </div>

                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePrintTrip}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 print-hide inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
                  >
                    <span className="text-base leading-none">🖨️</span>
                    Print Trip
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTrip}
                    aria-label="Share this trip"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 print-hide inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      ↗
                    </span>
                    Share Trip
                  </button>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      tripStatus === "upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : tripStatus === "today"
                          ? "bg-green-100 text-green-700"
                          : tripStatus === "past"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tripStatus === "upcoming"
                      ? "Upcoming"
                      : tripStatus === "today"
                        ? "Today"
                        : tripStatus === "past"
                          ? "Completed"
                          : "Date not specified"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    {tripCountdown}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================
            ROUTE CARD
        ======================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Route
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Your journey
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Road trip
              </span>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm text-white">
                    A
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Starting point
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {trip.origin}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center text-2xl font-bold text-slate-300 md:px-2">
                <span className="hidden md:block">→</span>

                <span className="md:hidden">↓</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                    B
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Destination
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {trip.destination}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================
            MAP + ROUTE
        ======================================== */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Map Header */}

            <div className="border-b border-slate-200 p-4 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Journey Map
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {trip.origin} to {trip.destination}
              </h2>

              {routeLoading && (
                <div
                  className="mt-3 flex items-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-300"
                  />
                  <span className="text-sm text-slate-500">
                    Calculating the best driving route...
                  </span>
                </div>
              )}
            </div>

            {/* Map */}

            {hasCoordinates && originPoint && destinationPoint ? (
              <div
                className="h-[300px] w-full sm:h-[420px]"
                aria-label={`Map showing the route from ${trip.origin} to ${trip.destination}`}
              >
                <MapContainer
                  center={mapCenter}
                  zoom={5}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapView
                    origin={originPoint}
                    destination={destinationPoint}
                    route={route?.coordinates ?? []}
                  />

                  {/* Origin Marker */}

                  <Marker
                    position={[originPoint.lat, originPoint.lng]}
                    icon={originIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Starting Point</p>

                        <p className="mt-1">{trip.origin}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination Marker */}

                  <Marker
                    position={[destinationPoint.lat, destinationPoint.lng]}
                    icon={destinationIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Destination</p>

                        <p className="mt-1">{trip.destination}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route Line */}

                  {route && route.coordinates.length > 0 && (
                    <Polyline
                      positions={route.coordinates}
                      pathOptions={{
                        color: "#0f172a",
                        weight: 5,
                        opacity: 0.8,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center bg-slate-50 px-6 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    🗺️
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Map Unavailable
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    This trip was created before location coordinates were
                    saved. Create a new trip using the location suggestions to
                    enable the map.
                  </p>
                </div>
              </div>
            )}

            {/* Route Stats */}

            {route && (
              <div className="grid border-t border-slate-200 sm:grid-cols-2">
                {/* Distance */}

                <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r">
                  <p className="text-sm font-medium text-slate-500">
                    Driving Distance
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatDistance(route.distance)}
                  </p>
                </div>

                {/* Time */}

                <div className="p-6">
                  <p className="text-sm font-medium text-slate-500">
                    Estimated Driving Time
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatRouteDuration(route.duration)}
                  </p>
                </div>
              </div>
            )}

            {/* Route Error */}

            {routeError && (
              <div className="border-t border-slate-200 px-6 py-4">
                <ErrorState
                  compact
                  title="Route unavailable"
                  message={routeError}
                  actionLabel={
                    trip.originLatitude === undefined ||
                    trip.originLongitude === undefined ||
                    trip.destinationLatitude === undefined ||
                    trip.destinationLongitude === undefined
                      ? undefined
                      : routeLoading
                        ? undefined
                        : "Try again"
                  }
                  onAction={() => {
                    setRouteError("");
                    setRouteRetryKey((current) => current + 1);
                  }}
                />
              </div>
            )}
          </div>

          {/* ========================================
            ITINERARY
        ======================================== */}

          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Itinerary
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Plan your journey
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Add activities to each day so you have a clear plan for your
                  trip.
                </p>
              </div>

              <button
                ref={itineraryAddButtonRef}
                type="button"
                onClick={() => {
                  setEditingItineraryId(null);
                  setItineraryError("");

                  setItineraryForm((current) => ({
                    ...current,
                    day:
                      current.day >= 1 && current.day <= durationDays
                        ? current.day
                        : 1,
                  }));

                  setIsAddingItineraryItem((current) => !current);
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md sm:w-auto"
              >
                <span className="text-lg leading-none">+</span>
                Add Activity
              </button>
            </div>

            {itineraryError && (
              <div className="mb-5">
                <ErrorState
                  compact
                  title="Itinerary update failed"
                  message={itineraryError}
                />
              </div>
            )}

            {(isAddingItineraryItem || editingItineraryId !== null) && (
              <div className="print-hide mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      {editingItineraryId !== null
                        ? "Edit activity"
                        : "New activity"}
                    </p>

                    <h3
                      id="itinerary-form-title"
                      className="mt-1 text-xl font-bold text-slate-900"
                    >
                      {editingItineraryId !== null
                        ? "Update your activity"
                        : "Add an activity"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeItineraryForm}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-lg px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close itinerary form"
                  >
                    ×
                  </button>
                </div>

                <form
                  aria-labelledby="itinerary-form-title"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editingItineraryId !== null) {
                      handleUpdateItineraryItem();
                    } else {
                      handleAddItineraryItem();
                    }
                  }}
                >
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="itinerary-title"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Activity
                      </label>

                      <input
                        ref={itineraryTitleRef}
                        id="itinerary-title"
                        type="text"
                        value={itineraryForm.title}
                        onChange={(event) =>
                          handleItineraryFormChange("title", event.target.value)
                        }
                        placeholder="Visit Fort Aguada"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="itinerary-day"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Day
                      </label>

                      <select
                        id="itinerary-day"
                        value={itineraryForm.day}
                        onChange={(event) =>
                          handleItineraryFormChange("day", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      >
                        {Array.from(
                          {
                            length: durationDays,
                          },
                          (_, index) => index + 1,
                        ).map((day) => (
                          <option key={day} value={day}>
                            Day {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="itinerary-time"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Time
                        <span className="ml-1 font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="itinerary-time"
                        type="time"
                        value={itineraryForm.time}
                        onChange={(event) =>
                          handleItineraryFormChange("time", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="itinerary-notes"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Notes
                        <span className="ml-1 font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="itinerary-notes"
                        type="text"
                        value={itineraryForm.notes}
                        onChange={(event) =>
                          handleItineraryFormChange("notes", event.target.value)
                        }
                        placeholder="Book tickets in advance"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingItineraryItem(false);
                        setEditingItineraryId(null);
                        resetItineraryForm();
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                    >
                      {editingItineraryId !== null
                        ? "Save Changes"
                        : "Add Activity"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Daily plan</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {totalItineraryItems === 0
                      ? "No activities added yet."
                      : `${totalItineraryItems} ${
                          totalItineraryItems === 1 ? "activity" : "activities"
                        } planned`}
                  </p>

                  {totalItineraryItems > 0 && (
                    <div className="mt-4 max-w-sm">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Progress</span>

                        <span className="text-slate-700">
                          {completedItineraryCount}/{totalItineraryItems}{" "}
                          completed
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-300"
                          style={{
                            width: `${itineraryProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {itineraryProgress}% complete
                      </p>
                    </div>
                  )}
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {durationDays} {durationDays === 1 ? "day" : "days"}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {itineraryByDay.map(({ day, items }) => (
                  <div key={day} className="px-6 py-6 md:px-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                        {day}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-bold text-slate-900">
                          Day {day}
                        </h4>

                        {items.length === 0 ? (
                          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
                            <p className="text-sm font-medium text-slate-600">
                              No activities planned for this day.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingItineraryId(null);
                                setItineraryError("");

                                setItineraryForm({
                                  day,
                                  title: "",
                                  time: "",
                                  notes: "",
                                });

                                setIsAddingItineraryItem(true);
                              }}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 mt-2 text-sm font-semibold text-slate-900 hover:underline"
                            >
                              + Add an activity
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-xl border p-4 transition ${
                                  completedItineraryItems[item.id]
                                    ? "border-green-200 bg-green-50/50"
                                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex min-w-0 flex-1 gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleItineraryItemCompletion(item.id)
                                      }
                                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                                        completedItineraryItems[item.id]
                                          ? "border-green-600 bg-green-600 text-white"
                                          : "border-slate-300 bg-white text-transparent hover:border-slate-500"
                                      }`}
                                      aria-label={
                                        completedItineraryItems[item.id]
                                          ? `Mark ${item.title} as incomplete`
                                          : `Mark ${item.title} as complete`
                                      }
                                    >
                                      ✓
                                    </button>

                                    <div className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {item.time && (
                                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            🕐 {item.time}
                                          </span>
                                        )}

                                        <h5
                                          className={`text-base font-bold ${
                                            completedItineraryItems[item.id]
                                              ? "text-slate-500 line-through"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {item.title}
                                        </h5>

                                        {completedItineraryItems[item.id] && (
                                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                            Completed
                                          </span>
                                        )}
                                      </div>

                                      {item.notes && (
                                        <p
                                          className={`mt-2 text-sm leading-6 ${
                                            completedItineraryItems[item.id]
                                              ? "text-slate-400"
                                              : "text-slate-600"
                                          }`}
                                        >
                                          {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 gap-2 pl-9 sm:pl-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditingItineraryItem(item)
                                      }
                                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        requestDeleteItineraryItem(
                                          item.id,
                                          item.title,
                                        )
                                      }
                                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================
            EXPENSE TRACKER
        ======================================== */}

          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Expense Tracker
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Track your trip spending
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Keep your expenses organized and see how they compare with
                  your trip budget.
                </p>
              </div>

              <div className="print-hide flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                <button
                  ref={expenseAddButtonRef}
                  type="button"
                  onClick={() => {
                    setExpenseError("");
                    setIsAddingExpense((current) => !current);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md sm:w-auto"
                >
                  <span className="text-lg leading-none">+</span>
                  Add Expense
                </button>

                <label
                  tabIndex={0}
                  role="button"
                  aria-label="Import expenses from CSV"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      expenseFileInputRef.current?.click();
                    }
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
                >
                  <span className="text-base leading-none">↑</span>
                  Import CSV
                  <input
                    ref={expenseFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportExpenses}
                    className="hidden"
                  />
                </label>

                {expenses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportExpenses}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md sm:w-auto"
                  >
                    <span className="text-base leading-none">↓</span>
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {expenseError && (
              <div className="mb-5">
                <ErrorState
                  compact
                  title="Expense action needs attention"
                  message={expenseError}
                />
              </div>
            )}

            {isAddingExpense && (
              <div className="print-hide mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    {editingExpenseId !== null ? "Edit expense" : "New expense"}
                  </p>

                  <h3
                    id="expense-form-title"
                    className="mt-1 text-xl font-bold text-slate-900"
                  >
                    {editingExpenseId !== null
                      ? "Update trip expense"
                      : "Add a trip expense"}
                  </h3>
                </div>

                <form
                  aria-labelledby="expense-form-title"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editingExpenseId !== null) {
                      handleUpdateExpense();
                    } else {
                      handleAddExpense();
                    }
                  }}
                >
                  <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label
                        htmlFor="expense-amount"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Amount
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                          ₹
                        </span>

                        <input
                          ref={expenseAmountRef}
                          id="expense-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={expenseForm.amount}
                          onChange={(event) =>
                            setExpenseForm((current) => ({
                              ...current,
                              amount: event.target.value,
                            }))
                          }
                          placeholder="1500"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="expense-category"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Category
                      </label>

                      <select
                        id="expense-category"
                        value={expenseForm.category}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            category: event.target.value as ExpenseCategory,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      >
                        {expenseCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="expense-date"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Date
                      </label>

                      <input
                        id="expense-date"
                        type="date"
                        value={expenseForm.date}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            date: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="expense-description"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Description
                      </label>

                      <input
                        id="expense-description"
                        type="text"
                        value={expenseForm.description}
                        onChange={(event) =>
                          setExpenseForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Dinner at the hotel"
                        maxLength={100}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeExpenseForm}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingExpense}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingExpense
                        ? editingExpenseId !== null
                          ? "Updating..."
                          : "Saving..."
                        : editingExpenseId !== null
                          ? "Update Expense"
                          : "Save Expense"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Spent
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across {expenses.length}{" "}
                  {expenses.length === 1 ? "expense" : "expenses"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Trip Budget
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {budgetAmount !== null
                    ? `₹${budgetAmount.toLocaleString("en-IN")}`
                    : trip.budget}
                </p>

                <p className="mt-1 text-xs text-slate-400">Planned budget</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  {remainingBudget !== null && remainingBudget < 0
                    ? "Over Budget"
                    : "Remaining"}
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    remainingBudget !== null && remainingBudget < 0
                      ? "text-red-600"
                      : "text-slate-900"
                  }`}
                >
                  {remainingBudget !== null
                    ? `₹${Math.abs(remainingBudget).toLocaleString("en-IN")}`
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {remainingBudget !== null && remainingBudget < 0
                    ? "Reduce spending to get back on budget"
                    : "Available to spend"}
                </p>
              </div>
            </div>

            {budgetAmount !== null && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Budget usage
                  </p>

                  <p
                    className={`text-sm font-bold ${
                      totalExpenses > budgetAmount
                        ? "text-red-600"
                        : "text-slate-900"
                    }`}
                  >
                    {Math.round((totalExpenses / budgetAmount) * 100)}%
                  </p>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalExpenses > budgetAmount
                        ? "bg-red-500"
                        : "bg-slate-900"
                    }`}
                    style={{ width: `${expenseProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ========================================
              BUDGET ALERT
          ======================================== */}

            <div
              className={`mt-4 rounded-2xl border p-5 shadow-sm ${
                budgetAlert.level === "danger"
                  ? "border-red-200 bg-red-50"
                  : budgetAlert.level === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : budgetAlert.level === "healthy"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${
                    budgetAlert.level === "danger"
                      ? "bg-red-100"
                      : budgetAlert.level === "warning"
                        ? "bg-amber-100"
                        : budgetAlert.level === "healthy"
                          ? "bg-emerald-100"
                          : "bg-white"
                  }`}
                >
                  {budgetAlert.level === "danger"
                    ? "🚨"
                    : budgetAlert.level === "warning"
                      ? "⚠️"
                      : budgetAlert.level === "healthy"
                        ? "✅"
                        : "💡"}
                </div>

                <div className="min-w-0">
                  <p
                    className={`font-bold ${
                      budgetAlert.level === "danger"
                        ? "text-red-800"
                        : budgetAlert.level === "warning"
                          ? "text-amber-800"
                          : budgetAlert.level === "healthy"
                            ? "text-emerald-800"
                            : "text-slate-800"
                    }`}
                  >
                    {budgetAlert.title}
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      budgetAlert.level === "danger"
                        ? "text-red-700"
                        : budgetAlert.level === "warning"
                          ? "text-amber-700"
                          : budgetAlert.level === "healthy"
                            ? "text-emerald-700"
                            : "text-slate-600"
                    }`}
                  >
                    {budgetAlert.message}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================
              EXPENSE CATEGORY BREAKDOWN
          ======================================== */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Spending breakdown
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Expense by category
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    See where most of your trip spending is going.
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  {expenses.length === 0
                    ? "No spending recorded"
                    : `₹${totalExpenses.toLocaleString("en-IN")} total`}
                </p>
              </div>

              {totalExpenses === 0 ? (
                <div className="mt-6 rounded-xl bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                    📊
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Add expenses to see your category breakdown.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {expenseCategoryBreakdown.map(
                    ({ category, amount, percentage }) => (
                      <div key={category}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="text-lg">
                              {category === "Food"
                                ? "🍴"
                                : category === "Travel"
                                  ? "🚕"
                                  : category === "Hotel"
                                    ? "🏨"
                                    : category === "Activities"
                                      ? "🎟️"
                                      : "💳"}
                            </span>

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {category}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <p className="text-sm font-bold text-slate-900">
                              ₹{amount.toLocaleString("en-IN")}
                            </p>

                            <span className="min-w-12 text-right text-xs font-semibold text-slate-500">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* ========================================
              EXPENSE ANALYTICS
          ======================================== */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Spending insights
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Expense analytics
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  A quick overview of your trip spending patterns.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Average Expense
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {expenses.length > 0
                      ? `₹${Math.round(expenseAnalytics.averageExpense).toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Per recorded expense
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Largest Expense
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {expenseAnalytics.largestExpense
                      ? `₹${expenseAnalytics.largestExpense.amount.toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {expenseAnalytics.largestExpense?.description ??
                      "No expense recorded"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Spending Days
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {expenseAnalytics.spendingDays}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Days with recorded spending
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Average Daily Spend
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {expenseAnalytics.spendingDays > 0
                      ? `₹${Math.round(expenseAnalytics.averageDailySpending).toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Based on spending days
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  💡
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Spending insight
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {expenseAnalytics.insight}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================
              DAILY EXPENSE SUMMARY
          ======================================== */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Daily spending
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Expense summary by date
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    See how much you spent on each day of your trip.
                  </p>
                </div>

                {dailyExpenseSummary.length > 0 && (
                  <p className="text-sm font-semibold text-slate-500">
                    {dailyExpenseSummary.length}{" "}
                    {dailyExpenseSummary.length === 1 ? "day" : "days"} with
                    spending
                  </p>
                )}
              </div>

              {dailyExpenseSummary.length === 0 ? (
                <div className="mt-6 rounded-xl bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                    📅
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Add expenses to see your daily spending.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {dailyExpenseSummary.map((day) => (
                    <div key={day.date}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                            📅
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {new Date(
                                `${day.date}T00:00:00`,
                              ).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>

                            <p className="text-xs text-slate-400">
                              {day.count}{" "}
                              {day.count === 1 ? "expense" : "expenses"}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg font-bold text-slate-900 sm:text-right">
                          ₹{day.amount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${day.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Expense history
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {expenses.length === 0
                        ? "No expenses added yet."
                        : "Filter and sort your recorded trip expenses."}
                    </p>
                  </div>

                  {expenses.length > 0 && (
                    <div className="print-hide grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="expense-filter"
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                        >
                          Category
                        </label>
                        <select
                          id="expense-filter"
                          value={expenseCategoryFilter}
                          onChange={(event) =>
                            setExpenseCategoryFilter(
                              event.target.value as ExpenseCategory | "All",
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                        >
                          <option value="All">All categories</option>
                          {expenseCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="expense-sort"
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                        >
                          Sort by
                        </label>
                        <select
                          id="expense-sort"
                          value={expenseSort}
                          onChange={(event) =>
                            setExpenseSort(
                              event.target.value as
                                | "newest"
                                | "oldest"
                                | "highest"
                                | "lowest",
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="highest">Highest amount</option>
                          <option value="lowest">Lowest amount</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {expenses.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <p className="text-xs font-medium text-slate-500">
                      Showing {visibleExpenses.length} of {expenses.length}{" "}
                      expenses
                    </p>

                    {(expenseCategoryFilter !== "All" ||
                      expenseSort !== "newest") && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpenseCategoryFilter("All");
                          setExpenseSort("newest");
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 text-xs font-semibold text-slate-900 hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {expenses.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    💳
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Start tracking your spending.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 mt-2 text-sm font-semibold text-slate-900 hover:underline"
                  >
                    + Add your first expense
                  </button>
                </div>
              ) : visibleExpenses.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    🔎
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No expenses match the selected category.
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpenseCategoryFilter("All")}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 mt-2 text-sm font-semibold text-slate-900 hover:underline"
                  >
                    Show all expenses
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visibleExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                          {expense.category === "Food"
                            ? "🍴"
                            : expense.category === "Travel"
                              ? "🚕"
                              : expense.category === "Hotel"
                                ? "🏨"
                                : expense.category === "Activities"
                                  ? "🎟️"
                                  : "💳"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 break-words font-semibold text-slate-900 sm:truncate">
                              {expense.description}
                            </p>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {expense.category}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>Expense #{expense.id}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                `${expense.date}T00:00:00`,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="text-lg font-bold text-slate-900">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditExpense(expense)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              requestDeleteExpense(
                                expense.id,
                                expense.description,
                              )
                            }
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ========================================
            TRIP INFORMATION
        ======================================== */}

          <div className="mt-6">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Trip Information
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Key details
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <span className={detailIconClass}>⏱️</span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Duration
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {trip.duration}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <span className={detailIconClass}>💰</span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Estimated Budget
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {trip.budget}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <span className={detailIconClass}>📅</span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Travel Date
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formattedDate}
                </p>

                <p className="mt-1 text-xs text-slate-500">{tripCountdown}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <span className={detailIconClass}>👥</span>
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Travelers
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {trip.travelers || 1}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(trip.travelers || 1) === 1 ? "Person" : "People"}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
            TRIP STATUS + ACTIONS
        ======================================== */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Trip Status
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {tripStatus === "upcoming"
                    ? "Your trip is coming up"
                    : tripStatus === "today"
                      ? "Your trip is today! 🎉"
                      : tripStatus === "past"
                        ? "This trip has been completed"
                        : "Travel date not specified"}
                </p>

                <p className="mt-1 text-sm text-slate-500">{tripCountdown}</p>
              </div>

              <span
                className={`self-start rounded-full px-4 py-2 text-sm font-semibold md:self-auto ${
                  tripStatus === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : tripStatus === "today"
                      ? "bg-green-100 text-green-700"
                      : tripStatus === "past"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-600"
                }`}
              >
                {tripStatus === "upcoming"
                  ? "Upcoming"
                  : tripStatus === "today"
                    ? "Today"
                    : tripStatus === "past"
                      ? "Completed"
                      : "Date not specified"}
              </span>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Trip ID
              </p>

              <p className="mt-1 font-mono text-sm text-slate-600">
                #{trip.id}
              </p>
            </div>
          </div>

          {/* ========================================
            ACTIONS
        ======================================== */}

          <div className="print-hide mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              to={`/dashboard?tripId=${trip.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 min-h-12 rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
            >
              View Dashboard
            </Link>

            <Link
              to={`/saved-trips/${trip.id}/edit`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Edit Trip
            </Link>

            <Link
              to="/saved-trips"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              All Saved Trips
            </Link>
          </div>
        </div>
      </main>

      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 px-6 py-8 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl"
              >
                ⚠️
              </div>

              <div className="min-w-0">
                <h2
                  id="delete-dialog-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Delete{" "}
                  {deleteConfirmation.type === "itinerary"
                    ? "activity"
                    : "expense"}
                  ?
                </h2>

                <p
                  id="delete-dialog-description"
                  className="mt-2 text-sm leading-6 text-slate-600"
                >
                  Are you sure you want to delete “
                  {deleteConfirmation.itemLabel}”? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={deleteCancelButtonRef}
                type="button"
                onClick={() => {
                  setDeleteConfirmation(null);
                  window.requestAnimationFrame(() => {
                    deleteTriggerRef.current?.focus();
                  });
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TripDetails;
