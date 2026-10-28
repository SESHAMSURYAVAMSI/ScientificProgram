
"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  Users,
  Mic,
  Building2,
  Clock3,
  RefreshCw,
  Sparkles,
  AlertCircle,
  LoaderCircle,
  Hash,
  ChevronDown,
  BookOpen,
  PanelTopClose,
  PanelTopOpen,
  LayoutGrid,
} from "lucide-react";
import type {
  AgendaDay,
  AgendaHall,
  AgendaSession,
  AgendaTalk,
} from "@/models/ScientificAgenda";

type EventDetails = {
  name: string;
  startDate: string;
  endDate: string;
};

const emptyTalk = (): AgendaTalk => ({
  startTime: "",
  endTime: "",
  title: "",
  speakerName: "",
  speakerTitle: "",
  institution: "",
});

const emptySession = (): AgendaSession => ({
  startTime: "",
  endTime: "",
  title: "",
  chairpersons: [],
  panelists: [],
  judges: [],
  talks: [],
});

const emptyHall = (name = "Hall A"): AgendaHall => ({
  name,
  sessions: [],
});

const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-[#eadfd5] bg-white px-3.5 text-sm text-[#241000] outline-none transition placeholder:text-[#b8a699] hover:border-orange-200 focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100/70";

const labelClass = "mb-2 block text-xs font-semibold text-[#705b4b]";

const sessionTheme = {
  border: "border-orange-200",
  background: "bg-[#fff5eb]",
  header: "bg-gradient-to-r from-[#fff0df] to-[#fffaf5]",
  icon: "bg-orange-100 text-[#C44B0B]",
  badge: "border-orange-200 bg-orange-100 text-[#A63B08]",
};

const talkTheme = {
  border: "border-sky-200",
  background: "bg-[#f2f8ff]",
  badge: "border-sky-200 bg-sky-100 text-sky-800",
  button: "bg-sky-700 hover:bg-sky-800",
};

function dateToUTC(value: string) {
  return Date.parse(`${value}T00:00:00.000Z`);
}

function formatDate(value: string) {
  if (!value) return "Choose a date";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  if (!value) return "";

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getConferenceDates(startDate: string, endDate: string) {
  if (!startDate || !endDate) return [];

  const start = dateToUTC(startDate);
  const end = dateToUTC(endDate);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return [];
  }

  const dates: string[] = [];

  for (let timestamp = start; timestamp <= end; timestamp += 86_400_000) {
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  }

  return dates;
}

function TimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState("");

  useEffect(() => {
    if (!value) {
      setHour("");
      setMinute("");
      setPeriod("");
      return;
    }

    const [rawHour, rawMinute] = value.split(":").map(Number);

    if (
      !Number.isFinite(rawHour) ||
      !Number.isFinite(rawMinute) ||
      rawHour < 0 ||
      rawHour > 23 ||
      rawMinute < 0 ||
      rawMinute > 59
    ) {
      setHour("");
      setMinute("");
      setPeriod("");
      return;
    }

    setHour(String(rawHour % 12 || 12));
    setMinute(String(rawMinute).padStart(2, "0"));
    setPeriod(rawHour >= 12 ? "PM" : "AM");
  }, [value]);

  function updateTime(
    nextHour: string,
    nextMinute: string,
    nextPeriod: string,
  ) {
    if (!nextHour || !nextMinute || !nextPeriod) return;

    let hours = Number(nextHour) % 12;
    if (nextPeriod === "PM") hours += 12;

    onChange(`${String(hours).padStart(2, "0")}:${nextMinute}`);
  }

  const selectClass =
    "h-11 w-full min-w-0 appearance-none rounded-xl border border-[#eadfd5] bg-white px-2 text-center text-sm font-semibold text-[#382216] outline-none transition hover:border-orange-200 focus:border-[#EA580C] focus:ring-4 focus:ring-orange-100/70";

  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>

      <div className="flex items-center gap-2 rounded-2xl border border-[#eadfd5] bg-[#fffaf7] p-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#EA580C]">
          <Clock3 size={17} />
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <select
            aria-label={`${label} hour`}
            className={selectClass}
            value={hour}
            onChange={(event) => {
              const next = event.target.value;
              setHour(next);
              updateTime(next, minute, period);
            }}
          >
            <option value="">HH</option>
            {Array.from({ length: 12 }, (_, index) =>
              String(index + 1),
            ).map((item) => (
              <option key={item} value={item}>
                {item.padStart(2, "0")}
              </option>
            ))}
          </select>

          <span className="text-sm font-bold text-[#b8a699]">:</span>

          <select
            aria-label={`${label} minute`}
            className={selectClass}
            value={minute}
            onChange={(event) => {
              const next = event.target.value;
              setMinute(next);
              updateTime(hour, next, period);
            }}
          >
            <option value="">MM</option>
            {Array.from({ length: 60 }, (_, index) =>
              String(index).padStart(2, "0"),
            ).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <select
          aria-label={`${label} AM or PM`}
          className={`${selectClass} max-w-[76px]`}
          value={period}
          onChange={(event) => {
            const next = event.target.value;
            setPeriod(next);
            updateTime(hour, minute, next);
          }}
        >
          <option value="">AM/PM</option>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      <p className="mt-1.5 text-[11px] text-[#a18c7c]">
        {value ? `Selected: ${formatTime(value)}` : "Choose hour, minute and AM/PM"}
      </p>
    </div>
  );
}

