import { z } from "zod";

export const createDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    type: z
      .enum(["light", "thermostat", "meter", "camera", "other"])
      .default("other"),
    status: z
      .enum(["active", "inactive", "faulty"])
      .optional()
      .default("inactive"),
  }),
});

export const listDevicesSchema = z.object({
  query: z.object({
    type: z
      .enum(["light", "thermostat", "meter", "camera", "other"])
      .optional(),
    status: z.enum(["active", "inactive", "faulty"]).optional(),
  }),
});

export const updateDeviceSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      type: z
        .enum(["light", "thermostat", "meter", "camera", "other"])
        .optional(),
      status: z.enum(["active", "inactive", "faulty"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "No fields to update",
    }),
});

export const deviceIdParamSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
});

export const heartbeatSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    status: z.enum(["active", "inactive", "faulty"]).optional(),
  }),
});
