import { describe, it, expect } from "vitest";
import { affordableDays, leftover } from "@/lib/budget";

describe("budget calculator", () => {
  it("rounds down to whole affordable days", () => {
    expect(affordableDays(10000, 3000)).toBe(3);
    expect(leftover(10000, 3000)).toBe(1000);
  });
  it("returns 0 days for zero or missing per-day spend", () => {
    expect(affordableDays(10000, 0)).toBe(0);
  });
});
