import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../services/supabaseClient";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /*
   * ========================================
   * CHECK PASSWORD RESET SESSION
   * ========================================
   */

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsReady(true);
      } else {
        setError(
          "This password reset link is invalid or has expired."
        );
      }
    };

    checkSession();
  }, []);

  /*
   * ========================================
   * HANDLE PASSWORD UPDATE
   * ========================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsUpdating(false);
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
            🔐
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Create a new password for your account.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          {!isReady && !error && (
            <div className="text-center text-sm text-slate-600">
              Checking reset link...
            </div>
          )}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {isReady && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Success */}

              {success && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {success}
                </div>
              )}

              {/* New Password */}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </form>
          )}

          {/* Login */}

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>

        {/* Home */}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;