import { Schema, model, Document, Types } from "mongoose";

export type DeviceStatus = "active" | "inactive" | "faulty";
export type DeviceType = "light" | "thermostat" | "meter" | "camera" | "other";

export interface IDevice extends Document {
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  last_active_at: Date | null;
  owner_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["light", "thermostat", "meter", "camera", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "faulty"],
      default: "inactive",
    },
    last_active_at: { type: Date, default: null },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Device = model<IDevice>("Device", deviceSchema);
