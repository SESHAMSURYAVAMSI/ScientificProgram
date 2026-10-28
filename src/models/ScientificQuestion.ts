import mongoose, { Schema, type Model } from "mongoose";

export interface IScientificQuestion {
  eventId: string;
  eventSlug: string;
  createdBy: string;
  name: string;
  email: string;
  question: string;
  status: "pending" | "approved" | "rejected";
  answer: string;
  answeredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScientificQuestionSchema = new Schema<IScientificQuestion>(
  {
    eventId: { type: String, required: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    createdBy: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    // Email is optional because the public agenda question form does not ask for it.
    email: {
      type: String,
      required: false,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    question: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    answer: { type: String, default: "", trim: true, maxlength: 4000 },
    answeredBy: { type: String, default: "" },
  },
  { timestamps: true },
);

ScientificQuestionSchema.index({ eventId: 1, status: 1, createdAt: -1 });

const ScientificQuestion: Model<IScientificQuestion> =
  (mongoose.models.ScientificQuestion as Model<IScientificQuestion> | undefined) ??
  mongoose.model<IScientificQuestion>("ScientificQuestion", ScientificQuestionSchema);

export default ScientificQuestion;
