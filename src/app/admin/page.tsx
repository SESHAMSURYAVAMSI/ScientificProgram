"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Clock3,
  ExternalLink,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type ConferenceEvent = {
  _id: string;
  name: string;
  slug: string;
  code: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  status: "draft" | "published";
};

type DashboardQuestion = {
  _id: string;
  status: "pending" | "approved" | "rejected";
};

type ApiResponse<T> = {
  success: boolean;
  events?: T[];
  questions?: T[];
  message?: string;
};

const navigation = [
  {
    title: "Manage conferences",
    description:
      "Create events, update conference details, and manage publication.",
    href: "/admin/events",
    icon: CalendarDays,
    number: "01",
    iconStyle: "bg-orange-50 text-[#ea580c]",
    accent: "group-hover:bg-orange-600",
  },
  {
    title: "Create conference",
    description:
      "Set up a new conference with its essential information and venue.",
    href: "/admin/events/new",
    icon: Plus,
    number: "02",
    iconStyle: "bg-amber-50 text-amber-700",
    accent: "group-hover:bg-amber-600",
  },
  {
    title: "Agenda management",
    description:
      "Organize event days, halls, sessions, talks, and faculty members.",
    href: "/admin/events",
    icon: ClipboardList,
    number: "03",
    iconStyle: "bg-rose-50 text-rose-700",
    accent: "group-hover:bg-rose-600",
  },
  {
    title: "Questions & Answers",
    description:
      "Review audience questions and manage submitted responses.",
    href: "/admin/questions",
    icon: CircleHelp,
    number: "04",
    iconStyle: "bg-orange-100 text-orange-800",
    accent: "group-hover:bg-orange-700",
  },
];

