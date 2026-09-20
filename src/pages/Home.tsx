import { Link } from "react-router-dom";
import Hero from "../components/travel/Hero";
import FeatureCard from "../components/travel/FeatureCard";

function Home() {
  return (
    <>
      <Hero />

      {/* Features */}
      <section className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl">

          {/* Section heading */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Simple travel planning
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for your trip
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Plan, organize, and manage your journey from one
              simple place.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="🗺️"
              title="Plan your trip"
              description="Organize destinations, travel dates, travelers, budget, and important trip details."
            />

            <FeatureCard
              icon="📅"
              title="Build your itinerary"
              description="Keep your journey structured and make it easier to manage everything you want to do."
            />

            <FeatureCard
              icon="💾"
              title="Save your trips"
              description="Keep all your travel plans organized and access them whenever you need them."
            />
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            ✈️
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Ready to plan your next adventure?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Start creating your travel plan and keep your entire
            journey organized in one place.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/plan-trip"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Plan a Trip
            </Link>

            <Link
              to="/saved-trips"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              View Saved Trips
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;