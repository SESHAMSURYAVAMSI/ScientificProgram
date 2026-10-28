
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      setupKey?: unknown;
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    const setupKey = process.env.ADMIN_SETUP_KEY;

    if (!setupKey || body.setupKey !== setupKey) {
      return NextResponse.json(
        { success: false, message: "Invalid setup key." },
        { status: 401 },
      );
    }

    if (
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Provide name, email and password." },
        { status: 400 },
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!name || !email.includes("@") || password.length < 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid name and email, and a password of at least 12 characters.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    if ((await Admin.countDocuments()) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "An administrator already exists. Setup is closed.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    await Admin.create({ name, email, passwordHash });

    return NextResponse.json(
      { success: true, message: "Administrator created successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Admin setup failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { success: false, message: "Unable to create administrator." },
      { status: 500 },
    );
  }
}
