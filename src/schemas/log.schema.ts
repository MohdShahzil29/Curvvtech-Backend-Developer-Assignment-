import { z } from "zod";

export const createLogSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    event: z.string().min(1),
    value: z.number().optional(),
    timestamp: z.string().datetime().optional(),
  }),
});

export const getLogsSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const usageSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  query: z.object({
    range: z.enum(["24h", "7d"]).default("24h"),
  }),
});
