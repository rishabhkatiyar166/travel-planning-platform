import { destinations } from "../../data/destinations";

interface PlacesCardProps {
  destination: string;
}

function PlacesCard({ destination }: PlacesCardProps) {
  const destinationKey = destination.trim().toLowerCase();

  const destinationData = destinations[destinationKey];

  const places = destinationData?.activities ?? [
    "Popular tourist attractions",
    "Local landmarks",
    "Scenic viewpoints",
    "Local markets",
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Explore
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Places & Attractions
          </h2>

          <p className="mt-2 text-slate-600">
            Popular places and experiences in {destination}.
          </p>
        </div>

        <div className="text-3xl">📍</div>
      </div>

      {/* Places */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {places.map((place, index) => (
          <div
            key={`${place}-${index}`}
            className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-400 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
                📍
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  {place}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Popular experience
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Count */}
      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {places.length}
          </span>{" "}
          recommended places and experiences.
        </p>
      </div>
    </section>
  );
}

export default PlacesCard;