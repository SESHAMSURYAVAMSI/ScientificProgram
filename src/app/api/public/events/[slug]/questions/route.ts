
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import ConferenceEvent from "@/models/ConferenceEvent";
import ScientificQuestion from "@/models/ScientificQuestion";

const questionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
  question: z.string().trim().min(5).max(2000),
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/public/events/[slug]/questions
 *
 * Returns all questions for a published event except rejected questions.
 * Questions are not filtered by age, so they remain available indefinitely.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    const { slug } = await context.params;

    const event = await ConferenceEvent.findOne({
      slug,
      status: "published",
    })
      .select("name slug startDate endDate venue location")
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Published event not found." },
        { status: 404 },
      );
    }

    const questions = await ScientificQuestion.find({
      eventId: String(event._id),
      status: { $ne: "rejected" as const },
    })
      .select("name question answer status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        event,
        questions,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Public questions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch questions.",
        ...(process.env.NODE_ENV === "development" && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/public/events/[slug]/questions
 *
 * Submits a new question for a published event.
 * New questions are saved in MongoDB with pending status.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    const { slug } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const validation = questionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted details.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const event = await ConferenceEvent.findOne({
      slug,
      status: "published",
    }).select("_id slug createdBy");

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Published event not found." },
        { status: 404 },
      );
    }

    const { name, email, question } = validation.data;

    const newQuestion = await ScientificQuestion.create({
      eventId: String(event._id),
      eventSlug: event.slug,
      createdBy: event.createdBy ?? event._id,
      name,
      email: email ?? "",
      question,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your question was submitted successfully.",
        question: {
          _id: String(newQuestion._id),
          name: newQuestion.name,
          question: newQuestion.question,
          status: newQuestion.status,
          createdAt: newQuestion.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Public questions POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit your question.",
        ...(process.env.NODE_ENV === "development" && {
          debug: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
    );
  }
}
