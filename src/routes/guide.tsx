import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Karnataka Travel Guide — Yatra Karnataka" },
      { name: "description", content: "Top cities, best times to visit and must-see spots across Karnataka." },
      { property: "og:title", content: "Karnataka Travel Guide — Yatra Karnataka" },
      { property: "og:description", content: "Top cities, seasons and must-see spots in Karnataka." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/guide" }],
  }),
  component: Guide,
});

const CITIES = [
  { name: "Bengaluru", kn: "ಬೆಂಗಳೂರು", best: "Oct – Feb", about: "Garden city and tech capital with parks, palaces and a buzzing food scene.", spots: ["Lalbagh Botanical Garden", "Bangalore Palace", "Cubbon Park", "VV Puram Food Street"] },
  { name: "Mysuru", kn: "ಮೈಸೂರು", best: "Sep – Feb (Dasara in Oct)", about: "Royal city of silk, sandalwood and the famous Dasara festival.", spots: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens", "Devaraja Market"] },
  { name: "Hampi", kn: "ಹಂಪಿ", best: "Oct – Feb", about: "UNESCO ruins of the Vijayanagara empire among giant boulders.", spots: ["Virupaksha Temple", "Vittala Temple & Stone Chariot", "Matanga Hill sunrise", "Hemakuta Hill"] },
  { name: "Coorg (Madikeri)", kn: "ಕೊಡಗು", best: "Oct – Mar; monsoon for greenery", about: "Misty hills and coffee estates — the Scotland of India.", spots: ["Abbey Falls", "Raja's Seat", "Dubare Elephant Camp", "Namdroling Monastery"] },
  { name: "Chikkamagaluru", kn: "ಚಿಕ್ಕಮಗಳೂರು", best: "Sep – Mar", about: "Birthplace of Indian coffee with Karnataka's highest peak.", spots: ["Mullayanagiri", "Baba Budangiri", "Hebbe Falls", "Coffee estate stays"] },
  { name: "Udupi & Malpe", kn: "ಉಡುಪಿ", best: "Oct – Mar", about: "Temple town, coastal cuisine and island beaches.", spots: ["Sri Krishna Temple", "St. Mary's Island", "Malpe Beach", "Kaup Lighthouse"] },
  { name: "Gokarna", kn: "ಗೋಕರ್ಣ", best: "Oct – Mar", about: "Laid-back beaches and an ancient pilgrimage town.", spots: ["Om Beach", "Kudle Beach", "Mahabaleshwar Temple", "Half Moon Beach trek"] },
  { name: "Badami, Aihole & Pattadakal", kn: "ಬಾದಾಮಿ", best: "Oct – Feb", about: "Cradle of Chalukyan temple architecture.", spots: ["Badami Cave Temples", "Agastya Lake", "Pattadakal temple group", "Durga Temple, Aihole"] },
  { name: "Belur & Halebidu", kn: "ಬೇಲೂರು", best: "Oct – Mar", about: "Exquisite Hoysala carvings in soapstone.", spots: ["Chennakeshava Temple", "Hoysaleswara Temple", "Shravanabelagola (nearby)"] },
];

const SEASONS = [
  { name: "Winter", months: "Oct – Feb", note: "Pleasant everywhere. Best for heritage sites, beaches and festivals like Dasara and Hampi Utsav." },
  { name: "Summer", months: "Mar – May", note: "Hot in the north. Head to the hills — Coorg, Chikkamagaluru, Kudremukh." },
  { name: "Monsoon", months: "Jun – Sep", note: "Waterfalls at their peak (Jog Falls). Lush Western Ghats; some treks and beaches close." },
];

function Guide() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">← Back to planner</Link>
        <p className="mt-6 font-display text-2xl text-primary">ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಮಾರ್ಗದರ್ಶಿ</p>
        <h1 className="font-display text-5xl font-bold md:text-6xl">Karnataka Travel Guide</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Top cities, the best seasons to go, and the spots you shouldn't miss.</p>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="font-display text-3xl">Best times to visit</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SEASONS.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-muted-foreground">{s.months}</p>
              <h3 className="font-display text-2xl text-primary">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="font-display text-3xl">Top destinations & must-see spots</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {CITIES.map((c) => (
            <article key={c.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">{c.name}</h3>
                <span className="text-primary">{c.kn}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">Best time: {c.best}</p>
              <p className="mt-3 text-sm leading-relaxed">{c.about}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.spots.map((s) => (
                  <li key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/" className="inline-block rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground hover:opacity-90">Plan my Karnataka trip</Link>
        </div>
      </section>
    </main>
  );
}
