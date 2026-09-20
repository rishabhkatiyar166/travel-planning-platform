import {
  getTripById,
  updateTrip,
  type ItineraryItem,
} from "./tripService";


/*
 * ========================================
 * GET TRIP ITINERARY
 * ========================================
 */

export const getTripItinerary = async (
  tripId: number | string,
  userId: string
): Promise<ItineraryItem[]> => {
  const trip = await getTripById(tripId, userId);

  if (!trip) {
    return [];
  }

  return trip.itinerary ?? [];
};


/*
 * ========================================
 * ADD ITINERARY ITEM
 * ========================================
 */

export const addItineraryItem = async (
  tripId: number | string,
  userId: string,
  item: Omit<ItineraryItem, "id">
): Promise<ItineraryItem | null> => {
  const trip = await getTripById(tripId, userId);

  if (!trip) {
    return null;
  }

  const itinerary = trip.itinerary ?? [];

  const newItem: ItineraryItem = {
    ...item,
    id: Date.now(),
  };

  const updatedTrip = await updateTrip(
    tripId,
    userId,
    {
      itinerary: [...itinerary, newItem],
    }
  );

  if (!updatedTrip) {
    return null;
  }

  return newItem;
};


/*
 * ========================================
 * UPDATE ITINERARY ITEM
 * ========================================
 */

export const updateItineraryItem = async (
  tripId: number | string,
  userId: string,
  itemId: number,
  updatedData: Partial<Omit<ItineraryItem, "id">>
): Promise<ItineraryItem | null> => {
  const trip = await getTripById(tripId, userId);

  if (!trip) {
    return null;
  }

  const itinerary = trip.itinerary ?? [];

  let updatedItem: ItineraryItem | null = null;

  const updatedItinerary = itinerary.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    updatedItem = {
      ...item,
      ...updatedData,
      id: item.id,
    };

    return updatedItem;
  });

  if (!updatedItem) {
    return null;
  }

  const updatedTrip = await updateTrip(
    tripId,
    userId,
    {
      itinerary: updatedItinerary,
    }
  );

  if (!updatedTrip) {
    return null;
  }

  return updatedItem;
};


/*
 * ========================================
 * DELETE ITINERARY ITEM
 * ========================================
 */

export const deleteItineraryItem = async (
  tripId: number | string,
  userId: string,
  itemId: number
): Promise<boolean> => {
  const trip = await getTripById(tripId, userId);

  if (!trip) {
    return false;
  }

  const itinerary = trip.itinerary ?? [];

  const updatedItinerary = itinerary.filter(
    (item) => item.id !== itemId
  );

  if (updatedItinerary.length === itinerary.length) {
    return false;
  }

  const updatedTrip = await updateTrip(
    tripId,
    userId,
    {
      itinerary: updatedItinerary,
    }
  );

  return updatedTrip !== null;
};


/*
 * ========================================
 * GET ITINERARY ITEMS FOR A DAY
 * ========================================
 */

export const getItineraryForDay = async (
  tripId: number | string,
  userId: string,
  day: number
): Promise<ItineraryItem[]> => {
  const itinerary = await getTripItinerary(
    tripId,
    userId
  );

  return itinerary.filter(
    (item) => item.day === day
  );
};