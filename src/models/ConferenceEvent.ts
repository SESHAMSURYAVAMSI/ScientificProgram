
import mongoose, { Schema, type Model } from "mongoose";

export interface IConferenceEvent {
  name: string;
  slug: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  city: string;
  status: "draft" | "published";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConferenceEventSchema = new Schema<IConferenceEvent>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

const ConferenceEvent: Model<IConferenceEvent> =
  (mongoose.models.ConferenceEvent as Model<IConferenceEvent>) ||
  mongoose.model<IConferenceEvent>(
    "ConferenceEvent",
    ConferenceEventSchema,
  );

export default ConferenceEvent;
