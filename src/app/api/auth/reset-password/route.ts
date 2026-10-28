
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: unknown;
      password?: unknown;
    };

    if (
      typeof body.token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(body.token) ||
      typeof body.password !== "string" ||
      body.password.length < 8 ||
      body.password.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The reset link is invalid or expired, or the password does not meet the requirements.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const tokenHash = hashToken(body.token);

    const admin = await Admin.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hash(body.password, 12);

    // Include the token hash in the filter to prevent concurrent reuse.
    const updateResult = await Admin.updateOne(
      {
        _id: admin._id,
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: {
          passwordResetTokenHash: "",
          passwordResetExpiresAt: "",
        },
      },
    );

    if (updateResult.modifiedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error(
      "Password reset failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset your password. Please try again later.",
      },
      { status: 500 },
    );
  }
}
