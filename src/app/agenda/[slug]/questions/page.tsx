
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

type PublicQuestion = {
  _id: string;
  name: string;
  question: string;
  answer?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
};

type QuestionsResponse = {
  success: boolean;
  message?: string;
  event?: {
    name?: string;
    venue?: string;
    city?: string;
  };
  questions?: PublicQuestion[];
};

function PublicQuestionsContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [eventName, setEventName] = useState("Conference Q&A");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQuestions = useCallback(async (showLoader = false) => {
    if (!slug) return;

    if (showLoader) setLoading(true);

    try {
      const response = await fetch(
        `/api/public/events/${encodeURIComponent(slug)}/questions`,
        { cache: "no-store" },
      );

      const data = (await response.json()) as QuestionsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load questions.");
      }

      setEventName(data.event?.name || "Conference Q&A");
      setQuestions(data.questions || []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load questions. Please try again.",
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQuestions(true);

    const refreshInterval = window.setInterval(() => {
      void loadQuestions();
    }, 10_000);

    return () => window.clearInterval(refreshInterval);
  }, [loadQuestions]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/public/events/${encodeURIComponent(slug)}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, question }),
        },
      );

      const data = (await response.json()) as QuestionsResponse & {
        question?: PublicQuestion;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit your question.");
      }

      // Show the submitted question immediately, without waiting 30 seconds.
      if (data.question) {
        setQuestions((current) => [
          data.question!,
          ...current.filter((item) => item._id !== data.question!._id),
        ]);
      } else {
        await loadQuestions();
      }

      setName("");
      setEmail("");
      setQuestion("");
      setSuccess(
        data.message ||
          "Your question has been submitted and is now visible.",
      );

      // Refresh from the database to keep the list synchronized.
      void loadQuestions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#241000]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-24 top-72 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <a
          href={`/agenda/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#785541] transition hover:bg-orange-100/70 hover:text-[#c2410c]"
        >
          <ArrowLeft size={16} />
          Back to agenda
        </a>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#241000] via-[#4a210b] to-[#9a3412] p-7 text-white shadow-xl shadow-orange-950/10 sm:p-10"
        >
          <div className="flex items-center gap-3 text-orange-200">
            <MessageCircle size={21} />
            <span className="text-xs font-bold uppercase tracking-[0.22em]">
              Conference discussion
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions & Answers
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50/85 sm:text-base">
            {eventName}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-orange-100/90">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
              <CalendarDays size={14} />
              Updates every 10 seconds
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
              <CircleHelp size={14} />
              No approval required
            </span>
          </div>
        </motion.header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="h-fit rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold">Ask a question</h2>
            <p className="mt-2 text-sm leading-6 text-[#785541]">
              Submit your question for the conference. It will appear on this
              page immediately after successful submission.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="question-name"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Your name
                </label>
                <input
                  id="question-name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition placeholder:text-[#b09a8b] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="question-email"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Email address
                </label>
                <input
                  id="question-email"
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition placeholder:text-[#b09a8b] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="question-text"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Your question
                </label>
                <textarea
                  id="question-text"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Type your question here..."
                  className="w-full resize-y rounded-xl border border-orange-100 bg-[#fffaf7] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#b09a8b] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
                <p className="mt-1 text-right text-xs text-[#9a7b68]">
                  {question.length}/2000
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800"
                >
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-[#c2410c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                {submitting ? "Submitting..." : "Submit question"}
              </button>
            </form>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2410c]">
                  Live discussion
                </p>
                <h2 className="mt-1 text-2xl font-bold">Community questions</h2>
                <p className="mt-1 text-sm text-[#785541]">
                  {questions.length}{" "}
                  {questions.length === 1 ? "question" : "questions"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadQuestions(true)}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#785541] transition hover:bg-orange-50 disabled:opacity-60"
              >
                <LoaderCircle
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-5 flex items-center justify-center rounded-2xl border border-orange-100 bg-white p-12 text-sm text-[#785541]">
                <LoaderCircle size={18} className="mr-2 animate-spin" />
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-white/80 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#c2410c]">
                  <MessageCircle size={23} />
                </div>
                <h3 className="mt-4 font-bold">Be the first to ask</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#785541]">
                  No questions have been submitted yet. Your question can
                  start the discussion.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {questions.map((item, index) => (
                  <motion.article
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
                    className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-[#c2410c]">
                        {item.name.trim().charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold">{item.name}</h3>
                          <time
                            className="text-xs text-[#9a7b68]"
                            dateTime={item.createdAt}
                          >
                            {new Date(item.createdAt).toLocaleString()}
                          </time>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4a2b19]">
                          {item.question}
                        </p>

                        {item.answer?.trim() && (
                          <div className="mt-4 rounded-xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                              Response
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4a2b19]">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-[#9a7b68]">
              This list refreshes automatically every 10 seconds.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function PublicQuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-sm text-[#785541]">
          Loading questions...
        </main>
      }
    >
      <PublicQuestionsContent />
    </Suspense>
  );
}
