import { Device, IDevice } from "@models/Device";
import { FilterQuery, Types } from "mongoose";

export async function createDevice(
  ownerId: string,
  data: Pick<IDevice, "name" | "type" | "status">
) {
  const device = await Device.create({
    ...data,
    owner_id: new Types.ObjectId(ownerId),
  });
  return device;
}

export async function listDevices(
  ownerId: string,
  filter: { type?: string; status?: string }
) {
  const q: FilterQuery<IDevice> = { owner_id: new Types.ObjectId(ownerId) };
  if (filter.type) q.type = filter.type as any;
  if (filter.status) q.status = filter.status as any;
  return Device.find(q).sort({ createdAt: -1 });
}

export async function updateDevice(
  ownerId: string,
  id: string,
  patch: Partial<IDevice>
) {
  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: ownerId },
    patch,
    { new: true }
  );
  if (!device)
    throw Object.assign(new Error("Device not found"), { status: 404 });
  return device;
}

export async function deleteDevice(ownerId: string, id: string) {
  const res = await Device.findOneAndDelete({ _id: id, owner_id: ownerId });
  if (!res) throw Object.assign(new Error("Device not found"), { status: 404 });
  return { success: true };
}

export async function heartbeat(ownerId: string, id: string, status?: string) {
  const update: any = { last_active_at: new Date() };
  if (status) update.status = status;
  const device = await Device.findOneAndUpdate(
    { _id: id, owner_id: ownerId },
    update,
    { new: true }
  );
  if (!device)
    throw Object.assign(new Error("Device not found"), { status: 404 });
  return device;
}
