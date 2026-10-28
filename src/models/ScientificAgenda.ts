
import mongoose, { Schema, type Model } from "mongoose";

export interface AgendaTalk {
  startTime: string;
  endTime: string;
  title: string;
  speakerName: string;
  speakerTitle: string;
  institution: string;
}

export interface AgendaSession {
  startTime: string;
  endTime: string;
  title: string;
  chairpersons: string[];
  panelists: string[];
  judges: string[];
  talks: AgendaTalk[];
}

export interface AgendaHall {
  name: string;
  sessions: AgendaSession[];
}

export interface AgendaDay {
  label: string;
  date: string;
  halls: AgendaHall[];
}

export interface IScientificAgenda {
  eventId: string;
  createdBy: string;
  days: AgendaDay[];
  createdAt: Date;
  updatedAt: Date;
}

const ScientificAgendaSchema = new Schema<IScientificAgenda>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    days: {
      type: Schema.Types.Mixed,
      default: [],
      required: true,
    },
  },
  { timestamps: true },
);

const ScientificAgenda: Model<IScientificAgenda> =
  (mongoose.models.ScientificAgenda as Model<IScientificAgenda>) ||
  mongoose.model<IScientificAgenda>(
    "ScientificAgenda",
    ScientificAgendaSchema,
  );

export default ScientificAgenda;
