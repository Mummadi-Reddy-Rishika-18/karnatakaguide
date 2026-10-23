import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type PlanInput = {
  days: number;
  budget: string;
  interests: string[];
  style: string;
  start: string;
  end: string;
};

export async function generatePlan(input: PlanInput): Promise<{ plan: string; stops: { day: number; name: string; lat: number; lng: number }[] }> {
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
      "You are an expert Karnataka travel planner. Write in Markdown. Produce a day-by-day itinerary for Karnataka only. For each day use a '## Day N — Title' heading, then Morning / Afternoon / Evening bullets with specific real places, travel times between them, a local food to try, and an estimated cost in INR. At the end of every day add a '### Local tips' subsection with exactly these four bullets: '**Kannada phrases:**' two or three useful phrases (Kannada script, transliteration, meaning); '**Street food:**' specific local dishes and where to find them; '**Temples:**' nearby temples worth visiting with a one-line note; '**Hidden gems:**' one or two lesser-known spots near that day's route. End with '## Budget summary' (table) and '## Tips' (best season, transport, etiquette). Be realistic about distances. After the Markdown, output a line containing only STOPS_JSON followed by a JSON array of every visited stop in visiting order: [{\"day\":1,\"name\":\"Mysore Palace\",\"lat\":12.3052,\"lng\":76.6552}]. Use accurate coordinates.",
    prompt: `Trip: ${input.days} days starting from ${input.start || "Bengaluru"} and ending at ${input.end || input.start || "Bengaluru"}. Route the trip logically from start to end. Budget: ${input.budget}. Interests: ${input.interests.join(", ") || "a mix"}. Travel style: ${input.style}.`,
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
  const text = await result.text;
  const idx = text.lastIndexOf("STOPS_JSON");
  if (idx < 0) return { plan: text, stops: [] };
  let stops: { day: number; name: string; lat: number; lng: number }[] = [];
  try {
    const raw = text.slice(idx + 10).replace(/```(json)?/g, "").trim();
    const arr = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    stops = (Array.isArray(arr) ? arr : [])
      .filter((s) => typeof s?.lat === "number" && typeof s?.lng === "number" && s.lat > 11 && s.lat < 19 && s.lng > 73 && s.lng < 79)
      .map((s) => ({ day: Number(s.day) || 1, name: String(s.name ?? "").slice(0, 80), lat: s.lat, lng: s.lng }));
  } catch { /* map optional */ }
  return { plan: text.slice(0, idx).replace(/```\s*$/, "").trim(), stops };
}
