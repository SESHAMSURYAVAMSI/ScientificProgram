
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";


function matchesRecoveryCode(
  providedCode: string,
  configuredCode: string,
): boolean {
  const providedHash = createHash("sha256")
    .update(providedCode)
    .digest();

  const configuredHash = createHash("sha256")
    .update(configuredCode)
    .digest();

  return timingSafeEqual(providedHash, configuredHash);
}

export async function POST(request: Request) {
  try {
    const configuredCode = process.env.ADMIN_RECOVERY_CODE;

    if (!configuredCode || configuredCode.length < 32) {
      console.error(
        "ADMIN_RECOVERY_CODE is missing or is too short.",
      );

      return NextResponse.json(
        { message: "Password recovery is not configured on the server." },
        { status: 503 },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 },
      );
    }

    const {
      email,
      recoveryCode,
      newPassword,
      confirmPassword,
    } = body as Record<string, unknown>;

    if (
      typeof email !== "string" ||
      typeof recoveryCode !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        { message: "Please complete all fields." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return NextResponse.json(
        { message: "Enter a valid admin email address." },
        { status: 400 },
      );
    }

    if (
      recoveryCode.length < 32 ||
      recoveryCode.length > 512 ||
      !matchesRecoveryCode(recoveryCode, configuredCode)
    ) {
      return NextResponse.json(
        { message: "The recovery details are invalid." },
        { status: 400 },
      );
    }

    if (newPassword.length < 12 || newPassword.length > 128) {
      return NextResponse.json(
        { message: "Your new password must be 12–128 characters long." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "The passwords do not match." },
        { status: 400 },
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return NextResponse.json(
        { message: "The recovery details are invalid." },
        { status: 400 },
      );
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return NextResponse.json({
      message:
        "Your password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Admin password recovery failed:", error);

    return NextResponse.json(
      { message: "Unable to reset the password. Please try again." },
      { status: 500 },
    );
  }
}
