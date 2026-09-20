import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * ========================================
   * HANDLE LOGIN
   * ========================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(
        normalizedEmail,
        password
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ========================================
   * UI
   * ========================================
   */

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">
            ✈️
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue planning your
            trips.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error */}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Email */}

            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          {/* Signup */}

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Home */}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;