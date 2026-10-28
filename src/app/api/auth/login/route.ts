
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      !body.email.trim() ||
      !body.password
    ) {
      return NextResponse.json(
        { success: false, message: "Enter your email and password." },
        { status: 400 },
      );
    }

    await connectDB();

    const email = body.email.trim().toLowerCase();
    const admin = await Admin.findOne({ email });

    if (!admin || !(await compare(body.password, admin.passwordHash))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      admin: {
        name: admin.name,
        email: admin.email,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(
      "Admin login failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { success: false, message: "Unable to sign in. Please try again." },
      { status: 500 },
    );
  }
}