function formatDate(value: string) {
  if (!value) return "Date not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date not set";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEventDateRange(startDate: string, endDate: string) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === "Date not set" && end === "Date not set") {
    return "Dates not set";
  }

  if (start === end) return start;

  return `${start} – ${end}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<ConferenceEvent[]>([]);
  const [questions, setQuestions] = useState<DashboardQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [eventsResponse, questionsResponse] = await Promise.all([
        fetch("/api/events", { cache: "no-store" }),
        fetch("/api/admin/questions", { cache: "no-store" }),
      ]);

      const eventsData =
        (await eventsResponse.json()) as ApiResponse<ConferenceEvent>;

      if (!eventsResponse.ok || !eventsData.success) {
        throw new Error(
          eventsData.message || "Unable to load conferences.",
        );
      }

      setEvents(eventsData.events ?? []);

      if (questionsResponse.ok) {
        const questionsData =
          (await questionsResponse.json()) as ApiResponse<DashboardQuestion>;

        if (questionsData.success) {
          setQuestions(questionsData.questions ?? []);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, [loadDashboard]);

  const publishedCount = events.filter(
    (event) => event.status === "published",
  ).length;

  const draftCount = events.filter(
    (event) => event.status === "draft",
  ).length;

  const pendingCount = questions.filter(
    (question) => question.status === "pending",
  ).length;

  const stats = [
    {
      label: "Total conferences",
      value: events.length,
      detail: "All conference records",
      icon: CalendarDays,
      iconStyle: "bg-orange-50 text-[#ea580c]",
      accent: "from-orange-500 to-orange-400",
      trend: "Conference workspace",
    },
    {
      label: "Published",
      value: publishedCount,
      detail: "Visible to the public",
      icon: Activity,
      iconStyle: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-500 to-green-400",
      trend: "Live conferences",
    },
    {
      label: "Drafts",
      value: draftCount,
      detail: "Still in preparation",
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-700",
      accent: "from-amber-500 to-yellow-400",
      trend: "Awaiting publication",
    },
    {
      label: "Questions received",
      value: questions.length,
      detail: `${pendingCount} pending responses`,
      icon: CircleHelp,
      iconStyle: "bg-rose-50 text-rose-700",
      accent: "from-rose-500 to-pink-400",
      trend: "Audience engagement",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf7] text-[#241000]">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-orange-200/25 blur-[100px]" />
        <div className="absolute -left-48 top-[35%] h-[30rem] w-[30rem] rounded-full bg-amber-100/40 blur-[100px]" />
        <div className="absolute -bottom-48 right-[10%] h-[28rem] w-[28rem] rounded-full bg-orange-100/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-3 py-1.5 shadow-sm shadow-orange-950/[0.02]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[#ea580c]">
                <Sparkles size={12} />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#c2410c] sm:text-[11px]">
                Scientific Program Manager
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-[#241000] sm:text-4xl lg:text-[42px]">
              Admin dashboard
              {/* <span className="text-[#ea580c]">.</span> */}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#785541] sm:text-base">
              Your central workspace for conferences, scientific programs,
              and audience engagement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#f0d5c2] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#59331d] shadow-sm transition duration-200 hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/events/new"
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#c2410c] hover:shadow-xl hover:shadow-orange-700/25"
            >
              <Plus
                size={17}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
              New conference
              <ArrowRight
                size={15}
                className="ml-0.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.header>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <CircleHelp size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Unable to load dashboard data</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold transition hover:bg-red-100 sm:self-center"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </motion.div>
        )}

        {/* Statistics */}
        <section
          aria-label="Conference statistics"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                }}
                className="group relative overflow-hidden rounded-2xl border border-[#f2dfd1] bg-white/90 p-5 shadow-[0_2px_5px_rgba(69,26,3,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_14px_35px_rgba(124,45,18,0.08)] sm:p-6"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${stat.accent} opacity-70 transition-opacity group-hover:opacity-100`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#785541]">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-[11px] text-[#a18776]">
                      {stat.trend}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconStyle} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-4xl font-extrabold tracking-[-0.05em] text-[#241000] tabular-nums">
                    {loading ? (
                      <span className="inline-block h-9 w-12 animate-pulse rounded-lg bg-orange-100" />
                    ) : (
                      stat.value
                    )}
                  </p>

                  {!loading && (
                    <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7f0] text-[#c2410c]">
                      <ArrowDownRight size={16} />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-[#f7eee8] pt-3">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === 1
                        ? "bg-emerald-500"
                        : index === 2
                          ? "bg-amber-500"
                          : "bg-orange-500"
                    }`}
                  />
                  <p className="text-xs text-[#987a67]">{stat.detail}</p>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* Workspace */}
        <section className="mt-11 sm:mt-14">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#ea580c]" />
                <h2 className="text-xl font-extrabold tracking-tight text-[#241000] sm:text-2xl">
                  Workspace
                </h2>
              </div>

              <p className="mt-2 text-sm text-[#856550]">
                Everything you need to plan and manage your scientific
                programs.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#f0dfd2] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#856550] sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Workspace ready
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {navigation.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                  }}
                  className="h-full"
                >
                  <Link
                    href={item.href}
                    className="group relative flex h-full min-h-[235px] flex-col overflow-hidden rounded-2xl border border-[#f0dfd2] bg-white p-5 shadow-[0_2px_5px_rgba(69,26,3,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(124,45,18,0.08)] sm:p-6"
                  >
                    <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-50/70 transition-transform duration-500 group-hover:scale-150" />

                    <div className="relative flex items-start justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconStyle} transition-all duration-300 group-hover:scale-105`}
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </span>

                      <span className="text-xs font-bold tracking-widest text-[#d6bca9]">
                        {item.number}
                      </span>
                    </div>

                    <div className="relative mt-5">
                      <h3 className="text-base font-bold tracking-tight text-[#321a0b] transition-colors group-hover:text-[#c2410c]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#856550]">
                        {item.description}
                      </p>
                    </div>

                    <div className="relative mt-auto flex items-center justify-between pt-6">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#c2410c]">
                        Open module
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </span>

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7f0] text-[#c2410c] transition-all duration-200 ${item.accent} group-hover:text-white`}
                      >
                        <ExternalLink size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recent conferences */}
        <section className="mt-11 sm:mt-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#ea580c]" />
                <h2 className="text-xl font-extrabold tracking-tight text-[#241000] sm:text-2xl">
                  Recent conferences
                </h2>
              </div>

              <p className="mt-2 text-sm text-[#856550]">
                A quick overview of your latest conference records.
              </p>
            </div>

            <Link
              href="/admin/events"
              className="group inline-flex items-center gap-2 self-start rounded-lg px-2 py-2 text-sm font-bold text-[#c2410c] transition-colors hover:bg-orange-50 sm:self-auto"
            >
              View all conferences
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#f0dfd2] bg-white/95 shadow-[0_3px_12px_rgba(69,26,3,0.035)]">
            {/* Table heading */}
            <div className="hidden items-center justify-between border-b border-[#f5e9df] bg-[#fffdfb] px-6 py-3.5 sm:flex">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a18776]">
                Conference details
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a18776]">
                Actions
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 p-5 sm:p-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 max-w-full rounded bg-orange-100" />
                      <div className="h-3 w-56 max-w-full rounded bg-orange-50" />
                    </div>
                    <div className="hidden h-9 w-28 rounded-lg bg-orange-50 sm:block" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="px-5 py-14 text-center sm:px-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-[#ea580c]">
                  <CalendarDays size={28} strokeWidth={1.6} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#321a0b]">
                  No conferences yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#856550]">
                  Your conference workspace is ready. Create your first
                  conference to start building its scientific agenda.
                </p>

                <Link
                  href="/admin/events/new"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-700/15 transition hover:-translate-y-0.5 hover:bg-[#c2410c]"
                >
                  <Plus size={17} />
                  Create your first conference
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#f5e9df]">
                {events.slice(0, 5).map((event, index) => (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    className="group flex flex-col gap-4 px-4 py-5 transition-colors duration-200 hover:bg-[#fffaf6] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 text-sm font-extrabold text-[#c2410c] transition-transform group-hover:scale-105">
                        {getInitials(event.name) || "EV"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-bold text-[#321a0b] transition-colors group-hover:text-[#c2410c]">
                            {event.name}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                              event.status === "published"
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-amber-100 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {event.status === "published" ? (
                              <CheckCircle2 size={11} />
                            ) : (
                              <Clock3 size={11} />
                            )}

                            {event.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#856550]">
                          {(event.venue || event.city) && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin
                                size={13}
                                className="shrink-0 text-[#c08457]"
                              />
                              <span>
                                {[event.venue, event.city]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              size={13}
                              className="shrink-0 text-[#c08457]"
                            />
                            {formatEventDateRange(
                              event.startDate,
                              event.endDate,
                            )}
                          </span>
                        </div>

                        {event.code && (
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ad927f]">
                            Code: {event.code}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 pl-0 sm:pl-3">
                      <Link
                        href={`/admin/events/${event._id}/agenda`}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#c2410c] transition-all duration-200 hover:border-[#ea580c] hover:bg-orange-50 sm:flex-none sm:text-sm"
                      >
                        <ClipboardList size={15} />
                        Edit agenda
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {!loading && events.length > 5 && (
              <div className="border-t border-[#f5e9df] bg-[#fffdfb] px-5 py-4 text-center">
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#c2410c] hover:underline"
                >
                  View all {events.length} conferences
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#f0dfd2] pb-2 pt-6 sm:mt-14">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#ea580c]">
                <Sparkles size={14} />
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

            <div className="flex items-center gap-2 text-[11px] text-[#a18776]">
              <TrendingUp size={13} className="text-[#c2410c]" />
              Plan better. Manage smarter.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}