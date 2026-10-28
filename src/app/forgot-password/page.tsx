
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Use a new password with at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recoveryCode,
          newPassword,
          confirmPassword,
        }),
      });

      const data: { message?: string } = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Unable to reset your password.");
        return;
      }

      setMessage(
        data.message ?? "Password reset successfully. You can now sign in.",
      );
      setRecoveryCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#ead9cd] bg-white px-4 py-3 text-sm text-[#241000] outline-none transition placeholder:text-[#a99587] focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf7] px-4 py-10 text-[#241000]">
      <div className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(71,35,12,0.10)] sm:p-9">
        <Link
          href="/admin-login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#795943] transition hover:text-[#EA580C]"
        >
          <ArrowLeft size={16} />
          Back to admin login
        </Link>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#EA580C]">
          <LockKeyhole size={27} />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#EA580C]">
          Account recovery
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#795943]">
          Enter your admin email and private recovery code, then choose a new
          password. No email will be sent.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Admin email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="recoveryCode"
              className="mb-2 block text-sm font-semibold"
            >
              Private recovery code
            </label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a99587]"
              />
              <input
                id="recoveryCode"
                type={showRecoveryCode ? "text" : "password"}
                autoComplete="off"
                required
                minLength={32}
                maxLength={512}
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value)}
                placeholder="Enter your recovery code"
                className={`${inputClass} pl-10 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowRecoveryCode((value) => !value)}
                aria-label={
                  showRecoveryCode ? "Hide recovery code" : "Show recovery code"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#795943] hover:text-[#EA580C]"
              >
                {showRecoveryCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-semibold"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#795943] hover:text-[#EA580C]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your new password"
              className={inputClass}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {message}
              <Link
                href="/admin-login"
                className="mt-2 block font-bold text-[#EA580C] underline underline-offset-4"
              >
                Go to admin login
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#c2410c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200/70 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={17} />
            {loading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-[#927967]">
          Keep your recovery code private. Anyone who obtains it may be able to
          reset the admin password.
        </p>
      </section>
    </main>
  );
}
