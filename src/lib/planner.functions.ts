import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  days: z.number().int().min(1).max(10),
  budget: z.string().max(40),
  interests: z.array(z.string().max(40)).max(10),
  style: z.string().max(40),
  start: z.string().max(60),
  end: z.string().max(60),
});

export const planTrip = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { generatePlan } = await import("./planner.server");
    try {
      return { ...(await generatePlan(data)), error: null as string | null };
    } catch (e) {
      return { plan: "", stops: [], error: e instanceof Error ? e.message : "Something went wrong." };
    }
  });
