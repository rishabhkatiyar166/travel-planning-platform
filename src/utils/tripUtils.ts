/*
 * ========================================
 * TRIP UTILITIES
 * ========================================
 */


/*
 * ========================================
 * TRIP STATUS
 * ========================================
 */

export type TripStatus =
  | "upcoming"
  | "today"
  | "past"
  | "unknown";


/*
 * ========================================
 * GET TRIP STATUS
 * ========================================
 *
 * Determines whether a trip is:
 *
 * - Upcoming
 * - Today
 * - Past
 * - Unknown
 */

export const getTripStatus = (
  travelDate?: string
): TripStatus => {

  if (!travelDate) {
    return "unknown";
  }


  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const tripDate = new Date(
    `${travelDate}T00:00:00`
  );


  if (Number.isNaN(tripDate.getTime())) {
    return "unknown";
  }


  tripDate.setHours(
    0,
    0,
    0,
    0
  );


  if (
    tripDate.getTime() ===
    today.getTime()
  ) {

    return "today";

  }


  if (tripDate > today) {

    return "upcoming";

  }


  return "past";

};


/*
 * ========================================
 * DAYS UNTIL TRIP
 * ========================================
 *
 * Returns:
 *
 * Positive number → days remaining
 * 0 → trip is today
 * Negative number → trip has passed
 * null → no valid date
 */

export const getDaysUntilTrip = (
  travelDate?: string
): number | null => {

  if (!travelDate) {
    return null;
  }


  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const tripDate = new Date(
    `${travelDate}T00:00:00`
  );


  if (Number.isNaN(tripDate.getTime())) {
    return null;
  }


  tripDate.setHours(
    0,
    0,
    0,
    0
  );


  const difference =
    tripDate.getTime() -
    today.getTime();


  const millisecondsPerDay =
    1000 *
    60 *
    60 *
    24;


  return Math.round(
    difference /
      millisecondsPerDay
  );

};


/*
 * ========================================
 * FORMAT TRIP DATE
 * ========================================
 *
 * Converts:
 *
 * 2026-09-25
 *
 * into:
 *
 * 25 September 2026
 */

export const formatTripDate = (
  travelDate?: string
): string => {

  if (!travelDate) {
    return "Not specified";
  }


  const date = new Date(
    `${travelDate}T00:00:00`
  );


  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

};


/*
 * ========================================
 * TRIP COUNTDOWN TEXT
 * ========================================
 *
 * Creates user-friendly text such as:
 *
 * "16 days until your trip"
 * "Your trip is today!"
 * "Trip completed 12 days ago"
 */

export const getTripCountdownText = (
  travelDate?: string
): string => {

  const days =
    getDaysUntilTrip(travelDate);


  if (days === null) {
    return "Travel date not specified";
  }


  if (days === 0) {
    return "Your trip is today! 🎉";
  }


  if (days > 0) {

    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } until your trip`;

  }


  const daysAgo =
    Math.abs(days);


  return `Trip completed ${daysAgo} ${
    daysAgo === 1
      ? "day"
      : "days"
  } ago`;

};