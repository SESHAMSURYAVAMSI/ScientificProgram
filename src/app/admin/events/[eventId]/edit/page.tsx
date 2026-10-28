
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type EventForm = {
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
};

const emptyForm: EventForm = {
  name: "",
  code: "",
  description: "",
  startDate: "",
  endDate: "",
  venue: "",
  city: "",
};

function dateForInput(value: string | Date | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

const inputClass =
  "mt-2 w-full rounded-xl border border-[#ecd8ca] bg-white px-4 py-3 text-sm text-[#241000] outline-none transition placeholder:text-[#b19a88] focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100";

export default function EditEventPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;

  const [form, setForm] = useState<EventForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    let active = true;

    async function loadEvent() {
      setLoading(true);
      setPageError("");

      try {
        const response = await fetch(
          `/api/events/${encodeURIComponent(eventId)}`,
          { cache: "no-store" },
        );
        const result = await response.json();

        if (!response.ok || !result.success || !result.event) {
          throw new Error(result.message || "Unable to load event.");
        }

        if (!active) return;

        const event = result.event;

        setForm({
          name: event.name ?? "",
          code: event.code ?? "",
          description: event.description ?? "",
          startDate: dateForInput(event.startDate),
          endDate: dateForInput(event.endDate),
          venue: event.venue ?? "",
          city: event.city ?? "",
        });
      } catch (error) {
        if (active) {
          setPageError(
            error instanceof Error ? error.message : "Unable to load event.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEvent();

    return () => {
      active = false;
    };
  }, [eventId]);

  function updateField(field: keyof EventForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.endDate < form.startDate) {
      toast.error("The end date cannot be before the start date.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save event.");
      }

      toast.success("Event details saved successfully.");
      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save event.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-[#68432c]">
        <div className="flex items-center gap-3 rounded-2xl border border-[#f0dfd3] bg-white px-6 py-5 shadow-sm">
          <LoaderCircle className="animate-spin text-[#ea580c]" size={21} />
          <span className="text-sm font-semibold">Loading event details…</span>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-4 py-12 text-[#241000]">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-extrabold">Unable to open this event</h1>
          <p className="mt-2 text-sm text-red-700">{pageError}</p>
          <Link
            href="/admin/events"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ea580c] px-4 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ambient-glow min-h-screen bg-[#fffaf7] px-4 py-6 text-[#241000] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 rounded-xl border border-[#ecd8ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#68432c] transition hover:border-orange-300 hover:bg-orange-50"
        >
          <ArrowLeft size={16} />
          Back to events
        </Link>

        <header className="mt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#c2410c]">
            <Sparkles size={14} />
            Conference management
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Edit event<span className="text-[#ea580c]">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#806451]">
            Update the conference information used by its scientific programme.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-7 overflow-hidden rounded-3xl border border-[#ecd9cb] bg-white shadow-[0_12px_40px_rgba(69,26,3,0.06)]"
        >
          <div className="h-1.5 bg-gradient-to-r from-[#ea580c] via-[#f28b50] to-[#f5c5a4]" />

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                <CalendarDays className="text-[#ea580c]" size={19} />
                Event information
              </h2>
              <p className="mt-1 text-xs text-[#9a7b67]">
                Fields marked with * are required.
              </p>
            </div>

            <label className="text-sm font-bold text-[#68432c]">
              Event name *
              <input
                required
                maxLength={160}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. RSACPCON 2026"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-bold text-[#68432c]">
              Event code *
              <input
                required
                maxLength={40}
                value={form.code}
                onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                placeholder="e.g. RSACPCON26"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-bold text-[#68432c]">
              Start date *
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-bold text-[#68432c]">
              End date *
              <input
                required
                type="date"
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-bold text-[#68432c]">
              Venue *
              <span className="relative block">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b35a2a]"
                />
                <input
                  required
                  maxLength={200}
                  value={form.venue}
                  onChange={(e) => updateField("venue", e.target.value)}
                  placeholder="Conference centre or hall"
                  className={`${inputClass} pl-10`}
                />
              </span>
            </label>

            <label className="text-sm font-bold text-[#68432c]">
              City *
              <input
                required
                maxLength={100}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="e.g. Hyderabad"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-bold text-[#68432c] sm:col-span-2">
              Description
              <textarea
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Briefly describe this conference…"
                className={`${inputClass} resize-y`}
              />
              <span className="mt-1 block text-right text-xs font-normal text-[#a18470]">
                {form.description.length}/2000
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#f0dfd3] bg-[#fffaf7] p-5 sm:flex-row sm:justify-end sm:px-8">
            <Link
              href="/admin/events"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#ecd8ca] bg-white px-5 py-3 text-sm font-bold text-[#68432c] transition hover:bg-orange-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-700/15 transition hover:bg-[#c2410c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        </form>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9a7b67]">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Your event status and existing agenda URL will remain unchanged.
        </p>
      </div>
    </main>
  );
}
