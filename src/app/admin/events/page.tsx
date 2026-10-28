"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Pencil,
  CalendarDays,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Globe,
  EyeOff,
  LoaderCircle,
  Building2,
  CalendarRange,
  ExternalLink,
  Copy,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type EventStatus = "draft" | "published";

type EventItem = {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  status: EventStatus;
};

type EventsResponse = {
  success: boolean;
  events?: EventItem[];
  message?: string;
};

function formatDate(value: string) {
  if (!value) return "Date not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startDate: string, endDate: string) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === end || !endDate) return start;

  return `${start} – ${end}`;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "EV"
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function getPublicUrl(event: EventItem) {
    if (typeof window === "undefined") return `/public/${encodeURIComponent(event.slug)}`;
    return `${window.location.origin}/public/${encodeURIComponent(event.slug)}`;
  }

  async function copyPublicUrl(event: EventItem) {
    const publicUrl = getPublicUrl(event);

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public URL copied to clipboard.");
    } catch {
      // Clipboard access may be blocked in an insecure context or by browser settings.
      window.prompt("Copy this public URL:", publicUrl);
    }
  }

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch("/api/events", {
        cache: "no-store",
      });

      const result = (await response.json()) as EventsResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load events.");
      }

      setEvents(result.events ?? []);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to load events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEvents();
  }, [loadEvents]);

  async function togglePublish(event: EventItem) {
    const nextAction = event.status === "published" ? "unpublish" : "publish";

    const confirmed = window.confirm(
      nextAction === "publish"
        ? `Publish "${event.name}"? Its public agenda will become accessible.`
        : `Unpublish "${event.name}"? Its public agenda will no longer be accessible.`,
    );

    if (!confirmed) return;

    setUpdatingId(event._id);

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(event._id)}/publish`,
        { method: "PATCH" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update event status.");
      }

      setEvents((current) =>
        current.map((item) =>
          item._id === event._id
            ? { ...item, status: result.event.status as EventStatus }
            : item,
        ),
      );

      toast.success(result.message || "Event status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update event status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredEvents = events.filter((event) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return [event.name, event.code, event.venue, event.city, event.slug].some(
      (value) => value?.toLowerCase().includes(term),
    );
  });

  const publishedCount = events.filter(
    (event) => event.status === "published",
  ).length;

  const draftCount = events.length - publishedCount;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7] px-4 py-6 text-[#241000] sm:px-6 sm:py-8 lg:px-10">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-orange-200/25 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-amber-100/40 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1600px]">
        {/* Back navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="group inline-flex items-center gap-2 rounded-xl border border-[#f0dfd2] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#68432c] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-[#c2410c]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to Dashboard
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#856550]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin workspace
          </div>
        </div>

        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#c2410c] sm:text-[11px]">
              <Sparkles size={13} />
              Conference management
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl lg:text-[42px]">
              Events<span className="text-[#ea580c]">.</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806451] sm:text-base">
              Manage conferences, edit scientific programmes, and control which
              agendas are visible to attendees.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ecd8ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#68432c] shadow-sm transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              href="/admin/events/new"
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-700/20 transition hover:-translate-y-0.5 hover:bg-[#c2410c]"
            >
              <Plus
                size={17}
                className="transition-transform group-hover:rotate-90"
              />
              Create event
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.header>

        {/* Statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total events",
              value: events.length,
              detail: "Conferences in your account",
              icon: CalendarDays,
              iconStyle: "bg-orange-50 text-[#ea580c]",
              accent: "from-orange-500 to-amber-400",
            },
            {
              label: "Published",
              value: publishedCount,
              detail: "Public agendas enabled",
              icon: Globe,
              iconStyle: "bg-emerald-50 text-emerald-700",
              accent: "from-emerald-500 to-green-400",
            },
            {
              label: "Drafts",
              value: draftCount,
              detail: "Not visible to the public",
              icon: EyeOff,
              iconStyle: "bg-amber-50 text-amber-700",
              accent: "from-amber-500 to-yellow-400",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group relative overflow-hidden rounded-2xl border border-[#f0dfd3] bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-950/[0.05]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${stat.accent}`}
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#806451]">
                    {stat.label}
                  </span>

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconStyle}`}
                  >
                    <Icon size={19} />
                  </span>
                </div>

                <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums">
                  {loading ? "—" : stat.value}
                </p>

                <p className="mt-1 text-xs text-[#9a7b67]">{stat.detail}</p>
              </motion.article>
            );
          })}
        </section>

        {/* Search and events heading */}
        <section className="mt-9 rounded-2xl border border-[#f0dfd3] bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={19} className="text-[#ea580c]" />
                <h2 className="text-lg font-extrabold tracking-tight">
                  Your conferences
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#806451]">
                {filteredEvents.length} event
                {filteredEvents.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a18470]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, code, venue..."
                aria-label="Search events"
                className="h-11 w-full rounded-xl border border-[#ecd8ca] bg-[#fffdfb] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#b19a88] focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>
        </section>

        {/* Error */}
        {pageError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-bold">Could not load your events</p>
              <p className="mt-1">{pageError}</p>

              <button
                type="button"
                onClick={() => void loadEvents()}
                className="mt-2 font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#f0dfd3] bg-white"
              >
                <div className="h-1.5 bg-orange-200" />
                <div className="space-y-5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-orange-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-orange-100" />
                      <div className="h-4 w-36 max-w-full rounded bg-orange-100" />
                    </div>
                  </div>
                  <div className="h-20 rounded-xl bg-orange-50" />
                  <div className="h-10 rounded-xl bg-orange-100" />
                </div>
              </div>
            ))}
          </div>
        ) : !pageError && filteredEvents.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-[#e7cbb8] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e6] text-[#ea580c]">
              {search ? <Search size={25} /> : <CalendarDays size={27} />}
            </div>

            <h3 className="mt-5 text-xl font-extrabold">
              {search ? "No matching events" : "No events created yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806451]">
              {search
                ? "Try another search term or clear your search."
                : "Create your first conference to start building its scientific programme."}
            </p>

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-[#c2410c] transition hover:bg-orange-50"
              >
                Clear search
              </button>
            ) : (
              <Link
                href="/admin/events/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c2410c]"
              >
                <Plus size={17} />
                Create your first event
              </Link>
            )}
          </div>
        ) : (
          /* Exactly 3 columns on large desktop screens */
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event, index) => {
              const isPublished = event.status === "published";
              const isUpdating = updatingId === event._id;

              return (
                <motion.article
                  key={event._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.25) }}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ecd9cb] bg-white shadow-[0_3px_12px_rgba(69,26,3,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_16px_35px_rgba(124,45,18,0.09)]"
                >
                  <div className="h-1.5 bg-gradient-to-r from-[#ea580c] via-[#f28b50] to-[#f5c5a4]" />

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    {/* Event title and status */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 text-sm font-extrabold text-[#c2410c]">
                        {getInitials(event.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        {event.code && (
                          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#b35a2a]">
                            {event.code}
                          </p>
                        )}

                        <h3 className="mt-1 break-words text-base font-extrabold leading-snug text-[#301607] transition-colors group-hover:text-[#c2410c]">
                          {event.name}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${
                          isPublished
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-amber-100 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {isPublished ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <EyeOff size={11} />
                        )}
                        {isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#806451]">
                        {event.description}
                      </p>
                    )}

                    {/* Event information */}
                    <div className="mt-4 flex-1 space-y-3 rounded-xl border border-[#f5e9df] bg-[#fffaf7] p-3.5">
                      <div className="flex items-start gap-2.5 text-xs leading-5 text-[#68432c]">
                        <CalendarRange
                          size={15}
                          className="mt-0.5 shrink-0 text-[#c15a22]"
                        />
                        <span>
                          {formatDateRange(event.startDate, event.endDate)}
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs leading-5 text-[#68432c]">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-[#c15a22]"
                        />
                        <span className="break-words">
                          {[event.venue, event.city]
                            .filter(Boolean)
                            .join(", ") || "Venue not set"}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-start gap-2.5 text-xs leading-5 text-[#68432c]">
                        <Building2
                          size={15}
                          className="mt-0.5 shrink-0 text-[#c15a22]"
                        />
                        <span className="min-w-0 break-all">
                          /public/{event.slug}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      <Link
                        href={`/admin/events/${encodeURIComponent(event._id)}/edit`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-bold text-[#c2410c] transition hover:bg-orange-100 sm:text-sm"
                      >
                        <Pencil size={15} />
                        Edit event
                      </Link>

                      <Link
                        href={`/admin/events/${event._id}/agenda`}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-semibold text-white transition hover:bg-[#C7470A]"
                      >
                        <CalendarDays size={16} />
                        Manage agenda
                        <ArrowRight size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => void togglePublish(event)}
                        disabled={isUpdating || updatingId !== null}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
                          isPublished
                            ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {isUpdating ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : isPublished ? (
                          <EyeOff size={15} />
                        ) : (
                          <Globe size={15} />
                        )}

                        {isUpdating
                          ? "Updating..."
                          : isPublished
                            ? "Unpublish event"
                            : "Publish event"}
                      </button>

                      {isPublished && (
                        <Link
                          href={`/public/${encodeURIComponent(event.slug)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[#ecd9cb] bg-white px-3 py-2 text-xs font-semibold text-[#68432c] transition hover:border-orange-200 hover:bg-orange-50"
                        >
                          <ExternalLink size={14} />
                          Open public page
                        </Link>
                      )}

                      {isPublished && (
                        <button
                          type="button"
                          onClick={() => void copyPublicUrl(event)}
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-[#c2410c] transition hover:bg-orange-100"
                        >
                          <Copy size={14} />
                          Copy public URL
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#f0dfd2] py-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Sparkles size={15} />
            </span>
            <div>
              <p className="text-xs font-bold text-[#59331d]">
                Scientific Program Manager
              </p>
              <p className="mt-0.5 text-[10px] text-[#a18776]">
                Conference administration workspace
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c2410c] transition hover:underline"
          >
            <ArrowLeft size={13} />
            Return to dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
