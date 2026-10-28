
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      database: "connected",
      application: "SciProgram",
    });
  } catch (error: unknown) {
    console.error(
      "Database health check failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
        message:
          "Database connection failed. Check your .env.local MongoDB configuration.",
      },
      { status: 503 },
    );
  }
}
