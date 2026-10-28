
"use client";

import {
  Suspense,
  type FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      setError("Your password must not exceed 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Unable to reset your password.");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        router.replace("/admin-login");
      }, 1800);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf7] px-5 py-12 text-[#241000]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-orange-100/70 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-lg rounded-[2rem] border border-orange-100 bg-white p-7 shadow-[0_30px_100px_-35px_rgba(80,35,8,0.25)] sm:p-10"
      >
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#EA580C]">
          <LockKeyhole size={26} />
        </div>

        <p className="text-sm font-semibold tracking-wide text-[#EA580C]">
          SECURE ACCOUNT RECOVERY
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Create a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#806d60]">
          Choose a strong password with at least 8 characters.
        </p>

        {!token && !success && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            No reset token was found in this link. Request a new password-reset
            link to continue.
            <Link
              href="/forgot-password"
              className="mt-2 block font-semibold text-[#c94708] underline"
            >
              Request a new link
            </Link>
          </div>
        )}

        {success ? (
          <div
            role="status"
            className="mt-7 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={20} />
              Password updated successfully.
            </div>
            <p className="mt-2">
              Redirecting you to the administrator login page...
            </p>
            <Link
              href="/admin-login"
              className="mt-3 inline-block font-semibold underline"
            >
              Sign in now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                disabled={!token || loading}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                className="h-12 w-full rounded-xl border border-orange-100 bg-[#fffaf7] px-4 text-sm outline-none transition focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                disabled={!token || loading}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                className="h-12 w-full rounded-xl border border-orange-100 bg-[#fffaf7] px-4 text-sm outline-none transition focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!token || loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-[#c94708] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>
          </form>
        )}

        <Link
          href="/admin-login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-[#806d60] transition hover:text-[#EA580C]"
        >
          <ArrowLeft size={16} />
          Back to administrator login
        </Link>
      </motion.section>
    </main>
  );
}

function ResetPasswordLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-5 text-[#241000]">
      <p className="text-sm text-[#806d60]">Loading password reset...</p>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
