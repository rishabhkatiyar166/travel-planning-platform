import { destinations } from "../../data/destinations";

interface DestinationInfoProps {
  destination: string;
}

function DestinationInfo({
  destination,
}: DestinationInfoProps) {
  const destinationKey = destination.trim().toLowerCase();

  const destinationData = destinations[destinationKey];

  if (!destinationData) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Destination
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {destination}
        </h2>

        <p className="mt-3 text-slate-600">
          Explore this destination and discover places,
          experiences, and local attractions.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Destination
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {destinationData.name}
        </h2>

        <p className="mt-3 max-w-3xl text-slate-600">
          {destinationData.description}
        </p>
      </div>

      {/* Popular Experiences */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900">
          Popular Experiences
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {destinationData.activities.map(
            (activity, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-700">
                  {activity}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default DestinationInfo;