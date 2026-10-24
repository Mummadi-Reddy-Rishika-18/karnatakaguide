import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hero from "@/assets/hero.jpg";
import { planTrip } from "@/lib/planner.functions";
import { PLACES } from "@/lib/places";
import { affordableDays, leftover } from "@/lib/budget";
import { TripMap, type Stop } from "@/components/TripMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yatra Karnataka — AI Travel Planner" },
      { name: "description", content: "Personalised Karnataka itineraries by interest, time, budget and travel style." },
      { property: "og:title", content: "Yatra Karnataka — AI Travel Planner" },
      { property: "og:description", content: "Plan your Karnataka trip in seconds with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const INTERESTS = ["Heritage", "Temples", "Nature", "Wildlife", "Beaches", "Hill stations", "Food", "Coffee estates", "Adventure", "Shopping"];
const BUDGETS = ["Budget (under ₹2k/day)", "Mid-range (₹2k–6k/day)", "Luxury (₹6k+/day)"];
const STYLES = ["Relaxed", "Balanced", "Packed", "Family-friendly", "Solo backpacker"];
const TRANSPORTS = ["Train", "Bus", "Road (self-drive / taxi)"];

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary"}`;

function Index() {
  const [days, setDays] = useState(3);
  const [start, setStart] = useState("Bengaluru");
  const [end, setEnd] = useState("Mysuru");
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [style, setStyle] = useState(STYLES[1]);
  const [interests, setInterests] = useState<string[]>(["Heritage", "Food"]);
  const [plan, setPlan] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (i: string) =>
    setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan("");
    setStops([]);
    const r = await planTrip({ data: { days, start, end, budget, style, interests } }).catch(() => ({
      plan: "",
      stops: [] as Stop[],
      error: "Could not reach the planner. Please try again.",
    }));
    setLoading(false);
    if (r.error) setError(r.error);
    else {
      setPlan(r.plan);
      setStops(r.stops);
      setTimeout(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={hero} alt="Hampi ruins at sunset" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-12">
          <p className="font-display text-2xl text-primary">ಯಾತ್ರೆ</p>
          <h1 className="font-display text-5xl font-bold text-foreground md:text-7xl">Yatra Karnataka</h1>
          <p className="mt-3 max-w-xl text-lg text-foreground/80">
            Your personal AI guide to Karnataka — tell us what you love, we'll plan every day.
          </p>
          <Link to="/guide" className="mt-4 inline-block w-fit rounded-full border border-primary bg-background/70 px-5 py-2 text-sm font-semibold text-primary hover:bg-background">
            Explore the Karnataka travel guide →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <form onSubmit={submit} className="-mt-4 space-y-8 rounded-2xl border border-border bg-card p-6 shadow-xl md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <PlaceSelect label="Starting place" value={start} onChange={setStart} />
            <PlaceSelect label="Ending place" value={end} onChange={setEnd} />
            <label className="block">
              <span className="text-sm font-semibold text-muted-foreground">Days: <b className="text-foreground">{days}</b></span>
              <input type="range" min={1} max={10} value={days} onChange={(e) => setDays(+e.target.value)}
                className="mt-5 w-full accent-primary" />
            </label>
          </div>
          <Group label="Interests">
            {INTERESTS.map((i) => (
              <button type="button" key={i} onClick={() => toggle(i)} className={chip(interests.includes(i))}>{i}</button>
            ))}
          </Group>
          <Group label="Budget">
            {BUDGETS.map((b) => (
              <button type="button" key={b} onClick={() => setBudget(b)} className={chip(budget === b)}>{b}</button>
            ))}
          </Group>
          <Group label="Travel style">
            {STYLES.map((s) => (
              <button type="button" key={s} onClick={() => setStyle(s)} className={chip(style === s)}>{s}</button>
            ))}
          </Group>
          <button disabled={loading}
            className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "Planning your journey…" : "Plan my trip"}
          </button>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-destructive">{error}</p>}
        </form>

        <BudgetCalc onUse={setDays} />

        {stops.length > 0 && <TripMap stops={stops} />}

        {plan && (
          <article id="plan" className="plan mt-12 rounded-2xl border border-border bg-card p-6 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="!m-0 font-display text-3xl">Your itinerary</h2>
              <button onClick={() => window.print()} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Print</button>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
          </article>
        )}
      </section>
      <footer className="pb-8 text-center text-sm text-muted-foreground">Made for Kannada Digital Innovation Hackathon 2026 · ನಮ್ಮ ಕರ್ನಾಟಕ</footer>
    </main>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PlaceSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring">
        {PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </label>
  );
}

function BudgetCalc({ onUse }: { onUse: (d: number) => void }) {
  const [total, setTotal] = useState(15000);
  const [perDay, setPerDay] = useState(3000);
  const d = affordableDays(total, perDay);
  const field = "mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring";
  return (
    <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-10">
      <h2 className="font-display text-2xl">Budget calculator</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter your total budget and daily spend to see how many days you can afford.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3 md:items-end">
        <label className="block"><span className="text-sm font-semibold text-muted-foreground">Total budget (₹)</span>
          <input type="number" min={0} value={total} onChange={(e) => setTotal(+e.target.value)} className={field} /></label>
        <label className="block"><span className="text-sm font-semibold text-muted-foreground">Spend per day (₹)</span>
          <input type="number" min={0} value={perDay} onChange={(e) => setPerDay(+e.target.value)} className={field} /></label>
        <div className="rounded-xl bg-muted p-4">
          <p className="font-display text-4xl text-primary">{d} {d === 1 ? "day" : "days"}</p>
          <p className="text-sm text-muted-foreground">₹{leftover(total, perDay).toLocaleString("en-IN")} left over</p>
        </div>
      </div>
      {d > 0 && (
        <button type="button" onClick={() => { onUse(Math.min(10, d)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-muted">
          Use {Math.min(10, d)} days in my plan
        </button>
      )}
    </section>
  );
}
