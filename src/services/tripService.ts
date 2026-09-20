import { supabase } from "./supabaseClient";

export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Hotel"
  | "Activities"
  | "Other";

export interface TripExpense {
  id: number;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
}

export interface ItineraryItem {
  id: number;
  day: number;
  title: string;
  time?: string;
  notes?: string;
  completed?: boolean;
}

export interface Trip {
  id: number;
  destination: string;
  origin: string;
  duration: string;
  budget: string;
  travelDate?: string;
  travelers?: number;
  userEmail?: string;

  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;

  itinerary?: ItineraryItem[];
  expenses?: TripExpense[];
  completedItineraryItems?: Record<number, boolean>;
}

interface SupabaseTrip {
  id: number;
  user_id: string;

  destination: string;
  origin: string;
  duration: string;
  budget: string;

  travel_date: string | null;
  travelers: number | null;
  user_email: string | null;

  origin_latitude: number | null;
  origin_longitude: number | null;

  destination_latitude: number | null;
  destination_longitude: number | null;

  itinerary: ItineraryItem[];

  expenses: TripExpense[];

  completed_itinerary_items: Record<number, boolean>;

  created_at: string;
  updated_at: string;
}

const mapSupabaseTrip = (row: SupabaseTrip): Trip => {
  return {
    id: Number(row.id),

    destination: row.destination,
    origin: row.origin,
    duration: row.duration,
    budget: row.budget,

    travelDate: row.travel_date ?? undefined,
    travelers: row.travelers ?? undefined,
    userEmail: row.user_email ?? undefined,

    originLatitude: row.origin_latitude ?? undefined,
    originLongitude: row.origin_longitude ?? undefined,

    destinationLatitude: row.destination_latitude ?? undefined,
    destinationLongitude: row.destination_longitude ?? undefined,

    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],

    expenses: Array.isArray(row.expenses) ? row.expenses : [],

    completedItineraryItems:
      row.completed_itinerary_items &&
      typeof row.completed_itinerary_items === "object"
        ? row.completed_itinerary_items
        : {},
  };
};

export const getUserTrips = async (
  userId: string,
): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapSupabaseTrip(row as SupabaseTrip),
  );
};

export const getTripById = async (
  tripId: number | string,
  userId: string,
): Promise<Trip | null> => {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapSupabaseTrip(data as SupabaseTrip);
};

export const addTrip = async (
  trip: Trip,
  userId: string,
): Promise<Trip> => {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: userId,

      destination: trip.destination.trim(),
      origin: trip.origin.trim(),
      duration: trip.duration,
      budget: trip.budget,

      travel_date: trip.travelDate ?? null,
      travelers: trip.travelers ?? null,
      user_email: trip.userEmail ?? null,

      origin_latitude: trip.originLatitude ?? null,
      origin_longitude: trip.originLongitude ?? null,

      destination_latitude:
        trip.destinationLatitude ?? null,
      destination_longitude:
        trip.destinationLongitude ?? null,

      itinerary: trip.itinerary ?? [],

      expenses: trip.expenses ?? [],

      completed_itinerary_items:
        trip.completedItineraryItems ?? {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSupabaseTrip(data as SupabaseTrip);
};

export const updateTrip = async (
  tripId: number | string,
  userId: string,
  updatedData: Partial<Trip>,
): Promise<Trip | null> => {
  const updatePayload: Record<string, unknown> = {};

  if (updatedData.destination !== undefined) {
    updatePayload.destination =
      updatedData.destination.trim();
  }

  if (updatedData.origin !== undefined) {
    updatePayload.origin = updatedData.origin.trim();
  }

  if (updatedData.duration !== undefined) {
    updatePayload.duration = updatedData.duration;
  }

  if (updatedData.budget !== undefined) {
    updatePayload.budget = updatedData.budget;
  }

  if (updatedData.travelDate !== undefined) {
    updatePayload.travel_date = updatedData.travelDate;
  }

  if (updatedData.travelers !== undefined) {
    updatePayload.travelers = updatedData.travelers;
  }

  if (updatedData.userEmail !== undefined) {
    updatePayload.user_email = updatedData.userEmail;
  }

  if (updatedData.originLatitude !== undefined) {
    updatePayload.origin_latitude =
      updatedData.originLatitude;
  }

  if (updatedData.originLongitude !== undefined) {
    updatePayload.origin_longitude =
      updatedData.originLongitude;
  }

  if (updatedData.destinationLatitude !== undefined) {
    updatePayload.destination_latitude =
      updatedData.destinationLatitude;
  }

  if (updatedData.destinationLongitude !== undefined) {
    updatePayload.destination_longitude =
      updatedData.destinationLongitude;
  }

  if (updatedData.itinerary !== undefined) {
    updatePayload.itinerary = updatedData.itinerary;
  }

  if (updatedData.expenses !== undefined) {
    updatePayload.expenses = updatedData.expenses;
  }

  if (
    updatedData.completedItineraryItems !== undefined
  ) {
    updatePayload.completed_itinerary_items =
      updatedData.completedItineraryItems;
  }

  const { data, error } = await supabase
    .from("trips")
    .update(updatePayload)
    .eq("id", tripId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapSupabaseTrip(data as SupabaseTrip);
};

export const deleteTrip = async (
  tripId: number | string,
  userId: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data && data.length > 0);
};

export const getLatestUserTrip = async (
  userId: string,
): Promise<Trip | null> => {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapSupabaseTrip(data as SupabaseTrip);
};