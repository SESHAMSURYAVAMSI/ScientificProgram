
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  MessageSquareMore,
  RefreshCw,
  RotateCcw,
  Search,
  Wifi,
} from "lucide-react";

type DisplayQuestion = {
  _id: string;
  name: string;
  question: string;
  answer?: string;
  createdAt: string;
};

type DisplayEvent = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  city?: string;
};

type QuestionsResponse = {
  success: boolean;
  message?: string;
  event?: DisplayEvent;
  questions?: DisplayQuestion[];
};

function formatEventDates(start?: string, end?: string) {
  if (!start) return "Dates to be announced";

  const startDate = new Date(start);

  if (Number.isNaN(startDate.getTime())) {
    return "Dates to be announced";
  }

  const startText = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!end) return startText;

  const endDate = new Date(end);

  if (
    Number.isNaN(endDate.getTime()) ||
    startDate.toDateString() === endDate.toDateString()
  ) {
    return startText;
  }

  return `${startText} – ${endDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export default function PublicQuestionDisplayPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-[#241000]">
          <p className="text-sm font-medium">
            Loading questions display...
          </p>
        </main>
      }
    >
      <PublicQuestionDisplay />
    </Suspense>
  );
}

function PublicQuestionDisplay() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [event, setEvent] = useState<DisplayEvent | null>(null);
  const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [dismissedLoaded, setDismissedLoaded] = useState(false);

  // Restore the questions cleared by Reset All on this browser.
  useEffect(() => {
    setDismissedLoaded(false);

    try {
      const stored = localStorage.getItem(
        `dismissed-questions-${slug}`,
      );

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (
          Array.isArray(parsed) &&
          parsed.every((id) => typeof id === "string")
        ) {
          setDismissedIds(parsed);
        } else {
          setDismissedIds([]);
        }
      } else {
        setDismissedIds([]);
      }
    } catch (storageError) {
      console.error(
        "Unable to restore dismissed questions:",
        storageError,
      );
      setDismissedIds([]);
    } finally {
      setDismissedLoaded(true);
    }
  }, [slug]);

  const loadQuestions = useCallback(
    async (initial = false) => {
      if (!slug) return;

      if (initial) setLoading(true);

      try {
        const response = await fetch(
          `/api/public/events/${encodeURIComponent(slug)}/questions?display=1&t=${Date.now()}`,
          { cache: "no-store" },
        );

        const data = (await response.json()) as QuestionsResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load conference questions.",
          );
        }

        setEvent(data.event ?? null);
        setQuestions(data.questions ?? []);
        setLastRefreshed(new Date());
        setError("");
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to refresh questions.",
        );
      } finally {
        if (initial) setLoading(false);
      }
    },
    [slug],
  );

  // Fetch the complete question list every 10 seconds.
  // Existing questions remain because the API returns the full list.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQuestions(true);

    const interval = window.setInterval(() => {
      void loadQuestions();
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [loadQuestions]);

  const visibleQuestions = useMemo(() => {
    if (!dismissedLoaded) return [];

    const query = search.trim().toLocaleLowerCase();

    return questions.filter((item) => {
      if (dismissedIds.includes(item._id)) return false;

      return (
        !query ||
        `${item.name} ${item.question}`
          .toLocaleLowerCase()
          .includes(query)
      );
    });
  }, [questions, search, dismissedIds, dismissedLoaded]);

  // Hide the current questions only after the user confirms.
  // Nothing is deleted from MongoDB.
  const resetDisplay = () => {
    if (visibleQuestions.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to reset all displayed questions?\n\nThe questions will disappear from this display, but they will remain saved in the database.",
    );

    if (!confirmed) return;

    const idsToDismiss = [
      ...new Set([
        ...dismissedIds,
        ...questions.map((question) => question._id),
      ]),
    ];

    try {
      localStorage.setItem(
        `dismissed-questions-${slug}`,
        JSON.stringify(idsToDismiss),
      );

      setDismissedIds(idsToDismiss);
      setSearch("");
    } catch (storageError) {
      console.error("Unable to save display reset:", storageError);

      window.alert(
        "Unable to save the reset in this browser. Please check browser storage settings and try again.",
      );
    }
  };

  const venue = [event?.venue, event?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#fffaf7] px-4 py-5 text-[#241000] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="relative flex min-h-[260px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#241000] via-[#7c2d12] to-[#EA580C] px-6 py-8 text-white shadow-xl sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative max-w-4xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Live Q&amp;A Session
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
              {event?.name || "Conference Q&A"}
            </h1>

            {event?.description && (
              <p className="mt-3 max-w-3xl text-base text-white/80 sm:text-lg">
                {event.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={19} />
                {formatEventDates(
                  event?.startDate,
                  event?.endDate,
                )}
              </span>

              {venue && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={19} />
                  {venue}
                </span>
              )}
            </div>
          </div>

          <div className="relative mt-7 flex min-w-[220px] items-center gap-4 rounded-2xl bg-white/10 px-6 py-5 lg:ml-8 lg:mt-0">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15">
              <MessageSquareMore size={30} />
            </span>

            <div>
              <p className="text-sm text-white/75">
                Active Questions
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums">
                {visibleQuestions.length}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                value={search}
                onChange={(inputEvent) =>
                  setSearch(inputEvent.target.value)
                }
                placeholder="Search by question or delegate name..."
                aria-label="Search by question or delegate name"
                className="h-12 w-full rounded-xl border border-orange-100 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <button
              type="button"
              onClick={resetDisplay}
              disabled={visibleQuestions.length === 0}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-100 px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={17} />
              Reset All
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <RefreshCw
                size={17}
                className="animate-[spin_3s_linear_infinite]"
              />
              Live updates · checks every 10 seconds · questions stay
              until Reset All
            </span>

            <span className="inline-flex items-center gap-2">
              <Wifi
                size={16}
                className={
                  error ? "text-rose-500" : "text-emerald-600"
                }
              />
              {error
                ? "Connection issue"
                : lastRefreshed
                  ? `Last refreshed ${lastRefreshed.toLocaleTimeString()}`
                  : "Connecting..."}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error} The display will retry automatically.
            </div>
          )}

          {loading || !dismissedLoaded ? (
            <div className="mt-20 text-center text-sm text-neutral-500">
              Loading live questions...
            </div>
          ) : visibleQuestions.length === 0 ? (
            <div className="mx-auto mt-24 flex min-h-[250px] max-w-[820px] flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white px-6 py-12 text-center shadow-sm">
              <span className="flex size-24 items-center justify-center rounded-full bg-orange-50 text-[#EA580C]">
                <MessageSquareMore size={43} />
              </span>

              <h2 className="mt-7 text-2xl font-bold text-[#241000]">
                No Active Questions
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
                Questions submitted by delegates will appear here
                automatically and remain visible until Reset All is
                confirmed.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {visibleQuestions.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-[#c2410c]">
                      {item.name.trim().charAt(0).toUpperCase() ||
                        "?"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#9a3412]">
                        {item.name}
                      </p>

                      <p className="mt-3 whitespace-pre-wrap break-words text-xl font-medium leading-relaxed text-[#241000] sm:text-2xl">
                        {item.question}
                      </p>

                      {item.answer?.trim() && (
                        <div className="mt-4 rounded-xl bg-orange-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                            Answer
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4a2b19]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
