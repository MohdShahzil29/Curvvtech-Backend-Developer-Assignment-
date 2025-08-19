import { Schema, model, Document, Types } from "mongoose";

export interface ILog extends Document {
  device_id: Types.ObjectId;
  event: string; // e.g., 'units_consumed'
  value?: number; // optional numeric value
  timestamp: Date; // when event happened
  createdAt: Date;
  updatedAt: Date;
}

const logSchema = new Schema<ILog>(
  {
    device_id: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    event: { type: String, required: true },
    value: { type: Number, required: false },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

export const Log = model<ILog>("Log", logSchema);
