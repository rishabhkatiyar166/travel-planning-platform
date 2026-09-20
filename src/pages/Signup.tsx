import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * ========================================
   * HANDLE SIGNUP
   * ========================================
   */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const normalizedName = name.trim();

    const normalizedEmail = email.trim().toLowerCase();

    /*
     * ========================================
     * VALIDATION
     * ========================================
     */

    if (!normalizedName) {
      setError("Please enter your name.");
      return;
    }

    if (normalizedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    /*
     * ========================================
     * CREATE ACCOUNT
     * ========================================
     *
     * We use the login function here because
     * AuthContext will authenticate the user
     * through Supabase.
     *
     * NOTE:
     * This is temporary signup handling.
     * We will add the actual Supabase
     * signUp() function in the next step.
     *
     * ========================================
     */

    try {
      const result = await signUp(normalizedName, normalizedEmail, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSignupSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ========================================
   * UI
   * ========================================
   */

  if (signupSuccess) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mb-4 text-4xl">📧</div>

            <h1 className="text-2xl font-bold text-slate-900">
              Check your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              We've sent a confirmation link to your email address. Please
              confirm your email before signing in.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">✈️</div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Start planning your next adventure.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Name */}

            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>

              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Your name"
                autoComplete="name"
                required
                minLength={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="signup-email"
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
                htmlFor="signup-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Confirm Password */}

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Sign in
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

export default Signup;
