import { destinations } from "../../data/destinations";

interface ItineraryProps {
  duration: string;
  destination: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

function Itinerary({
  duration,
  destination,
}: ItineraryProps) {
  const numberOfDays = parseInt(duration, 10) || 1;

  // Convert the destination to lowercase
  // so Goa, GOA and goa all work.
  const destinationKey = destination.trim().toLowerCase();

  const destinationData = destinations[destinationKey];

  // Use destination-specific activities when available.
  // Otherwise show generic activities.
  const activities = destinationData?.activities ?? [
    "Explore popular attractions",
    "Try local food",
    "Visit a nearby landmark",
    "Enjoy some free time",
  ];

  const itinerary: ItineraryDay[] = Array.from(
    { length: numberOfDays },
    (_, index) => ({
      day: index + 1,
      title:
        index === 0
          ? "Arrival & Exploration"
          : index === numberOfDays - 1
          ? "Final Day & Departure"
          : `Explore ${destinationData?.name ?? destination}`,
      activities: activities.slice(
        (index * 2) % activities.length,
        ((index * 2) % activities.length) + 2
      ),
    })
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Your Schedule
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Itinerary
        </h2>

        <p className="mt-2 text-slate-600">
          Your {numberOfDays}-day travel plan for{" "}
          {destinationData?.name ?? destination}.
        </p>
      </div>

      {/* Days */}
      <div className="space-y-6">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-start gap-4">
              {/* Day Number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                {day.day}
              </div>

              {/* Day Details */}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">
                  Day {day.day}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {day.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {day.activities.map(
                    (activity, index) => (
                      <li
                        key={`${day.day}-${index}`}
                        className="flex items-start gap-3 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

                        <span>{activity}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Itinerary;