function FacultyField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        className={inputClass}
        value={values.join(", ")}
        placeholder="Separate names with commas"
        onChange={(event) =>
          onChange(event.target.value.split(",").map((name) => name.trimStart()))
        }
      />
      <p className="mt-1.5 text-[11px] text-[#a18c7c]">
        Add multiple names separated by commas.
      </p>
    </div>
  );
}

export default function AgendaEditorPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [days, setDays] = useState<AgendaDay[]>([]);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [activeHallByDate, setActiveHallByDate] = useState<Record<string, number>>({});
  const [collapsedDates, setCollapsedDates] = useState<string[]>([]);
  const [collapsedHallKeys, setCollapsedHallKeys] = useState<string[]>([]);

  const conferenceDates = useMemo(
    () => getConferenceDates(event?.startDate ?? "", event?.endDate ?? ""),
    [event?.startDate, event?.endDate],
  );

  const allowedDayCount = conferenceDates.length;

  const usedDates = useMemo(
    () => new Set(days.map((day) => day.date).filter(Boolean)),
    [days],
  );

  const remainingDates = useMemo(
    () => conferenceDates.filter((date) => !usedDates.has(date)),
    [conferenceDates, usedDates],
  );

  const currentDay = days[activeDay];
  const activeDayDate = currentDay?.date ?? "";
  const activeDayCollapsed = collapsedDates.includes(activeDayDate);

  const activeHallIndex = currentDay
    ? Math.min(
        activeHallByDate[activeDayDate] ?? 0,
        Math.max(0, currentDay.halls.length - 1),
      )
    : 0;

  const currentHall = currentDay?.halls[activeHallIndex];

  function hallKey(date: string, index: number) {
    return `${date}::hall-${index}`;
  }

  function toggleDayCollapse(date: string) {
    setCollapsedDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date],
    );
  }

  function toggleHallCollapse(date: string, hallIndex: number) {
    const key = hallKey(date, hallIndex);

    setCollapsedHallKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function selectHall(date: string, hallIndex: number) {
    setActiveHallByDate((current) => ({
      ...current,
      [date]: hallIndex,
    }));
  }

  const loadAgenda = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/agenda`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to load agenda.");
      }

      if (!result.event) {
        throw new Error("Event date information is missing.");
      }

      const eventDetails = result.event as EventDetails;
      const allowedDates = getConferenceDates(
        eventDetails.startDate,
        eventDetails.endDate,
      );

      if (!allowedDates.length) {
        throw new Error("This event has an invalid date range.");
      }

      setEvent(eventDetails);

      const savedDays = (result.days ?? []) as AgendaDay[];

      const validDays = savedDays
        .filter(
          (day) =>
            allowedDates.includes(day.date) &&
            typeof day.label === "string",
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, allowedDates.length)
        .map((day, index) => ({
          ...day,
          label: `Day ${index + 1}`,
          halls: (day.halls ?? []).map((hall) => ({
            ...hall,
            sessions: (hall.sessions ?? []).map((session) => ({
              ...session,
              chairpersons: session.chairpersons ?? [],
              panelists: session.panelists ?? [],
              judges: session.judges ?? [],
              talks: session.talks ?? [],
            })),
          })),
        }));

      setDays(validDays);
      setActiveDay(0);
      setActiveHallByDate({});
      setCollapsedDates([]);
      setCollapsedHallKeys([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load agenda.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadAgenda();
  }, [loadAgenda]);

  function updateDay(dayIndex: number, changes: Partial<AgendaDay>) {
    setDays((current) =>
      current.map((day, index) =>
        index === dayIndex ? { ...day, ...changes } : day,
      ),
    );
    setNotice("");
  }

  function updateHall(
    dayIndex: number,
    hallIndex: number,
    changes: Partial<AgendaHall>,
  ) {
    setDays((current) =>
      current.map((day, index) =>
        index !== dayIndex
          ? day
          : {
              ...day,
              halls: day.halls.map((hall, index) =>
                index === hallIndex ? { ...hall, ...changes } : hall,
              ),
            },
      ),
    );
    setNotice("");
  }

  function updateSession(
    dayIndex: number,
    hallIndex: number,
    sessionIndex: number,
    changes: Partial<AgendaSession>,
  ) {
    setDays((current) =>
      current.map((day, di) =>
        di !== dayIndex
          ? day
          : {
              ...day,
              halls: day.halls.map((hall, hi) =>
                hi !== hallIndex
                  ? hall
                  : {
                      ...hall,
                      sessions: hall.sessions.map((session, si) =>
                        si === sessionIndex
                          ? { ...session, ...changes }
                          : session,
                      ),
                    },
              ),
            },
      ),
    );
    setNotice("");
  }

  function updateTalk(
    dayIndex: number,
    hallIndex: number,
    sessionIndex: number,
    talkIndex: number,
    changes: Partial<AgendaTalk>,
  ) {
    setDays((current) =>
      current.map((day, di) =>
        di !== dayIndex
          ? day
          : {
              ...day,
              halls: day.halls.map((hall, hi) =>
                hi !== hallIndex
                  ? hall
                  : {
                      ...hall,
                      sessions: hall.sessions.map((session, si) =>
                        si !== sessionIndex
                          ? session
                          : {
                              ...session,
                              talks: session.talks.map((talk, ti) =>
                                ti === talkIndex ? { ...talk, ...changes } : talk,
                              ),
                            },
                      ),
                    },
              ),
            },
      ),
    );
    setNotice("");
  }

  function addDay() {
    if (days.length >= allowedDayCount || !remainingDates.length) return;

    const nextDate = remainingDates[0];

    setDays((current) => {
      if (current.length >= allowedDayCount) return current;

      return [
        ...current,
        { label: `Day ${current.length + 1}`, date: nextDate, halls: [] },
      ].sort((a, b) => a.date.localeCompare(b.date));
    });

    setActiveHallByDate((current) => ({ ...current, [nextDate]: 0 }));
    setActiveDay(days.length);
    setError("");
    setNotice("");
  }

  function removeDay(dayIndex: number) {
    const removedDate = days[dayIndex]?.date;

    setDays((current) =>
      current
        .filter((_, index) => index !== dayIndex)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((day, index) => ({ ...day, label: `Day ${index + 1}` })),
    );

    if (removedDate) {
      setCollapsedDates((current) => current.filter((date) => date !== removedDate));
      setActiveHallByDate((current) => {
        const next = { ...current };
        delete next[removedDate];
        return next;
      });
    }

    setActiveDay(0);
    setNotice("");
  }

  function changeDayDate(dayIndex: number, nextDate: string) {
    if (!conferenceDates.includes(nextDate)) {
      setError("Choose a date within this event's date range.");
      return;
    }

    if (days.some((day, index) => index !== dayIndex && day.date === nextDate)) {
      setError("Each conference date can only be used once.");
      return;
    }

    const oldDate = days[dayIndex]?.date;

    setDays((current) =>
      current
        .map((day, index) =>
          index === dayIndex ? { ...day, date: nextDate } : day,
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((day, index) => ({ ...day, label: `Day ${index + 1}` })),
    );

    setCollapsedDates((current) => current.filter((date) => date !== oldDate));
    setActiveHallByDate((current) => {
      const next = { ...current };
      if (oldDate) {
        next[nextDate] = next[oldDate] ?? 0;
        delete next[oldDate];
      }
      return next;
    });

    setActiveDay(0);
    setError("");
    setNotice("");
  }

  function addHall() {
    if (!currentDay) return;

    const newHallIndex = currentDay.halls.length;
    const nextName = `Hall ${String.fromCharCode(65 + (newHallIndex % 26))}`;

    updateDay(activeDay, {
      halls: [...currentDay.halls, emptyHall(nextName)],
    });

    setActiveHallByDate((current) => ({
      ...current,
      [activeDayDate]: newHallIndex,
    }));

    setCollapsedHallKeys((current) =>
      current.filter((key) => key !== hallKey(activeDayDate, newHallIndex)),
    );
  }

  function removeHall(hallIndex: number) {
    if (!currentDay) return;

    const nextHalls = currentDay.halls.filter((_, index) => index !== hallIndex);

    updateDay(activeDay, { halls: nextHalls });

    setActiveHallByDate((current) => ({
      ...current,
      [activeDayDate]: Math.min(
        current[activeDayDate] ?? 0,
        Math.max(0, nextHalls.length - 1),
      ),
    }));

    setCollapsedHallKeys([]);
  }

  async function saveAgenda() {
    setError("");
    setNotice("");

    if (!event || !allowedDayCount) {
      setError("Event dates are unavailable. Reload the agenda and try again.");
      return;
    }

    if (days.length > allowedDayCount) {
      setError(`This event has ${allowedDayCount} days. Remove extra days before saving.`);
      return;
    }

    const dates = days.map((day) => day.date);

    if (
      dates.some((date) => !conferenceDates.includes(date)) ||
      new Set(dates).size !== dates.length
    ) {
      setError("Each agenda day must use a unique date within the event date range.");
      return;
    }

    const orderedDays = [...days]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day, index) => ({ ...day, label: `Day ${index + 1}` }));

    setSaving(true);

    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}/agenda`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: orderedDays }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to save agenda.");
      }

      setDays((result.days ?? orderedDays) as AgendaDay[]);
      setNotice("Agenda saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save agenda.");
    } finally {
      setSaving(false);
    }
  }

  const totalHalls = days.reduce((sum, day) => sum + day.halls.length, 0);

  const totalSessions = days.reduce(
    (total, day) =>
      total +
      day.halls.reduce((hallTotal, hall) => hallTotal + hall.sessions.length, 0),
    0,
  );

  const totalTalks = days.reduce(
    (total, day) =>
      total +
      day.halls.reduce(
        (hallTotal, hall) =>
          hallTotal +
          hall.sessions.reduce(
            (sessionTotal, session) => sessionTotal + session.talks.length,
            0,
          ),
        0,
      ),
    0,
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-[#806d60]">
        <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-6 py-5 shadow-sm">
          <LoaderCircle className="animate-spin text-[#EA580C]" size={21} />
          <span className="text-sm font-medium">Loading scientific program...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="ambient-glow min-h-screen bg-[#fffaf7] px-4 py-6 text-[#241000] sm:px-7 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 rounded-xl border border-[#eadfd5] bg-white px-4 py-2.5 text-sm font-semibold text-[#705b4b] transition hover:border-orange-200 hover:text-[#EA580C]"
          >
            <ArrowLeft size={16} />
            Back to events
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Event workspace
          </span>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mt-7 overflow-hidden rounded-[26px] border border-[#f0d9c9] bg-white shadow-[0_15px_50px_rgba(72,34,11,0.05)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-[#fff6ec]" />
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#C44B0B]">
                <Sparkles size={13} />
                SCIENTIFIC PROGRAM BUILDER
              </span>

              <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-[#241000] sm:text-4xl">
                Agenda editor<span className="text-[#EA580C]">.</span>
              </h1>

              <p className="mt-2 break-words text-sm font-semibold text-[#705b4b]">
                {event?.name ?? "Scientific program"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#806d60]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#EA580C]" />
                  {formatDate(event?.startDate ?? "")} – {formatDate(event?.endDate ?? "")}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-orange-300 sm:block" />
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange size={14} className="text-[#EA580C]" />
                  {allowedDayCount} {allowedDayCount === 1 ? "conference day" : "conference days"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadAgenda()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eadfd5] bg-white px-4 text-sm font-semibold text-[#705b4b] transition hover:bg-orange-50"
              >
                <RefreshCw size={16} />
                Reload
              </button>

              <button
                type="button"
                onClick={() => void saveAgenda()}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#c94a0b] px-5 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save agenda"}
              </button>
            </div>
          </div>
        </motion.header>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {notice && (
          <div role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard icon={<CalendarDays size={18} />} label="Agenda days" value={days.length} detail={`Maximum ${allowedDayCount}`} />
          <SummaryCard icon={<Building2 size={18} />} label="Halls / tracks" value={totalHalls} detail="Across all days" />
          <SummaryCard icon={<Clock3 size={18} />} label="Sessions" value={totalSessions} detail="Orange cards" />
          <SummaryCard icon={<Mic size={18} />} label="Individual talks" value={totalTalks} detail="Blue cards" />
        </div>

        {/* CONFERENCE DAY SELECTOR */}
        <section className="mt-6 rounded-2xl border border-[#eee1d7] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
                <CalendarDays size={19} />
              </div>
              <div>
                <h2 className="text-sm font-bold">Conference days</h2>
                <p className="mt-1 text-xs text-[#998475]">
                  Only dates within this event&apos;s duration are allowed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addDay}
              disabled={days.length >= allowedDayCount || remainingDates.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-semibold text-white transition hover:bg-[#c94708] disabled:cursor-not-allowed disabled:bg-[#e8d8ca] disabled:text-[#8c7868]"
            >
              <Plus size={16} />
              Add conference day
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-xs">
                {days.length}/{allowedDayCount}
              </span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {days.map((day, index) => {
              const isActive = activeDay === index;
              const isCollapsed = collapsedDates.includes(day.date);

              return (
                <div
                  key={day.date}
                  className={`flex items-stretch overflow-hidden rounded-xl border transition ${
                    isActive
                      ? "border-[#EA580C] bg-orange-50"
                      : "border-[#eadfd5] bg-white hover:border-orange-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDay(index)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 text-left ${
                      isActive ? "text-[#A63B08]" : "text-[#705b4b]"
                    }`}
                  >
                    <CalendarDays size={15} />
                    <span>
                      <span className="block text-xs font-bold">Day {index + 1}</span>
                      <span className="mt-1 block text-[10px] opacity-75">{formatDate(day.date)}</span>
                    </span>
                    {isActive && <CheckCircle2 size={13} />}
                  </button>

                  <button
                    type="button"
                    title={isCollapsed ? "Expand day" : "Minimize day"}
                    aria-label={isCollapsed ? "Expand day" : "Minimize day"}
                    onClick={() => toggleDayCollapse(day.date)}
                    className="border-l border-[#eadfd5] px-3 text-[#A63B08] transition hover:bg-orange-100"
                  >
                    {isCollapsed ? <PanelTopOpen size={15} /> : <PanelTopClose size={15} />}
                  </button>
                </div>
              );
            })}
          </div>

          {days.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-[#fffaf7] px-5 py-10 text-center">
              <CalendarDays size={26} className="mx-auto text-[#EA580C]" />
              <h3 className="mt-4 text-base font-bold">Start building your agenda</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806d60]">
                Add a conference day to create its halls, sessions, and talks.
              </p>
              <button
                type="button"
                onClick={addDay}
                disabled={allowedDayCount === 0}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                <Plus size={16} />
                Add Day 1
              </button>
            </div>
          )}
        </section>

        {currentDay && (
          <motion.section
            key={currentDay.date}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-[24px] border border-[#eee1d7] bg-white shadow-[0_12px_40px_rgba(72,34,11,0.04)]"
          >
            {/* DAY HEADER */}
            <div className="flex flex-col gap-4 border-b border-[#f0e3d9] bg-gradient-to-r from-[#fff4e9] to-white p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A63B08]">
                    <Hash size={11} />
                    Day {activeDay + 1} of {allowedDayCount}
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-[#241000] sm:text-2xl">
                    {currentDay.label}
                  </h2>
                  <p className="mt-1 text-sm text-[#806d60]">
                    {formatDate(currentDay.date)} · {currentDay.halls.length} halls
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDayCollapse(activeDayDate)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-white px-3.5 text-sm font-semibold text-[#A63B08] transition hover:bg-orange-50"
                  >
                    {activeDayCollapsed ? <PanelTopOpen size={15} /> : <PanelTopClose size={15} />}
                    {activeDayCollapsed ? "Expand day" : "Minimize day"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeDay(activeDay)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Remove day
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Day label</label>
                  <input
                    className={inputClass}
                    value={currentDay.label}
                    onChange={(event) => updateDay(activeDay, { label: event.target.value })}
                    placeholder="Day 1"
                  />
                </div>

                <div>
                  <label className={labelClass}>Conference date *</label>
                  <div className="relative">
                    <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#EA580C]" />
                    <select
                      className={`${inputClass} appearance-none pl-9 pr-8`}
                      value={currentDay.date}
                      onChange={(event) => changeDayDate(activeDay, event.target.value)}
                    >
                      {conferenceDates.map((date) => {
                        const usedByOtherDay = days.some(
                          (day, index) => index !== activeDay && day.date === date,
                        );

                        return (
                          <option key={date} value={date} disabled={usedByOtherDay}>
                            {formatDate(date)}{usedByOtherDay ? " (used)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#806d60]" />
                  </div>
                </div>
              </div>
            </div>

            {!activeDayCollapsed && (
              <div className="p-4 sm:p-6 lg:p-7">
                {/* HALL SELECTOR */}
                <section className="rounded-2xl border border-[#eee1d7] bg-[#fffdfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
                        <LayoutGrid size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#382216]">Halls & tracks</h3>
                        <p className="mt-1 text-xs text-[#998475]">
                          Select a hall to manage its sessions and talks.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addHall}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-bold text-white transition hover:bg-[#c94708]"
                    >
                      <Plus size={16} />
                      Add hall
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {currentDay.halls.map((hall, hallIndex) => {
                      const isActiveHall = hallIndex === activeHallIndex;
                      const isCollapsedHall = collapsedHallKeys.includes(
                        hallKey(activeDayDate, hallIndex),
                      );

                      const talkCount = hall.sessions.reduce(
                        (sum, session) => sum + session.talks.length,
                        0,
                      );

                      return (
                        <div
                          key={`${activeDayDate}-${hallIndex}`}
                          className={`flex items-stretch overflow-hidden rounded-xl border transition ${
                            isActiveHall
                              ? "border-[#EA580C] bg-orange-50 shadow-sm"
                              : "border-[#eadfd5] bg-white hover:border-orange-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectHall(activeDayDate, hallIndex)}
                            className={`flex min-w-[135px] items-center gap-2.5 px-3.5 py-3 text-left ${
                              isActiveHall ? "text-[#A63B08]" : "text-[#705b4b]"
                            }`}
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isActiveHall ? "bg-orange-100 text-[#EA580C]" : "bg-[#fff7f0] text-[#9b765e]"
                            }`}>
                              <Building2 size={17} />
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-[140px] truncate text-xs font-bold">
                                {hall.name || `Hall ${hallIndex + 1}`}
                              </span>
                              <span className="mt-1 block text-[10px] opacity-75">
                                {hall.sessions.length} sessions · {talkCount} talks
                              </span>
                            </span>
                            {isActiveHall && <CheckCircle2 size={13} />}
                          </button>

                          <button
                            type="button"
                            title={isCollapsedHall ? "Expand hall" : "Minimize hall"}
                            aria-label={isCollapsedHall ? "Expand hall" : "Minimize hall"}
                            onClick={() => toggleHallCollapse(activeDayDate, hallIndex)}
                            className="border-l border-[#eadfd5] px-3 text-[#A63B08] transition hover:bg-orange-100"
                          >
                            {isCollapsedHall ? <PanelTopOpen size={15} /> : <PanelTopClose size={15} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {currentDay.halls.length === 0 && (
                    <div className="mt-5 rounded-xl border border-dashed border-orange-200 bg-white px-4 py-8 text-center">
                      <Building2 size={24} className="mx-auto text-[#EA580C]" />
                      <h4 className="mt-3 text-sm font-bold">No halls added yet</h4>
                      <p className="mt-1 text-xs text-[#998475]">
                        Add Hall A or a track to start creating sessions.
                      </p>
                      <button
                        type="button"
                        onClick={addHall}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-bold text-white hover:bg-[#c94708]"
                      >
                        <Plus size={15} />
                        Add first hall
                      </button>
                    </div>
                  )}
                </section>

                {/* SELECTED HALL EDITOR */}
                {currentHall && (
                  <section className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd5]">
                    <div className="flex flex-col gap-3 border-b border-[#eadfd5] bg-[#fffaf7] p-4 sm:flex-row sm:items-end sm:p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                        <Building2 size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <label className={labelClass}>Hall / track name</label>
                        <input
                          className={inputClass}
                          value={currentHall.name}
                          onChange={(event) =>
                            updateHall(activeDay, activeHallIndex, {
                              name: event.target.value,
                            })
                          }
                          placeholder="Hall A"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateHall(activeDay, activeHallIndex, {
                            sessions: [...currentHall.sessions, emptySession()],
                          })
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-bold text-white transition hover:bg-[#c94708]"
                      >
                        <Plus size={16} />
                        Add session
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleHallCollapse(activeDayDate, activeHallIndex)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3.5 text-sm font-semibold text-[#A63B08] transition hover:bg-orange-50"
                      >
                        {collapsedHallKeys.includes(hallKey(activeDayDate, activeHallIndex)) ? (
                          <><PanelTopOpen size={15} /> Expand hall</>
                        ) : (
                          <><PanelTopClose size={15} /> Minimize hall</>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeHall(activeHallIndex)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {!collapsedHallKeys.includes(hallKey(activeDayDate, activeHallIndex)) && (
                      <div className="space-y-5 p-3 sm:p-5">
                        {currentHall.sessions.map((session, sessionIndex) => (
                          <section
                            key={`session-${activeDayDate}-${activeHallIndex}-${sessionIndex}`}
                            className={`overflow-hidden rounded-2xl border ${sessionTheme.border} ${sessionTheme.background}`}
                          >
                            <div className={`flex items-center justify-between gap-3 border-b ${sessionTheme.border} ${sessionTheme.header} px-4 py-4 sm:px-5`}>
                              <div className="flex min-w-0 items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sessionTheme.icon}`}>
                                  <Clock3 size={19} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-bold text-[#5c2a0c]">Session {sessionIndex + 1}</h3>
                                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${sessionTheme.badge}`}>SESSION</span>
                                  </div>
                                  <p className="mt-1 text-xs text-[#96684c]">Main session block and shared faculty</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label="Remove session"
                                onClick={() =>
                                  updateHall(activeDay, activeHallIndex, {
                                    sessions: currentHall.sessions.filter((_, index) => index !== sessionIndex),
                                  })
                                }
                                className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>

                            <div className="space-y-5 p-4 sm:p-5">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <label className={labelClass}>Session title *</label>
                                  <input
                                    className={inputClass}
                                    value={session.title}
                                    onChange={(event) =>
                                      updateSession(activeDay, activeHallIndex, sessionIndex, {
                                        title: event.target.value,
                                      })
                                    }
                                    placeholder="e.g. Challenging Cases & Complications"
                                  />
                                </div>

                                <TimePicker
                                  label="Start time"
                                  value={session.startTime}
                                  onChange={(startTime) =>
                                    updateSession(activeDay, activeHallIndex, sessionIndex, { startTime })
                                  }
                                />

                                <TimePicker
                                  label="End time"
                                  value={session.endTime}
                                  onChange={(endTime) =>
                                    updateSession(activeDay, activeHallIndex, sessionIndex, { endTime })
                                  }
                                />
                              </div>

                              {session.startTime && session.endTime && session.endTime < session.startTime && (
                                <p className="text-xs font-medium text-red-600">
                                  The session end time is earlier than its start time. Check the time range.
                                </p>
                              )}

                              <div className="rounded-2xl border border-orange-200 bg-white p-4 sm:p-5">
                                <div className="mb-4 flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
                                    <Users size={17} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-[#382216]">Shared session faculty</h4>
                                    <p className="mt-1 text-xs leading-5 text-[#998475]">
                                      These people are associated with the entire session.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FacultyField
                                    label="Chairpersons"
                                    values={session.chairpersons}
                                    onChange={(chairpersons) =>
                                      updateSession(activeDay, activeHallIndex, sessionIndex, { chairpersons })
                                    }
                                  />
                                  <FacultyField
                                    label="Panelists"
                                    values={session.panelists}
                                    onChange={(panelists) =>
                                      updateSession(activeDay, activeHallIndex, sessionIndex, { panelists })
                                    }
                                  />
                                  <div className="sm:col-span-2">
                                    <FacultyField
                                      label="Judges"
                                      values={session.judges}
                                      onChange={(judges) =>
                                        updateSession(activeDay, activeHallIndex, sessionIndex, { judges })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white">
                                <div className="flex flex-col justify-between gap-3 border-b border-sky-200 bg-gradient-to-r from-[#e8f3ff] to-[#f8fbff] p-4 sm:flex-row sm:items-center sm:px-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                                      <Mic size={19} />
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-sm font-bold text-sky-950">Individual talks</h4>
                                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${talkTheme.badge}`}>
                                          {session.talks.length} {session.talks.length === 1 ? "TALK" : "TALKS"}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-xs text-sky-800/70">Presentation topics and speaker details</p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSession(activeDay, activeHallIndex, sessionIndex, {
                                        talks: [...session.talks, emptyTalk()],
                                      })
                                    }
                                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white transition ${talkTheme.button}`}
                                  >
                                    <Plus size={15} />
                                    Add talk
                                  </button>
                                </div>

                                <div className="space-y-4 p-3 sm:p-4">
                                  {session.talks.map((talk, talkIndex) => (
                                    <article
                                      key={`talk-${activeDayDate}-${activeHallIndex}-${sessionIndex}-${talkIndex}`}
                                      className={`overflow-hidden rounded-xl border ${talkTheme.border} ${talkTheme.background}`}
                                    >
                                      <div className="flex items-center justify-between gap-3 border-b border-sky-200 bg-white/70 px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-800">{talkIndex + 1}</span>
                                          <div>
                                            <h5 className="text-sm font-bold text-sky-950">Talk {talkIndex + 1}</h5>
                                            <p className="mt-0.5 text-[11px] text-sky-800/70">Individual presentation</p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          aria-label="Remove talk"
                                          onClick={() =>
                                            updateSession(activeDay, activeHallIndex, sessionIndex, {
                                              talks: session.talks.filter((_, index) => index !== talkIndex),
                                            })
                                          }
                                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>

                                      <div className="grid gap-4 p-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                          <label className={labelClass}>Talk title *</label>
                                          <input
                                            className={`${inputClass} border-sky-200 focus:border-sky-500 focus:ring-sky-100`}
                                            value={talk.title}
                                            onChange={(event) =>
                                              updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, {
                                                title: event.target.value,
                                              })
                                            }
                                            placeholder="e.g. New Advances in Clinical Practice"
                                          />
                                        </div>

                                        <TimePicker
                                          label="Talk start"
                                          value={talk.startTime}
                                          onChange={(startTime) =>
                                            updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, { startTime })
                                          }
                                        />

                                        <TimePicker
                                          label="Talk end"
                                          value={talk.endTime}
                                          onChange={(endTime) =>
                                            updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, { endTime })
                                          }
                                        />

                                        {talk.startTime && talk.endTime && talk.endTime < talk.startTime && (
                                          <p className="sm:col-span-2 text-xs font-medium text-red-600">
                                            The talk end time is earlier than its start time. Check the time range.
                                          </p>
                                        )}

                                        <div>
                                          <label className={labelClass}>Speaker name</label>
                                          <input
                                            className={`${inputClass} border-sky-200 focus:border-sky-500 focus:ring-sky-100`}
                                            value={talk.speakerName}
                                            onChange={(event) =>
                                              updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, {
                                                speakerName: event.target.value,
                                              })
                                            }
                                            placeholder="Dr. Speaker Name"
                                          />
                                        </div>

                                        <div>
                                          <label className={labelClass}>Speaker designation</label>
                                          <input
                                            className={`${inputClass} border-sky-200 focus:border-sky-500 focus:ring-sky-100`}
                                            value={talk.speakerTitle}
                                            onChange={(event) =>
                                              updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, {
                                                speakerTitle: event.target.value,
                                              })
                                            }
                                            placeholder="Professor / Consultant"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className={labelClass}>Institution</label>
                                          <div className="relative">
                                            <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" />
                                            <input
                                              className={`${inputClass} border-sky-200 pl-10 focus:border-sky-500 focus:ring-sky-100`}
                                              value={talk.institution}
                                              onChange={(event) =>
                                                updateTalk(activeDay, activeHallIndex, sessionIndex, talkIndex, {
                                                  institution: event.target.value,
                                                })
                                              }
                                              placeholder="Hospital / University"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </article>
                                  ))}

                                  {session.talks.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-sky-200 bg-[#f8fbff] px-4 py-7 text-center">
                                      <Mic size={22} className="mx-auto text-sky-600" />
                                      <p className="mt-2 text-sm font-semibold text-sky-950">No talks added yet</p>
                                      <p className="mt-1 text-xs text-sky-800/70">
                                        Add individual presentations under this session.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </section>
                        ))}

                        {currentHall.sessions.length === 0 && (
                          <div className="rounded-xl border border-dashed border-orange-200 bg-[#fffaf7] px-5 py-10 text-center">
                            <Clock3 size={24} className="mx-auto text-[#EA580C]" />
                            <h4 className="mt-3 text-sm font-bold text-[#5c2a0c]">No sessions in this hall</h4>
                            <p className="mt-1 text-xs text-[#998475]">
                              Add a session block to begin scheduling this hall.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                updateHall(activeDay, activeHallIndex, {
                                  sessions: [...currentHall.sessions, emptySession()],
                                })
                              }
                              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-4 text-sm font-bold text-white hover:bg-[#c94708]"
                            >
                              <Plus size={15} />
                              Add first session
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {collapsedHallKeys.includes(hallKey(activeDayDate, activeHallIndex)) && (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fffdfb] px-4 py-5 sm:px-6">
                        <p className="text-xs text-[#806d60]">
                          {currentHall.sessions.length} sessions ·{" "}
                          {currentHall.sessions.reduce((sum, session) => sum + session.talks.length, 0)} talks
                          <span className="ml-1">· Hall minimized</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleHallCollapse(activeDayDate, activeHallIndex)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 text-sm font-semibold text-[#A63B08] hover:bg-orange-50"
                        >
                          <PanelTopOpen size={15} />
                          Expand hall
                        </button>
                      </div>
                    )}
                  </section>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee1d7] pt-5">
                  <p className="text-xs text-[#998475]">
                    Day {activeDay + 1} · {currentDay.halls.length} halls
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveDay((index) => Math.max(0, index - 1))}
                      disabled={activeDay === 0}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#eadfd5] bg-white px-4 text-sm font-semibold text-[#705b4b] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft size={15} />
                      Previous day
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDay((index) => Math.min(days.length - 1, index + 1))}
                      disabled={activeDay >= days.length - 1}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#eadfd5] bg-white px-4 text-sm font-semibold text-[#705b4b] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next day
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void saveAgenda()}
                      disabled={saving}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EA580C] px-5 text-sm font-bold text-white hover:bg-[#c94708] disabled:opacity-60"
                    >
                      {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
                      {saving ? "Saving..." : "Save agenda"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeDayCollapsed && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fffdfb] px-5 py-6 sm:px-7">
                <p className="text-sm text-[#806d60]">
                  {currentDay.halls.length} halls ·{" "}
                  {currentDay.halls.reduce((sum, hall) => sum + hall.sessions.length, 0)} sessions
                  <span className="ml-1">· Day minimized</span>
                </p>
                <button
                  type="button"
                  onClick={() => toggleDayCollapse(activeDayDate)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 text-sm font-semibold text-[#A63B08] hover:bg-orange-50"
                >
                  <PanelTopOpen size={15} />
                  Expand day
                </button>
              </div>
            )}
          </motion.section>
        )}

        <footer className="py-8 text-center text-xs text-[#a18c7c]">
          Scientific Program Manager
          <span className="mx-2 text-orange-300">•</span>
          Plan each day. Organize every session.
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eee1d7] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#806d60] sm:text-sm">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums text-[#241000] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] text-[#998475]">{detail}</p>
    </div>
  );
}
