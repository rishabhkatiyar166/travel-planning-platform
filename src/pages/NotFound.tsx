import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
            🧭
          </div>

          {/* Error */}
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Error 404
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Page Not Found
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            Looks like you've taken a wrong turn. The page you're
            looking for doesn't exist or may have been moved.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              ← Back to Home
            </Link>

            <Link
              to="/saved-trips"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              View Saved Trips
            </Link>
          </div>

          {/* Branding */}
          <div className="mt-10 border-t border-slate-100 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <span>✈️</span>
              <span>Travel Planner</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFound;