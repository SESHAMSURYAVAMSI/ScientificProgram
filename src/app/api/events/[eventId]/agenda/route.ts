
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/require-admin";
import ConferenceEvent from "@/models/ConferenceEvent";
import ScientificAgenda from "@/models/ScientificAgenda";

const text = z.string().trim().max(500).default("");

const talkSchema = z.object({
  startTime: text,
  endTime: text,
  title: text,
  speakerName: text,
  speakerTitle: text,
  institution: text,
});

const sessionSchema = z.object({
  startTime: text,
  endTime: text,
  title: text,
  chairpersons: z.array(text).max(50).default([]),
  panelists: z.array(text).max(100).default([]),
  judges: z.array(text).max(100).default([]),
  talks: z.array(talkSchema).max(200).default([]),
});

const hallSchema = z.object({
  name: z.string().trim().min(1).max(150),
  sessions: z.array(sessionSchema).max(100).default([]),
});

const daySchema = z.object({
  label: z.string().trim().min(1).max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid conference date."),
  halls: z.array(hallSchema).max(50).default([]),
});

const agendaSchema = z.object({
  days: z.array(daySchema).max(31),
});

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

type AuthorizationError = "unauthorized" | "not-found";

type AuthorizedAdmin = NonNullable<
  Awaited<ReturnType<typeof getAdminSession>>
>;

type AuthorizedEvent = {
  _id: unknown;
  name: string;
  startDate: Date;
  endDate: Date;
};

type AuthorizationResult =
  | {
      error: AuthorizationError;
    }
  | {
      admin: AuthorizedAdmin;
      event: AuthorizedEvent;
    };

function toDateKey(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getInclusiveDayCount(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 0;
  }

  return Math.floor((end - start) / 86_400_000) + 1;
}

async function authorizeEvent(
  eventId: string,
): Promise<AuthorizationResult> {
  const admin = await getAdminSession();

  if (!admin) {
    return { error: "unauthorized" };
  }

  await connectDB();

  const event = await ConferenceEvent.findOne({
    _id: eventId,
    createdBy: admin.id,
  })
    .select("_id name startDate endDate")
    .lean();

  if (!event) {
    return { error: "not-found" };
  }

  return {
    admin,
    event: {
      _id: event._id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
    },
  };
}

function isAuthorizationFailure(
  access: AuthorizationResult,
): access is { error: AuthorizationError } {
  return "error" in access;
}

function authorizationResponse(error: AuthorizationError) {
  return NextResponse.json(
    {
      success: false,
      message:
        error === "unauthorized"
          ? "Authentication required."
          : "Event not found.",
    },
    {
      status: error === "unauthorized" ? 401 : 404,
    },
  );
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { eventId } = await context.params;
    const access = await authorizeEvent(eventId);

    if (isAuthorizationFailure(access)) {
      return authorizationResponse(access.error);
    }

    const agenda = await ScientificAgenda.findOne({
      eventId,
      createdBy: access.admin.id,
    }).lean();

    return NextResponse.json({
      success: true,
      event: {
        name: access.event.name,
        startDate: toDateKey(access.event.startDate),
        endDate: toDateKey(access.event.endDate),
      },
      days: agenda?.days ?? [],
    });
  } catch (error) {
    console.error("Fetch agenda failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the agenda.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { eventId } = await context.params;
    const access = await authorizeEvent(eventId);

    if (isAuthorizationFailure(access)) {
      return authorizationResponse(access.error);
    }

    const eventStart = toDateKey(access.event.startDate);
    const eventEnd = toDateKey(access.event.endDate);
    const allowedDayCount = getInclusiveDayCount(eventStart, eventEnd);

    if (!allowedDayCount) {
      return NextResponse.json(
        {
          success: false,
          message: "This event has an invalid date range.",
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "The request body must contain valid JSON.",
        },
        { status: 400 },
      );
    }

    const parsed = agendaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid agenda data. Every agenda day needs a valid date, label, and valid hall/session data.",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { days } = parsed.data;

    if (days.length > allowedDayCount) {
      return NextResponse.json(
        {
          success: false,
          message: `This event runs for ${allowedDayCount} ${
            allowedDayCount === 1 ? "day" : "days"
          }. You can create no more than ${allowedDayCount} agenda ${
            allowedDayCount === 1 ? "day" : "days"
          }.`,
        },
        { status: 400 },
      );
    }

    const usedDates = new Set<string>();

    for (const day of days) {
      const parsedDate = new Date(`${day.date}T00:00:00.000Z`);
      const validCalendarDate =
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === day.date;

      if (!validCalendarDate) {
        return NextResponse.json(
          {
            success: false,
            message: `"${day.date}" is not a valid calendar date.`,
          },
          { status: 400 },
        );
      }

      if (day.date < eventStart || day.date > eventEnd) {
        return NextResponse.json(
          {
            success: false,
            message: `"${day.label}" must use a date between ${eventStart} and ${eventEnd}, inclusive.`,
          },
          { status: 400 },
        );
      }

      if (usedDates.has(day.date)) {
        return NextResponse.json(
          {
            success: false,
            message: `The date ${day.date} is assigned to more than one agenda day.`,
          },
          { status: 400 },
        );
      }

      usedDates.add(day.date);
    }

    const sortedDays = [...days].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const normalizedDays = sortedDays.map((day, index) => ({
      ...day,
      label: `Day ${index + 1}`,
    }));

    const agenda = await ScientificAgenda.findOneAndUpdate(
      {
        eventId,
        createdBy: access.admin.id,
      },
      {
        $set: {
          eventId,
          createdBy: access.admin.id,
          days: normalizedDays,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Agenda saved successfully.",
      days: agenda.days,
    });
  } catch (error) {
    console.error("Save agenda failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save the agenda.",
      },
      { status: 500 },
    );
  }
}
