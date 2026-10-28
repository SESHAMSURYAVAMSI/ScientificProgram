
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/require-admin";
import ConferenceEvent from "@/models/ConferenceEvent";

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    await connectDB();

    const events = await ConferenceEvent.find({
      createdBy: admin.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Fetch events failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch events." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const venue = typeof body.venue === "string" ? body.venue.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const startDate =
      typeof body.startDate === "string" ? new Date(body.startDate) : null;
    const endDate =
      typeof body.endDate === "string" ? new Date(body.endDate) : null;
    const status = body.status === "published" ? "published" : "draft";

    if (!name || !code || !venue || !city || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Complete all required fields." },
        { status: 400 },
      );
    }

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate < startDate
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid event dates." },
        { status: 400 },
      );
    }

    if (name.length > 160 || code.length > 30 || description.length > 5000) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 },
      );
    }

    await connectDB();

    const existingCode = await ConferenceEvent.findOne({ code }).lean();

    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "This event code is already in use." },
        { status: 409 },
      );
    }

    const baseSlug = makeSlug(name);

    if (!baseSlug) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid event name." },
        { status: 400 },
      );
    }

    let slug = baseSlug;
    let suffix = 2;

    while (await ConferenceEvent.exists({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const event = await ConferenceEvent.create({
      name,
      slug,
      code,
      description,
      startDate,
      endDate,
      venue,
      city,
      status,
      createdBy: admin.id,
    });

    return NextResponse.json(
      { success: true, event },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create event failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create event." },
      { status: 500 },
    );
  }
}
