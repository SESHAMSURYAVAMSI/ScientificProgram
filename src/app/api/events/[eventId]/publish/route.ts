
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getAdminSession } from "@/lib/require-admin";
import ConferenceEvent from "@/models/ConferenceEvent";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(
  _request: Request,
  context: RouteContext,
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Please sign in as an administrator." },
        { status: 401 },
      );
    }

    const { eventId } = await context.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const event = await ConferenceEvent.findOne({
      _id: eventId,
      createdBy: admin.id,
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 },
      );
    }

    event.status = event.status === "published" ? "draft" : "published";
    await event.save();

    return NextResponse.json({
      success: true,
      message:
        event.status === "published"
          ? "Event published successfully."
          : "Event unpublished successfully.",
      event: {
        _id: String(event._id),
        name: event.name,
        slug: event.slug,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Publish event error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update event status." },
      { status: 500 },
    );
  }
}
