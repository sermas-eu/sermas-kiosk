import { describe, expect, it } from "vitest";
import { MissedTurns } from "./missed-turns.ts";

describe("MissedTurns", () => {
  it("reacts at the second miss in a row, then not again until heard", () => {
    const m = new MissedTurns(2);
    expect([m.miss(), m.miss(), m.miss(), m.miss(), m.miss()]).toEqual([
      false,
      true,
      false,
      false,
      false,
    ]);
    m.heard();
    expect([m.miss(), m.miss()]).toEqual([false, true]);
  });

  it("a turn heard in between starts the count again", () => {
    const m = new MissedTurns(2);
    m.miss();
    m.heard();
    expect(m.miss()).toBe(false);
  });
});
