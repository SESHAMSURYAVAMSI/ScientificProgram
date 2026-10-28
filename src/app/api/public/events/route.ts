
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import ConferenceEvent from "@/models/ConferenceEvent";

export async function GET() {
  try {
    await connectDB();

    const events = await ConferenceEvent.find({
      status: "published",
    })
      .select(
        "name slug code description startDate endDate venue city status",
      )
      .sort({ startDate: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        events,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Public conferences API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load published conferences.",
      },
      { status: 500 },
    );
  }
}
