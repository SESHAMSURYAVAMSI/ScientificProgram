
"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Unable to sign in.");
        return;
      }

      router.replace("/admin");
      router.refresh();
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

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_30px_100px_-35px_rgba(80,35,8,0.25)] md:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#EA580C] to-[#7c2d12] p-10 text-white md:flex"
        >
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/15" />
          <div className="absolute -right-8 top-32 h-40 w-40 rounded-full border border-white/15" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <LockKeyhole size={23} />
            </div>
            <div>
              <p className="font-semibold tracking-wide">SciProgram</p>
              <p className="text-xs text-orange-100">
                Scientific Program Manager
              </p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <span className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium">
              CONFERENCE MANAGEMENT
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Every session.
              <br />
              Every speaker.
              <br />
              One workspace.
            </h1>
            <p className="mt-5 leading-7 text-orange-100">
              Plan scientific programs, coordinate faculty and publish
              beautifully organized conference agendas.
            </p>
          </div>

          <p className="relative text-xs text-orange-100/80">
            A unified workspace for scientific events.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="p-7 sm:p-10 md:p-12"
        >
          <div className="mb-10 md:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#EA580C]">
              <LockKeyhole size={23} />
            </div>
            <p className="text-xl font-bold">SciProgram</p>
            <p className="text-sm text-[#7d6a5c]">
              Scientific Program Manager
            </p>
          </div>

          <p className="text-sm font-semibold text-[#EA580C]">
            ADMINISTRATOR ACCESS
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#806d60]">
            Sign in to manage your conferences and scientific programs.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-[#fffaf7] px-4 transition focus-within:border-[#EA580C] focus-within:ring-4 focus-within:ring-orange-100">
                <Mail size={18} className="shrink-0 text-[#a38b79]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b6a496]"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#EA580C] transition hover:text-[#c94708] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-[#fffaf7] px-4 transition focus-within:border-[#EA580C] focus-within:ring-4 focus-within:ring-orange-100">
                <LockKeyhole size={18} className="shrink-0 text-[#a38b79]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b6a496]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-[#a38b79] transition hover:text-[#EA580C]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-[#c94708] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-[#a18c7c]">
            Authorized administrators only.
            <br />
            Secure access to your scientific program workspace.
          </p>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-xs text-[#806d60] transition hover:text-[#EA580C]"
            >
              Back to home
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
