
"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Hash,
  Info,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Users,
  Building2,
  CalendarCheck2,
  XCircle,
} from "lucide-react";

type EventForm = {
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
};

const initialForm: EventForm = {
  name: "",
  code: "",
  description: "",
  startDate: "",
  endDate: "",
  venue: "",
  city: "",
};

const inputClass =
  "mt-2.5 h-12 w-full rounded-xl border border-[#eee1d7] bg-white px-4 text-sm text-[#241000] outline-none transition-all placeholder:text-[#b7a69a] hover:border-[#e7c9b6] focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100/70";

const labelClass = "block text-sm font-semibold text-[#402719]";

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDuration(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;

  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.round((end - start) / 86_400_000) + 1;
}

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const duration = useMemo(
    () => getDuration(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  );

  const dateError =
    Boolean(form.startDate && form.endDate) &&
    form.endDate < form.startDate;

  function updateField(field: keyof EventForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    setError("");

    if (dateError) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    if (!form.name.trim() || !form.code.trim()) {
      setError("Please provide an event name and event code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          description: form.description.trim(),
          venue: form.venue.trim(),
          city: form.city.trim(),
          status: "draft",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Unable to create the event.");
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ambient-glow min-h-screen overflow-hidden bg-[#fffaf7] text-[#241000]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
        {/* Top navigation */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <Link
            href="/admin/events"
            className="group inline-flex items-center gap-2 rounded-xl border border-[#f0e2d8] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#705b4b] shadow-sm transition hover:border-orange-200 hover:text-[#EA580C]"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to events
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#8b5a37]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EA580C]" />
            </span>
            Event workspace
          </div>
        </motion.div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative mt-8 overflow-hidden rounded-[28px] border border-[#f0d9c9] bg-white shadow-[0_18px_65px_rgba(92,42,12,0.07)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 via-white to-[#fff8f1]" />
          <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-11">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/85 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-[#C44B0B]">
                <Sparkles size={13} />
                CONFERENCE MANAGEMENT
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-[-0.045em] text-[#241000] sm:text-4xl lg:text-[46px] lg:leading-[1.12]">
                Create something
                <span className="block bg-gradient-to-r from-[#EA580C] to-[#9a3412] bg-clip-text text-transparent">
                  worth gathering for.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#806d60] sm:text-base">
                Set up your conference in minutes. Start with the essentials,
                then build your scientific program, organize halls, schedule
                sessions, and manage faculty.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-[#786352]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#EA580C]" />
                  Simple setup
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#EA580C]" />
                  Save as draft
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#EA580C]" />
                  Publish when ready
                </span>
              </div>
            </div>

            <div className="hidden w-[190px] shrink-0 flex-col items-center justify-center rounded-3xl border border-orange-100 bg-white/75 p-6 text-center shadow-[0_12px_35px_rgba(92,42,12,0.06)] lg:flex">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#9a3412] text-white shadow-lg shadow-orange-900/20">
                <CalendarCheck2 size={29} />
              </div>
              <p className="mt-4 text-sm font-bold">Your next event</p>
              <p className="mt-1 text-xs leading-5 text-[#8a7565]">
                Starts with the right details
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#EA580C]">
                Let&apos;s begin <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Progress */}
        <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-orange-200 bg-white p-3.5 shadow-sm sm:p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EA580C] text-sm font-bold text-white">
                1
              </span>
              <div>
                <p className="text-xs font-bold text-[#241000] sm:text-sm">
                  Event details
                </p>
                <p className="mt-0.5 hidden text-[11px] text-[#907b6b] sm:block">
                  Basic information
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-orange-100">
              <div className="h-full w-full rounded-full bg-[#EA580C]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#eee1d7] bg-white/75 p-3.5 sm:p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#eee1d7] bg-[#fffaf7] text-sm font-bold text-[#9b8778]">
                2
              </span>
              <div>
                <p className="text-xs font-bold text-[#6c5748] sm:text-sm">
                  Scientific program
                </p>
                <p className="mt-0.5 hidden text-[11px] text-[#a18c7c] sm:block">
                  Agenda and sessions
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-[#f2e8e0]" />
          </div>

          <div className="rounded-2xl border border-[#eee1d7] bg-white/75 p-3.5 sm:p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#eee1d7] bg-[#fffaf7] text-sm font-bold text-[#9b8778]">
                3
              </span>
              <div>
                <p className="text-xs font-bold text-[#6c5748] sm:text-sm">
                  Publish
                </p>
                <p className="mt-0.5 hidden text-[11px] text-[#a18c7c] sm:block">
                  Go live
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-[#f2e8e0]" />
          </div>
        </div>

        {/* Main workspace */}
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="min-w-0 overflow-hidden rounded-[24px] border border-[#eee1d7] bg-white shadow-[0_12px_45px_rgba(72,34,11,0.045)]"
          >
            {/* Form heading */}
            <div className="flex items-start gap-4 border-b border-[#f2e8e0] px-5 py-6 sm:px-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 text-[#EA580C]">
                <Building2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-[#241000]">
                    Conference details
                  </h2>
                  <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C44B0B]">
                    Step 1 of 3
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-[#8a7565]">
                  Add the core information that attendees will use to identify
                  your event.
                </p>
              </div>
            </div>

            <div className="space-y-8 p-5 sm:p-8">
              {/* Identity */}
              <section>
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#EA580C]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#382216]">
                      Event identity
                    </h3>
                    <p className="mt-0.5 text-xs text-[#998475]">
                      Name, code and description
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Event name <span className="text-[#EA580C]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      maxLength={160}
                      autoComplete="off"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="e.g. Annual Scientific Conference 2027"
                      className={inputClass}
                    />
                    <div className="mt-2 flex justify-between gap-3">
                      <p className="text-xs text-[#a18c7c]">
                        Use the official conference title.
                      </p>
                      <span className="shrink-0 text-xs tabular-nums text-[#b3a194]">
                        {form.name.length}/160
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="code" className={labelClass}>
                      Event code <span className="text-[#EA580C]">*</span>
                    </label>
                    <div className="relative">
                      <Hash
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a18c7c]"
                      />
                      <input
                        id="code"
                        name="code"
                        required
                        maxLength={30}
                        value={form.code}
                        onChange={(event) =>
                          updateField(
                            "code",
                            event.target.value.toUpperCase(),
                          )
                        }
                        placeholder="e.g. ASC2027"
                        className={`${inputClass} pl-11 font-mono tracking-wide`}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#a18c7c]">
                      A unique identifier for your conference. Use letters and
                      numbers.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Conference description
                      <span className="ml-2 font-normal text-[#a18c7c]">
                        Optional
                      </span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      maxLength={5000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="Describe the conference, its scientific focus, and what attendees can expect..."
                      className="mt-2.5 w-full resize-y rounded-xl border border-[#eee1d7] bg-white px-4 py-3.5 text-sm leading-6 text-[#241000] outline-none transition-all placeholder:text-[#b7a69a] hover:border-[#e7c9b6] focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100/70"
                    />
                    <div className="mt-2 flex justify-between gap-3">
                      <p className="text-xs text-[#a18c7c]">
                        A short introduction to your event.
                      </p>
                      <span className="shrink-0 text-xs tabular-nums text-[#b3a194]">
                        {form.description.length}/5000
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-[#f2e8e0]" />

              {/* Venue */}
              <section>
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#EA580C]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#382216]">
                      Venue and location
                    </h3>
                    <p className="mt-0.5 text-xs text-[#998475]">
                      Where your conference takes place
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="venue" className={labelClass}>
                      Venue name <span className="text-[#EA580C]">*</span>
                    </label>
                    <div className="relative">
                      <Building2
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a18c7c]"
                      />
                      <input
                        id="venue"
                        name="venue"
                        required
                        value={form.venue}
                        onChange={(event) =>
                          updateField("venue", event.target.value)
                        }
                        placeholder="Convention centre, hotel or institution"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className={labelClass}>
                      City <span className="text-[#EA580C]">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      required
                      value={form.city}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                      placeholder="e.g. Hyderabad"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-[#f2e8e0]" />

              {/* Dates */}
              <section>
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#EA580C]">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#382216]">
                      Conference dates
                    </h3>
                    <p className="mt-0.5 text-xs text-[#998475]">
                      Define the start and end of your event
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className={labelClass}>
                      Start date <span className="text-[#EA580C]">*</span>
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(event) => {
                        const nextStart = event.target.value;
                        setForm((current) => ({
                          ...current,
                          startDate: nextStart,
                          endDate:
                            current.endDate && current.endDate < nextStart
                              ? nextStart
                              : current.endDate,
                        }));
                        setError("");
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className={labelClass}>
                      End date <span className="text-[#EA580C]">*</span>
                    </label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      min={form.startDate || undefined}
                      value={form.endDate}
                      onChange={(event) =>
                        updateField("endDate", event.target.value)
                      }
                      className={`${inputClass} ${
                        dateError
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                    />
                    {dateError && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        End date must be on or after the start date.
                      </p>
                    )}
                  </div>
                </div>

                {duration !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-3 rounded-xl border border-orange-100 bg-[#fffaf7] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                      <Clock3 size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#382216]">
                        {duration} {duration === 1 ? "day" : "days"} planned
                      </p>
                      <p className="mt-0.5 text-xs text-[#8a7565]">
                        {formatDate(form.startDate)} —{" "}
                        {formatDate(form.endDate)}
                      </p>
                    </div>
                    <Check size={17} className="ml-auto text-[#EA580C]" />
                  </motion.div>
                )}
              </section>

              {/* Draft information */}
              <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-[#fff8f1] to-white p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                  <Info size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#382216]">
                    Your event will be saved as a draft
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[#806d60]">
                    Creating this event will not publish it. You can continue
                    setting up the scientific agenda, halls, sessions and
                    faculty before publishing.
                  </p>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <XCircle size={19} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Form footer */}
            <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-[#eee1d7] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="hidden text-xs text-[#998475] sm:block">
                <span className="text-[#EA580C]">*</span> Required fields
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  href="/admin/events"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#eadfd5] bg-white px-5 text-sm font-semibold text-[#705b4b] transition hover:bg-[#fff8f1]"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading || dateError}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#c94a0b] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(234,88,12,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(234,88,12,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Creating event...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create event
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          {/* Live preview sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="space-y-5 xl:sticky xl:top-6"
          >
            <div className="overflow-hidden rounded-[24px] border border-[#eee1d7] bg-white shadow-[0_12px_45px_rgba(72,34,11,0.045)]">
              <div className="flex items-center justify-between border-b border-[#f2e8e0] px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-[#382216]">
                    Live preview
                  </p>
                  <p className="mt-1 text-xs text-[#998475]">
                    Updates as you type
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#EA580C]">
                  <Sparkles size={16} />
                </span>
              </div>

              <div className="p-4 sm:p-5">
                {/* Preview card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#32180c] via-[#4a220c] to-[#87380e] p-5 text-white">
                  <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-orange-500/20 blur-2xl" />
                  <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-amber-300/10 blur-xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-100">
                        <CalendarDays size={12} />
                        Conference
                      </span>
                      <span className="rounded-full border border-amber-300/30 bg-amber-200/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-200">
                        Draft
                      </span>
                    </div>

                    <div className="mt-7 min-h-[100px]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200/80">
                        YOUR EVENT
                      </p>
                      <h3 className="mt-2 break-words text-xl font-bold leading-snug tracking-tight">
                        {form.name.trim() || "Your conference name"}
                      </h3>
                      <p className="mt-2 break-words text-xs leading-5 text-orange-100/70">
                        {form.description.trim() ||
                          "Your event description will appear here once you add it."}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3 border-t border-white/15 pt-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-orange-200"
                        />
                        <div className="min-w-0">
                          <p className="break-words text-xs font-semibold">
                            {form.venue.trim() || "Venue not added"}
                          </p>
                          <p className="mt-0.5 break-words text-[11px] text-orange-100/65">
                            {form.city.trim() || "City not added"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CalendarDays
                          size={15}
                          className="mt-0.5 shrink-0 text-orange-200"
                        />
                        <div>
                          <p className="text-xs font-semibold">
                            {form.startDate
                              ? formatDate(form.startDate)
                              : "Start date"}{" "}
                            {form.endDate &&
                              form.startDate !== form.endDate &&
                              ` — ${formatDate(form.endDate)}`}
                          </p>
                          <p className="mt-0.5 text-[11px] text-orange-100/65">
                            {duration !== null
                              ? `${duration} ${duration === 1 ? "day" : "days"}`
                              : "Event schedule"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-100/65">
                        Event code
                      </span>
                      <span className="break-all font-mono text-xs font-bold tracking-wider text-white">
                        {form.code.trim() || "YOURCODE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completion indicators */}
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-[#382216]">
                      Setup progress
                    </p>
                    <p className="text-xs font-bold text-[#EA580C]">
                      {
                        [
                          form.name.trim(),
                          form.code.trim(),
                          form.venue.trim(),
                          form.city.trim(),
                          form.startDate,
                          form.endDate,
                        ].filter(Boolean).length
                      }{" "}
                      / 6
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-6 gap-1.5">
                    {[
                      form.name.trim(),
                      form.code.trim(),
                      form.venue.trim(),
                      form.city.trim(),
                      form.startDate,
                      form.endDate,
                    ].map((value, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-colors ${
                          value ? "bg-[#EA580C]" : "bg-[#f0e5dc]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: "Event identity",
                        complete: Boolean(form.name.trim() && form.code.trim()),
                      },
                      {
                        label: "Venue and location",
                        complete: Boolean(
                          form.venue.trim() && form.city.trim(),
                        ),
                      },
                      {
                        label: "Conference dates",
                        complete: Boolean(
                          form.startDate &&
                            form.endDate &&
                            !dateError,
                        ),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5"
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            item.complete
                              ? "bg-orange-50 text-[#EA580C]"
                              : "bg-[#f8f3ee] text-[#b8a89b]"
                          }`}
                        >
                          {item.complete ? (
                            <Check size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                        </span>
                        <span
                          className={`text-xs ${
                            item.complete
                              ? "font-semibold text-[#574030]"
                              : "text-[#998475]"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.complete && (
                          <CheckCircle2
                            size={14}
                            className="ml-auto text-[#EA580C]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* What's next */}
            <div className="rounded-[22px] border border-[#eee1d7] bg-white p-5 shadow-[0_8px_30px_rgba(72,34,11,0.035)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
                  <Users size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#382216]">
                    What comes next?
                  </h3>
                  <p className="mt-1 text-xs text-[#998475]">
                    Build your scientific program
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  "Create agenda days and halls",
                  "Add sessions and time slots",
                  "Manage speakers and panelists",
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#fff5eb] text-[10px] font-bold text-[#C44B0B]">
                      {index + 1}
                    </span>
                    <p className="text-xs leading-5 text-[#806d60]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#fffaf7] p-3 text-xs leading-5 text-[#806d60]">
                <Info size={15} className="shrink-0 text-[#EA580C]" />
                These are the next stages of your workflow, not additional
                required fields on this page.
              </div>
            </div>
          </motion.aside>
        </div>

        <footer className="py-8 text-center text-xs text-[#a18c7c]">
          Scientific Program Manager
          <span className="mx-2 text-orange-300">•</span>
          Every great conference starts here.
        </footer>
      </div>
    </main>
  );
}
