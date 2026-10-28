"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  Check,
  Clock3,
  Search,
  X,
  Send,
  LoaderCircle,
  BookOpen,
  Printer,
} from "lucide-react";

type Talk = {
  startTime: string;
  endTime: string;
  title: string;
  speakerName: string;
  speakerTitle: string;
  institution: string;
};

type Session = {
  startTime: string;
  endTime: string;
  title: string;
  chairpersons: string[];
  panelists: string[];
  judges: string[];
  talks: Talk[];
};

type Hall = {
  name: string;
  sessions: Session[];
};

type Day = {
  label: string;
  date: string;
  halls: Hall[];
};

type EventDetails = {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
};

type AgendaResponse = {
  success: boolean;
  message?: string;
  event?: EventDetails;
  days?: Day[];
};

type FacultyOccurrence = {
  dayLabel: string;
  dayDate: string;
  hallName: string;
  sessionTitle: string;
  sessionStartTime: string;
  sessionEndTime: string;
  role: string;
  talkTitle?: string;
  talkStartTime?: string;
  talkEndTime?: string;
};

type FacultyEntry = {
  name: string;
  sessions: number;
  talks: number;
  roles: string[];
  appearances: FacultyOccurrence[];
};

type PageTab = "schedule" | "faculty";

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

function formatDayDate(day: Day, index: number) {
  const date = day.date ? new Date(day.date) : null;
  const label = day.label || `Day ${index + 1}`;
  if (!date || Number.isNaN(date.getTime())) return label;
  return `${label} : ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
  })}`;
}

