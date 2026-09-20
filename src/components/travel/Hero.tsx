import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-6 py-20 sm:py-24 lg:py-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white opacity-70 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
          <span>✈️</span>
          <span>Travel Planning Platform</span>
        </div>

        {/* Heading */}
        <h1 className="mt-7 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Plan your journey.
          <br />
          <span className="text-slate-600">
            Enjoy the adventure.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Organize destinations, build itineraries, manage your
          trips, and keep everything you need for your journey in
          one simple place.
        </p>

        {/* CTA buttons */}
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/plan-trip"
            className="rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Plan a Trip
          </Link>

          <Link
            to="/saved-trips"
            className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Explore Trips
          </Link>
        </div>

        {/* Small supporting highlights */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-lg">🗺️</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Plan routes
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Organize your journey from start to destination.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-lg">💰</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Manage budget
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep your travel spending easy to track.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-lg">💾</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Save trips
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep your travel plans organized in one place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;