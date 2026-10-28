
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  Users,
  CircleHelp,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

type ConferenceEvent = {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
};

type EventsResponse = {
  success: boolean;
  events?: ConferenceEvent[];
  message?: string;
};

function formatDate(value: string) {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PublicConferencesPage() {
  const [events, setEvents] = useState<ConferenceEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public/events", {
        cache: "no-store",
      });

      const data = (await response.json()) as EventsResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load conferences.",
        );
      }

      setEvents(data.events ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conferences. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return events;

    return events.filter((event) =>
      [
        event.name,
        event.code,
        event.description ?? "",
        event.venue,
        event.city,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [events, search]);

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#241000]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-20 top-80 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/conferences" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ea580c] text-white shadow-lg shadow-orange-600/20">
              <CalendarDays size={22} />
            </span>
            <span>
              <span className="block text-lg font-bold">
                Scientific Programs
              </span>
              <span className="block text-xs text-[#785541]">
                Conferences & agendas
              </span>
            </span>
          </Link>

          <Link
            href="/admin-login"
            className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#785541] transition hover:bg-orange-50"
          >
            Admin login
          </Link>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#241000] via-[#4a210b] to-[#9a3412] px-6 py-12 text-white shadow-xl shadow-orange-950/10 sm:px-10 sm:py-16 lg:px-14"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
            <Sparkles size={15} />
            Scientific Program Manager
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover conferences.
            <span className="mt-2 block text-orange-300">
              Explore every agenda.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-orange-50/85 sm:text-base">
            Browse published conferences, explore scientific sessions,
            discover speakers, and submit questions to the program.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-orange-50">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5">
              <CalendarDays size={16} />
              Scientific agendas
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5">
              <Users size={16} />
              Speakers & sessions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5">
              <CircleHelp size={16} />
              Audience Q&A
            </span>
          </div>
        </motion.section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2410c]">
                Conference directory
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Published conferences
              </h2>
              <p className="mt-2 text-sm text-[#785541]">
                Find an event and open its scientific program.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-[#785541] transition hover:bg-orange-50 disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh list
            </button>
          </div>

          <div className="relative mt-6 max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a7b68]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by conference, code, city, or venue..."
              aria-label="Search published conferences"
              className="w-full rounded-2xl border border-orange-100 bg-white py-4 pl-12 pr-4 text-sm outline-none transition placeholder:text-[#b09a8b] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
              <button
                type="button"
                onClick={() => void loadEvents()}
                className="ml-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-12 text-center text-sm text-[#785541]">
              Loading published conferences...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-orange-200 bg-white/80 px-6 py-16 text-center">
              <CalendarDays
                size={34}
                className="mx-auto text-orange-400"
              />
              <h3 className="mt-4 text-lg font-bold">
                {events.length === 0
                  ? "No published conferences yet"
                  : "No matching conferences"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#785541]">
                {events.length === 0
                  ? "Published events will appear here when they are ready for attendees."
                  : "Try another conference name, code, venue, or city."}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-5 text-xs text-[#9a7b68]">
                Showing {filteredEvents.length} of {events.length} conferences
              </p>

              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.04, 0.24),
                    }}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-950/5"
                  >
                    <div className="h-2 bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fbbf24]" />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#c2410c]">
                          <CalendarDays size={23} />
                        </span>

                        {event.code && (
                          <span className="rounded-full border border-orange-100 bg-[#fffaf7] px-3 py-1.5 text-xs font-bold text-[#785541]">
                            {event.code}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-xl font-bold leading-snug">
                        {event.name}
                      </h3>

                      {event.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#785541]">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-3 text-sm text-[#785541]">
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            size={17}
                            className="mt-0.5 shrink-0 text-[#c2410c]"
                          />
                          <span>
                            {formatDate(event.startDate)}
                            {event.endDate &&
                              ` – ${formatDate(event.endDate)}`}
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-[#c2410c]"
                          />
                          <span>
                            {[event.venue, event.city]
                              .filter(Boolean)
                              .join(", ") || "Venue to be announced"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
                        <Link
                          href={`/agenda/${encodeURIComponent(event.slug)}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c2410c]"
                        >
                          View agenda
                          <ArrowRight size={16} />
                        </Link>

                        <Link
                          href={`/agenda/${encodeURIComponent(event.slug)}/questions`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-[#c2410c] transition hover:bg-orange-50"
                        >
                          <CircleHelp size={16} />
                          Ask a question
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="mt-14 border-t border-orange-100 py-6 text-center text-xs text-[#9a7b68]">
          Scientific Program Manager · Official conference programs
        </footer>
      </div>
    </main>
  );
}
