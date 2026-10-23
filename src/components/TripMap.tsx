import { useEffect, useRef, useState } from "react";

export type Stop = { day: number; name: string; lat: number; lng: number };

const COLORS = ["#c2410c", "#0f766e", "#7c2d12", "#1d4ed8", "#a16207", "#be123c", "#15803d", "#6d28d9", "#0e7490", "#9a3412"];

declare global {
  interface Window {
    google?: any;
    __initTripMap?: () => void;
  }
}

let loader: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__initTripMap = () => resolve();
    const env = import.meta.env as Record<string, string | undefined>;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]}&loading=async&callback=__initTripMap&channel=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"]}`;
    s.async = true;
    s.onerror = () => reject(new Error("Map failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}

export function TripMap({ stops }: { stops: Stop[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");
  const days = [...new Set(stops.map((s) => s.day))].sort((a, b) => a - b);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = window.google.maps;
        const map = new g.Map(ref.current, { clickableIcons: false, mapTypeControl: false, streetViewControl: false });
        const bounds = new g.LatLngBounds();
        const info = new g.InfoWindow();
        stops.forEach((s, i) => {
          const pos = { lat: s.lat, lng: s.lng };
          bounds.extend(pos);
          const m = new g.Marker({
            position: pos, map, title: s.name, label: { text: String(i + 1), color: "#fff", fontWeight: "700" },
            icon: { path: g.SymbolPath.CIRCLE, scale: 13, fillColor: COLORS[(s.day - 1) % COLORS.length], fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
          });
          m.addListener("click", () => { info.setContent(`<b>Day ${s.day}</b><br/>${s.name.replace(/</g, "&lt;")}`); info.open({ map, anchor: m }); });
        });
        new g.Polyline({ path: stops.map((s) => ({ lat: s.lat, lng: s.lng })), map, strokeColor: "#c2410c", strokeOpacity: 0.7, strokeWeight: 3 });
        if (stops.length === 1) { map.setCenter(bounds.getCenter()); map.setZoom(11); } else map.fitBounds(bounds, 40);
      })
      .catch((e) => setErr(e.message));
    return () => { cancelled = true; };
  }, [stops]);

  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <h2 className="font-display text-2xl">Route map</h2>
        {days.map((d) => (
          <span key={d} className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS[(d - 1) % COLORS.length] }} /> Day {d}
          </span>
        ))}
      </div>
      {err ? <p className="p-4 text-destructive">{err}</p> : <div ref={ref} className="h-[420px] w-full" />}
    </div>
  );
}
