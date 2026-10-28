
import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

const RESET_EXPIRY_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown };

    if (
      typeof body.email !== "string" ||
      body.email.trim().length === 0 ||
      body.email.length > 254
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESET_PASSWORD_FROM;
    const configuredAppUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (
      process.env.NODE_ENV === "production" &&
      (!resendApiKey || !fromEmail || !configuredAppUrl)
    ) {
      console.error(
        "Password reset email is not configured. Set RESEND_API_KEY, RESET_PASSWORD_FROM, and APP_URL.",
      );

      return NextResponse.json(
        {
          success: false,
          message: "Password reset is temporarily unavailable. Please contact the administrator.",
        },
        { status: 503 },
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email });

    // Do not reveal whether an administrator account exists.
    if (!admin) {
      return NextResponse.json({
        success: true,
        message:
          "If an administrator account exists for that email, password-reset instructions will be sent.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: expiresAt,
        },
      },
    );

    const baseUrl = configuredAppUrl || request.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Development-only convenience: open this link locally.
    if (!resendApiKey || !fromEmail) {
      if (process.env.NODE_ENV === "production") {
        await Admin.updateOne(
          { _id: admin._id },
          {
            $unset: {
              passwordResetTokenHash: "",
              passwordResetExpiresAt: "",
            },
          },
        );

        return NextResponse.json(
          {
            success: false,
            message: "Password reset is temporarily unavailable.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Development reset link created. It expires in 30 minutes.",
        resetUrl,
      });
    }

    const safeName = escapeHtml(admin.name || "Administrator");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [admin.email],
        subject: "Reset your SciProgram administrator password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#241000;line-height:1.6">
            <div style="background:#fffaf7;border:1px solid #f7d9c6;border-radius:18px;padding:28px">
              <h1 style="color:#EA580C;font-size:24px">Password reset</h1>
              <p>Hello ${safeName},</p>
              <p>We received a request to reset your SciProgram administrator password.</p>
              <p>
                <a href="${resetUrl}" style="display:inline-block;background:#EA580C;color:white;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold">
                  Reset my password
                </a>
              </p>
              <p>This link expires in 30 minutes and can be used only once.</p>
              <p>If you did not request this, you can ignore this email.</p>
              <p style="font-size:12px;color:#806d60">SciProgram · Scientific Program Manager</p>
            </div>
          </div>
        `,
        text: `Hello ${admin.name || "Administrator"},\n\nReset your SciProgram password using this link:\n${resetUrl}\n\nThis link expires in 30 minutes and can be used only once. If you did not request this, ignore this email.`,
      }),
      cache: "no-store",
    });

    if (!emailResponse.ok) {
      console.error(
        "Password reset email delivery failed:",
        emailResponse.status,
      );

      await Admin.updateOne(
        { _id: admin._id, passwordResetTokenHash: tokenHash },
        {
          $unset: {
            passwordResetTokenHash: "",
            passwordResetExpiresAt: "",
          },
        },
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to send the reset email right now. Please try again later.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "If an administrator account exists for that email, password-reset instructions will be sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process your request. Please try again later.",
      },
      { status: 500 },
    );
  }
}