function formatEventDates(start: string, end: string) {
  if (!start) return "Dates to be announced";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const startText = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!endDate || Number.isNaN(endDate.getTime()) || startDate.toDateString() === endDate.toDateString()) {
    return startText;
  }
  const endText = endDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startText} – ${endText}`;
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle size={30} className="animate-spin text-[#811626]" />
        <p className="text-sm font-medium text-[#46516a]">Loading conference programme…</p>
      </div>
    </main>
  );
}

function PublicAgendaContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<PageTab>("schedule");
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedHall, setSelectedHall] = useState("all");
  const [hallMenuOpen, setHallMenuOpen] = useState(false);
  const [dayMenuOpen, setDayMenuOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionName, setQuestionName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [questionSuccess, setQuestionSuccess] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const loadAgenda = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setError("A conference slug was not provided.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/public/events/${encodeURIComponent(slug)}/agenda`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as AgendaResponse;

      if (!response.ok || !result.success || !result.event) {
        throw new Error(result.message || "Unable to load this conference agenda.");
      }

      setEvent(result.event);
      setDays(result.days ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the conference agenda.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadAgenda();
  }, [loadAgenda]);

  const allHallNames = useMemo(() => {
    const names = new Set<string>();
    days.forEach((day) => day.halls?.forEach((hall) => {
      if (hall.name?.trim()) names.add(hall.name.trim());
    }));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [days]);

  const faculty = useMemo(() => {
    const people = new Map<string, FacultyEntry>();

    const addAppearance = (
      rawName: string,
      role: string,
      occurrence: FacultyOccurrence,
      isTalk = false,
    ) => {
      const name = rawName.trim();
      if (!name) return;
      const key = name.toLocaleLowerCase();
      const current = people.get(key) ?? {
        name,
        sessions: 0,
        talks: 0,
        roles: [],
        appearances: [],
      };
      if (isTalk) current.talks += 1;
      else current.sessions += 1;
      if (!current.roles.includes(role)) current.roles.push(role);
      current.appearances.push(occurrence);
      if (name.length > current.name.length) current.name = name;
      people.set(key, current);
    };

    days.forEach((day, dayIndex) => {
      (day.halls ?? []).forEach((hall) => {
        (hall.sessions ?? []).forEach((session) => {
          const base = {
            dayLabel: day.label || `Day ${dayIndex + 1}`,
            dayDate: day.date || "",
            hallName: hall.name || "Hall",
            sessionTitle: session.title || "Scientific session",
            sessionStartTime: session.startTime || "",
            sessionEndTime: session.endTime || "",
          };
          (session.chairpersons ?? []).forEach((name) =>
            addAppearance(name, "Chairperson", { ...base, role: "Chairperson" }),
          );
          (session.panelists ?? []).forEach((name) =>
            addAppearance(name, "Panelist", { ...base, role: "Panelist" }),
          );
          (session.judges ?? []).forEach((name) =>
            addAppearance(name, "Judge", { ...base, role: "Judge" }),
          );
          (session.talks ?? []).forEach((talk) => {
            if (!talk.speakerName?.trim()) return;
            addAppearance(
              talk.speakerName,
              "Speaker",
              {
                ...base,
                role: "Speaker",
                talkTitle: talk.title || "Talk title to be announced",
                talkStartTime: talk.startTime || "",
                talkEndTime: talk.endTime || "",
              },
              true,
            );
          });
        });
      });
    });

    return [...people.values()]
      .map((person) => ({
        ...person,
        appearances: person.appearances.sort((a, b) => {
          const dateCompare = a.dayDate.localeCompare(b.dayDate);
          return dateCompare || a.sessionStartTime.localeCompare(b.sessionStartTime);
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  }, [days]);

  const matchingDays = useMemo(() => {
    const query = search.trim().toLowerCase();

    return days.map((day, dayIndex) => {
      const hallItems = (day.halls ?? []).map((hall, hallIndex) => {
        const sessions = (hall.sessions ?? []).map((session, sessionIndex) => {
          const searchable = [
            session.title,
            ...(session.chairpersons ?? []),
            ...(session.panelists ?? []),
            ...(session.judges ?? []),
            ...(session.talks ?? []).flatMap((talk) => [
              talk.title, talk.speakerName, talk.speakerTitle, talk.institution,
            ]),
          ].join(" ").toLowerCase();
          return { session, sessionIndex, matches: !query || searchable.includes(query) };
        }).filter(({ matches }) => matches);
        return { hall, hallIndex, sessions };
      }).filter(({ hall, sessions }) =>
        (selectedHall === "all" || hall.name === selectedHall) &&
        (sessions.length > 0 || (!query && (hall.sessions ?? []).length === 0)),
      );

      const sessionsCount = hallItems.reduce((sum, item) => sum + item.sessions.length, 0);
      return { day, dayIndex, halls: hallItems, sessionsCount };
    }).filter(({ dayIndex, sessionsCount }) =>
      (selectedDay === "all" || String(dayIndex) === selectedDay) &&
      (sessionsCount > 0 || (!query && days[dayIndex]?.halls?.length === 0)),
    );
  }, [days, search, selectedDay, selectedHall]);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faculty.filter((person) =>
      !query || `${person.name} ${person.roles.join(" ")}`.toLowerCase().includes(query),
    );
  }, [faculty, search]);

  const facultyGroups = useMemo(() => {
    const groups = new Map<string, FacultyEntry[]>();
    filteredFaculty.forEach((person) => {
      const letter = person.name.trim().charAt(0).toLocaleUpperCase() || "#";
      const group = groups.get(letter) ?? [];
      group.push(person);
      groups.set(letter, group);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredFaculty]);

  async function handleQuestionSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setQuestionError("");
    setQuestionSuccess("");

    if (questionName.trim().length < 2) {
      setQuestionError("Please enter your name.");
      return;
    }
    if (questionText.trim().length < 5) {
      setQuestionError("Please enter your question.");
      return;
    }

    setSubmittingQuestion(true);
    try {
      const response = await fetch(
        `/api/public/events/${encodeURIComponent(slug)}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: questionName.trim(),
            email: "",
            question: questionText.trim(),
          }),
        },
      );

      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your question.");
      }

      setQuestionName("");
      setQuestionText("");
      setQuestionSuccess(result.message || "Your question has been submitted successfully.");
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Unable to submit your question.");
    } finally {
      setSubmittingQuestion(false);
    }
  }

  if (loading) return <LoadingScreen />;

  if (error || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <BookOpen className="mx-auto text-[#811626]" size={32} />
          <h1 className="mt-4 text-xl font-bold text-[#6f2d0d]">Agenda unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">{error || "This conference could not be found."}</p>
          <button type="button" onClick={() => void loadAgenda()} className="mt-5 rounded-lg bg-[#241000] px-4 py-2.5 text-sm font-semibold text-white">Try again</button>
          <div><Link href="/conferences" className="mt-4 inline-block text-sm text-[#6f2d0d] underline">All conferences</Link></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#241000]">
      <header className="relative overflow-hidden bg-gradient-to-r from-[#241000] via-[#3b1a08] to-[#6b2b0b] px-4 py-5 text-center text-white shadow-[0_8px_30px_rgba(36,16,0,0.18)] sm:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-24 size-64 rounded-full border border-orange-100/50" />
          <div className="absolute -right-2 -top-16 size-48 rounded-full border border-orange-100/40" />
          <div className="absolute -left-20 -bottom-32 size-72 rounded-full bg-orange-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold tracking-[0.035em] sm:text-[27px]">{event.name}</h1>
        {event.description && <p className="mt-1 text-xs text-white/90 sm:text-sm">{event.description}</p>}
        <p className="mt-2 text-[11px] text-orange-100/90 sm:text-xs">
          {formatEventDates(event.startDate, event.endDate)}
          {(event.venue || event.city) && ` @ ${[event.venue, event.city].filter(Boolean).join(", ")}`}
        </p>
        </div>
      </header>

      <nav className="sticky top-0 z-30 flex h-11 items-stretch justify-center border-b border-orange-300/20 bg-[#241000] text-xs text-white shadow-md sm:h-12">
        <button type="button" onClick={() => setTab("schedule")} className={`border-b-2 px-5 font-semibold transition sm:px-7 ${tab === "schedule" ? "border-[#EA580C] text-white" : "border-transparent text-orange-100/75 hover:text-white"}`}>Schedule</button>
        <button type="button" onClick={() => setTab("faculty")} className={`border-b-2 px-5 font-semibold transition sm:px-7 ${tab === "faculty" ? "border-[#EA580C] text-white" : "border-transparent text-orange-100/75 hover:text-white"}`}>Faculty</button>
        <button type="button" onClick={() => { setQuestionOpen(true); setQuestionError(""); setQuestionSuccess(""); }} className="border-b-2 border-transparent px-5 font-semibold text-orange-100/80 transition hover:text-white sm:px-7">Ask a question</button>
      </nav>

      <div className="mx-auto w-full max-w-[940px] flex-1 px-3 pb-36 pt-3 sm:px-4 sm:pt-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={tab === "faculty" ? "Search faculty" : "Search schedule"}
            placeholder="Search by topic, faculty name, keyword..."
            className="h-[42px] w-full rounded-[11px] border border-[#d9d9d9] bg-white pl-9 pr-10 text-xs text-[#6f2d0d] outline-none placeholder:text-[#8790a0] focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100 sm:text-[13px]"
          />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EA580C]"><X size={15} /></button>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 border-b border-[#d9d9d9] pb-3">
          <div className="relative w-[calc(50%-4px)] min-w-[145px] max-w-[216px]">
            <button type="button" onClick={() => { setDayMenuOpen(!dayMenuOpen); setHallMenuOpen(false); }} className="flex h-[33px] w-full items-center justify-between rounded-[7px] border border-[#d8d8d8] bg-white px-3 text-left text-xs shadow-sm hover:border-gray-400">
              <span>{selectedDay === "all" ? "All Days" : formatDayDate(days[Number(selectedDay)], Number(selectedDay))}</span>
              <ChevronDown size={13} className={`text-gray-500 transition ${dayMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {dayMenuOpen && <div className="absolute left-0 top-[37px] z-20 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button type="button" onClick={() => { setSelectedDay("all"); setDayMenuOpen(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-gray-50">All Days {selectedDay === "all" && <Check size={13} className="text-[#EA580C]" />}</button>
              {days.map((day, index) => <button key={`${day.date}-${index}`} type="button" onClick={() => { setSelectedDay(String(index)); setDayMenuOpen(false); }} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-gray-50">{formatDayDate(day, index)} {selectedDay === String(index) && <Check size={13} className="text-[#EA580C]" />}</button>)}
            </div>}
          </div>

          <div className="relative w-[calc(50%-4px)] min-w-[145px] max-w-[216px]">
            <button type="button" onClick={() => { setHallMenuOpen(!hallMenuOpen); setDayMenuOpen(false); }} className={`flex h-[33px] w-full items-center justify-between rounded-[7px] border bg-white px-3 text-left text-xs shadow-sm transition ${hallMenuOpen ? "border-[#EA580C] ring-1 ring-[#EA580C]" : "border-[#d8d8d8] hover:border-gray-400"}`}>
              <span>{selectedHall === "all" ? "All Halls" : selectedHall}</span>
              <ChevronDown size={13} className={`text-gray-500 transition ${hallMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {hallMenuOpen && <div className="absolute left-0 top-[37px] z-20 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button type="button" onClick={() => { setSelectedHall("all"); setHallMenuOpen(false); }} className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs ${selectedHall === "all" ? "bg-[#fff0e6] font-semibold text-[#9a3d12]" : "hover:bg-gray-50"}`}>All Halls {selectedHall === "all" && <Check size={13} />}</button>
              {allHallNames.map((hall) => <button key={hall} type="button" onClick={() => { setSelectedHall(hall); setHallMenuOpen(false); }} className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs ${selectedHall === hall ? "bg-[#fff0e6] font-semibold text-[#9a3d12]" : "hover:bg-gray-50"}`}>{hall} {selectedHall === hall && <Check size={13} />}</button>)}
            </div>}
          </div>

          <span className="ml-auto text-xs text-[#273653]">
            {tab === "faculty" ? `${filteredFaculty.length} faculty` : `${matchingDays.reduce((sum, day) => sum + day.sessionsCount, 0)} sessions`}
          </span>
        </div>

        {tab === "schedule" ? (
          <div className="pt-5">
            {days.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">The conference schedule has not been published yet.</div>
            ) : matchingDays.length === 0 ? (
              <div className="py-16 text-center">
                <Search size={28} className="mx-auto text-gray-400" />
                <p className="mt-3 text-sm font-semibold">No matching sessions found</p>
                <button type="button" onClick={() => { setSearch(""); setSelectedDay("all"); setSelectedHall("all"); }} className="mt-2 text-xs font-semibold text-[#EA580C] underline">Clear filters</button>
              </div>
            ) : matchingDays.map(({ day, dayIndex, halls }) => (
              <section key={`${day.date}-${dayIndex}`} className="mb-7">
                <h2 className="border-b border-[#EA580C] pb-2 text-[16px] font-bold text-[#9a3d12]">
                  {formatDayDate(day, dayIndex)}
                </h2>

                {halls.map(({ hall, hallIndex, sessions }) => (
                  <div key={`${hall.name}-${hallIndex}`} className="pt-4">
                    <h3 className="mb-3 text-[13px] font-medium text-[#51301f]">{hall.name || `Hall ${hallIndex + 1}`}</h3>

                    {sessions.length === 0 && (hall.sessions ?? []).length === 0 && (
                      <p className="rounded-lg bg-white p-4 text-xs text-gray-500">No sessions scheduled in this hall.</p>
                    )}

                    {sessions.map(({ session, sessionIndex }) => (
                      <div key={`${session.title}-${sessionIndex}`} className="mb-3">
                        <article className="rounded-[11px] border border-[#f0d5c3] border-l-[3px] border-l-[#EA580C] bg-[#fff0e6] px-4 py-4 shadow-[0_2px_4px_rgba(20,35,65,0.08)] sm:px-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="rounded-full bg-[#241000] px-3 py-1 text-[11px] font-bold text-white">{session.startTime || "Time TBA"}{session.endTime ? ` - ${session.endTime}` : ""}</span>
                            <span className="rounded-md bg-[#f9ddc9] px-2 py-0.5 text-[10px] font-medium text-[#6f2d0d]">{hall.name || `Hall ${hallIndex + 1}`}</span>
                          </div>
                          <h4 className="mt-2.5 text-[15px] font-bold leading-snug text-[#301607]">{session.title || "Scientific session"}</h4>
                          {session.chairpersons?.filter(Boolean).length > 0 && <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-5"><span className="font-bold uppercase tracking-wide text-[#9a3d12]">Chairpersons:</span>{session.chairpersons.filter(Boolean).map((person, i) => <span key={`${person}-${i}`} className="text-[#8b3b14] underline decoration-dotted underline-offset-2">{person}</span>)}</div>}
                          {session.panelists?.filter(Boolean).length > 0 && <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-5"><span className="font-bold uppercase tracking-wide text-[#9a3d12]">Panelists:</span>{session.panelists.filter(Boolean).map((person, i) => <span key={`${person}-${i}`} className="text-[#8b3b14] underline decoration-dotted underline-offset-2">{person}</span>)}</div>}
                          {session.judges?.filter(Boolean).length > 0 && <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-5"><span className="font-bold uppercase tracking-wide text-[#9a3d12]">Judges:</span>{session.judges.filter(Boolean).map((person, i) => <span key={`${person}-${i}`} className="text-[#8b3b14] underline decoration-dotted underline-offset-2">{person}</span>)}</div>}
                        </article>

                        {(session.talks ?? []).filter((talk) => {
                          const query = search.trim().toLowerCase();
                          return !query || [talk.title, talk.speakerName, talk.speakerTitle, talk.institution, session.title].join(" ").toLowerCase().includes(query);
                        }).map((talk, talkIndex) => (
                          <article key={`${talk.title}-${talkIndex}`} className="ml-2.5 mt-2.5 rounded-[10px] border border-[#eeeeee] border-l-[3px] border-l-[#EA580C] bg-white px-3.5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:ml-2.5 sm:px-3.5">
                            <p className="text-[11px] font-medium text-[#51301f]">{talk.startTime || "Time TBA"}{talk.endTime ? ` - ${talk.endTime}` : ""}</p>
                            <p className="mt-2 text-[10px] italic text-[#6f7786]">{session.title}</p>
                            <h5 className="mt-1 text-[13px] font-medium leading-5 text-[#171717]">{talk.title || "Talk title to be announced"}</h5>
                            {talk.speakerName && <p className="mt-2 text-[10px] leading-5"><span className="font-bold uppercase tracking-wide text-[#9a3d12]">Speaker:</span> <span className="text-[#8b3b14] underline decoration-dotted underline-offset-2">{talk.speakerName}</span>{talk.speakerTitle ? ` · ${talk.speakerTitle}` : ""}{talk.institution ? ` · ${talk.institution}` : ""}</p>}
                          </article>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="pt-5">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#EA580C]">Faculty directory</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#241000]">Conference faculty</h2>
                <p className="mt-1 text-xs text-[#806451]">Select a faculty member to see every session and talk they are part of.</p>
              </div>
              <span className="w-fit rounded-full border border-[#f0d5c3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#785541]">{filteredFaculty.length} faculty members</span>
            </div>
            {facultyGroups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white py-16 text-center text-sm text-gray-500">No faculty members match your search.</div>
            ) : facultyGroups.map(([letter, entries]) => (
              <section key={letter} className="mb-5">
                <h2 className="border-b border-[#EA580C] pb-1.5 text-[16px] font-bold text-[#9a3d12]">{letter}</h2>
                <div className="mt-2 space-y-2">
                  {entries.map((person) => {
                    const isExpanded = expandedFaculty === person.name;
                    return (
                      <article key={person.name} className={`overflow-hidden rounded-xl border bg-white shadow-[0_2px_8px_rgba(36,16,0,0.035)] transition ${isExpanded ? "border-orange-300 shadow-[0_8px_24px_rgba(234,88,12,0.08)]" : "border-[#eee4dc] hover:border-orange-200"}`}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedFaculty(isExpanded ? null : person.name)}
                          className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left sm:px-4"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${isExpanded ? "bg-[#EA580C] text-white" : "bg-[#fff0e6] text-[#9a3d12]"}`}>{person.name.trim().charAt(0).toUpperCase()}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-[12px] font-bold text-[#51301f] sm:text-[13px]">{person.name}</span>
                              <span className="mt-1 block text-[10px] text-[#927967]">{person.roles.join(" · ")}</span>
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-[#f7e7dc] px-2.5 py-1 text-[9px] font-semibold text-[#6b3c22]">{person.appearances.length} {person.appearances.length === 1 ? "appearance" : "appearances"}</span>
                            <ChevronDown size={15} className={`text-[#9a3d12] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[#f0dfd3] bg-[#fffaf7] px-3.5 py-4 sm:px-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-extrabold text-[#301607]">{person.name}</h3>
                                <p className="mt-1 text-[11px] text-[#806451]">All sessions and talks featuring this faculty member</p>
                              </div>
                              <span className="rounded-lg border border-[#f0d5c3] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#8b3b14]">{person.appearances.length} listed item{person.appearances.length === 1 ? "" : "s"}</span>
                            </div>
                            <div className="space-y-2.5">
                              {person.appearances.map((appearance, index) => (
                                <div key={`${appearance.dayDate}-${appearance.hallName}-${appearance.sessionTitle}-${appearance.role}-${index}`} className="rounded-xl border border-[#eddfd4] bg-white p-3.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full bg-[#fff0e6] px-2 py-1 text-[9px] font-bold text-[#9a3d12]">{appearance.role}</span>
                                    <span className="rounded-full bg-[#f4f0ec] px-2 py-1 text-[9px] font-medium text-[#6b5a4d]">{appearance.dayLabel}{appearance.dayDate ? ` · ${formatDate(appearance.dayDate, { year: undefined })}` : ""}</span>
                                    <span className="rounded-full bg-[#f4f0ec] px-2 py-1 text-[9px] font-medium text-[#6b5a4d]">{appearance.hallName}</span>
                                  </div>
                                  <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="text-[12px] font-bold leading-5 text-[#301607]">{appearance.sessionTitle}</p>
                                      {appearance.talkTitle && <p className="mt-1 text-[11px] leading-5 text-[#785541]">Talk: {appearance.talkTitle}</p>}
                                    </div>
                                    {(appearance.talkStartTime || appearance.sessionStartTime) && <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-[#9a3d12]"><Clock3 size={12} />{appearance.talkStartTime || appearance.sessionStartTime}{(appearance.talkEndTime || appearance.sessionEndTime) ? ` - ${appearance.talkEndTime || appearance.sessionEndTime}` : ""}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="fixed inset-x-0 bottom-0 z-40 w-full overflow-hidden border-t border-orange-300/20 bg-gradient-to-r from-[#241000] via-[#3b1a08] to-[#6b2b0b] px-4 py-3 text-white shadow-[0_-8px_28px_rgba(36,16,0,0.16)] sm:px-6 sm:py-3.5">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-wide">{event.name}</p>
              {event.description && <p className="mt-1 max-w-2xl text-[11px] leading-5 text-orange-100/75">{event.description}</p>}
              <p className="mt-2 text-[11px] text-orange-100/90">
                {formatEventDates(event.startDate, event.endDate)}
                {(event.venue || event.city) && ` @ ${[event.venue, event.city].filter(Boolean).join(", ")}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 text-[11px]">
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 font-semibold text-white transition hover:bg-white/15">Back to top</button>
              <button type="button" onClick={() => window.print()} className="rounded-lg bg-[#EA580C] px-3 py-2 font-bold text-white transition hover:bg-[#c94708]">Print programme</button>
              {/* <Link href="/conferences" className="rounded-lg border border-white/20 px-3 py-2 font-semibold text-orange-50 transition hover:bg-white/10">All conferences</Link> */}
            </div>
          </div>
          <div className="mx-auto mt-3 w-full max-w-[1400px] border-t border-white/15 pt-2 text-[10px] text-orange-100/60">
            Scientific Program Manager · Official conference programme
          </div>
        </footer>
      </div>

      {questionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241000]/65 px-4 py-6 backdrop-blur-[3px]" onMouseDown={(e) => { if (e.target === e.currentTarget) setQuestionOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="ask-question-title" className="w-full max-w-[428px] overflow-hidden rounded-[14px] border border-white/70 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#241000] px-5 py-5 text-white">
              <h2 id="ask-question-title" className="text-[15px] font-bold">Ask a Question</h2>
              <button type="button" onClick={() => setQuestionOpen(false)} aria-label="Close question form" className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white"><X size={17} /></button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="px-5 pb-5 pt-5">
              <label htmlFor="ask-name" className="mb-1.5 block text-[11px] font-semibold text-[#3c465b]">Your Name <span className="text-rose-600">*</span></label>
              <input id="ask-name" required minLength={2} maxLength={100} value={questionName} onChange={(e) => setQuestionName(e.target.value)} placeholder="Enter your name" className="h-9 w-full rounded-[7px] border border-[#ead9cd] px-3 text-[11px] outline-none placeholder:text-[#9ba4b4] focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100" />

              <label htmlFor="ask-question" className="mb-1.5 mt-4 block text-[11px] font-semibold text-[#3c465b]">Your Question <span className="text-rose-600">*</span></label>
              <textarea id="ask-question" required minLength={5} maxLength={2000} rows={4} value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Type your question here..." className="w-full resize-y rounded-[7px] border border-[#ead9cd] px-3 py-2.5 text-[11px] leading-5 outline-none placeholder:text-[#9ba4b4] focus:border-[#EA580C] focus:ring-2 focus:ring-orange-100" />

              <p className="mt-3 text-[11px] text-[#667085]">Your question will be sent to the conference team.</p>
              {questionError && <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{questionError}</p>}
              {questionSuccess && <p role="status" className="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">{questionSuccess}</p>}

              <div className="mt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setQuestionOpen(false)} className="rounded-lg px-3 py-2 text-xs font-medium text-[#4b5565] hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={submittingQuestion} className="inline-flex min-w-[98px] items-center justify-center gap-2 rounded-md bg-[#241000] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#3a1b0a] disabled:cursor-not-allowed disabled:opacity-60">
                  {submittingQuestion ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                  {submittingQuestion ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: white !important; }
          nav, input, select, footer button, footer a, .print-hidden { display: none !important; }
          footer { position: static !important; border: 0 !important; box-shadow: none !important; }
          main { background: white !important; }
          article { break-inside: avoid; box-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}

export default function PublicAgendaPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PublicAgendaContent />
    </Suspense>
  );
}
