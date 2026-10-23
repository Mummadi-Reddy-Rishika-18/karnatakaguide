import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type PlanInput = {
  days: number;
  budget: string;
  interests: string[];
  style: string;
  start: string;
};

export async function generatePlan(input: PlanInput): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");
  let runId: string | undefined;
  const openai = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const h = new Headers(init?.headers);
      if (runId) h.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(url, { ...init, headers: h });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      if (!res.ok) {
        const t = await res.clone().text();
        if (res.status === 429) throw new Error("Too many requests, please try again shortly.");
        if (res.status === 402) throw new Error("AI credits are used up for this workspace.");
        throw new Error(t.slice(0, 200) || `AI error ${res.status}`);
      }
      return res;
    },
  });

  const result = streamText({
    model: openai.responses("openai/gpt-6-astra"),
    system:
      "You are an expert Karnataka travel planner. Write in Markdown. Produce a day-by-day itinerary for Karnataka only. For each day use a '## Day N — Title' heading, then Morning / Afternoon / Evening bullets with specific real places, travel times between them, a local food to try, and an estimated cost in INR. Include one useful Kannada phrase per day (Kannada script, transliteration, meaning). End with '## Budget summary' (table) and '## Tips' (best season, transport, etiquette). Be realistic about distances.",
    prompt: `Trip: ${input.days} days starting from ${input.start || "Bengaluru"}. Budget: ${input.budget}. Interests: ${input.interests.join(", ") || "a mix"}. Travel style: ${input.style}.`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return await result.text;
}
