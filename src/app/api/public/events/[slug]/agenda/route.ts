
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ConferenceEvent from "@/models/ConferenceEvent";
import ScientificAgenda from "@/models/ScientificAgenda";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { slug } = await context.params;

    await connectDB();

    const event = await ConferenceEvent.findOne({
      slug,
      status: "published",
    }).lean();

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Published event not found.",
        },
        { status: 404 },
      );
    }

    const agenda = await ScientificAgenda.findOne({
      eventId: String(event._id),
    }).lean();

    return NextResponse.json({
      success: true,
      event: {
        id: String(event._id),
        name: event.name,
        slug: event.slug,
        code: event.code,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        venue: event.venue,
        city: event.city,
      },
      days: agenda?.days ?? [],
    });
  } catch (error) {
    console.error("Public agenda fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load the agenda.",
      },
      { status: 500 },
    );
  }
}
