
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ConferenceEvent from "@/models/ConferenceEvent";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { eventId } = await params;

    if (!mongoose.isValidObjectId(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const event = await ConferenceEvent.findById(eventId).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("GET /api/events/[eventId]:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load event." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { eventId } = await params;

    if (!mongoose.isValidObjectId(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const code = typeof data.code === "string" ? data.code.trim().toUpperCase() : "";
    const description = typeof data.description === "string" ? data.description.trim() : "";
    const venue = typeof data.venue === "string" ? data.venue.trim() : "";
    const city = typeof data.city === "string" ? data.city.trim() : "";
    const startDate = typeof data.startDate === "string" ? data.startDate : "";
    const endDate = typeof data.endDate === "string" ? data.endDate : "";

    if (!name || !code || !venue || !city || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, code, dates, venue, and city are required.",
        },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid dates. The end date must not precede the start date.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await ConferenceEvent.findById(eventId);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 },
      );
    }

    existing.name = name;
    existing.code = code;
    existing.description = description;
    existing.startDate = start;
    existing.endDate = end;
    existing.venue = venue;
    existing.city = city;

    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: existing.toObject(),
    });
  } catch (error) {
    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return NextResponse.json(
        { success: false, message: "Please check the event details." },
        { status: 400 },
      );
    }

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "That event code or slug is already in use." },
        { status: 409 },
      );
    }

    console.error("PATCH /api/events/[eventId]:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update event." },
      { status: 500 },
    );
  }
}
