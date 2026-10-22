import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "@shared/cards";
import { shuffleDeck, togglePick } from "./deck";

function mulberry32(seed: number): () => number {
  return () => {
    let state = (seed += 0x6d2b79f5);
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4_294_967_296;
  };
}

describe("shuffleDeck", () => {
  it("keeps the 36-card catalogue unique and returns a changed, non-mutating permutation", () => {
    const source = CARD_CATALOG.map(card => card.id);
    const before = [...source];
    const shuffled = shuffleDeck(source, () => 0);

    expect(source).toEqual(before);
    expect(shuffled).not.toBe(source);
    expect(shuffled).not.toEqual(source);
    expect(shuffled).toHaveLength(36);
    expect(new Set(shuffled).size).toBe(36);
    expect([...shuffled].sort((left, right) => left - right)).toEqual(source);
  });

  it("produces valid permutations over repeated deterministic shuffles", () => {
    const source = CARD_CATALOG.map(card => card.id);
    const arrangements = new Set<string>();

    for (let seed = 1; seed <= 24; seed += 1) {
      const shuffled = shuffleDeck(source, mulberry32(seed));
      expect([...shuffled].sort((left, right) => left - right)).toEqual(source);
      arrangements.add(shuffled.join(","));
    }

    expect(arrangements.size).toBeGreaterThan(1);
    expect(source).toEqual(CARD_CATALOG.map(card => card.id));
  });
});

describe("togglePick", () => {
  it("adds at most two distinct cards and cancels a selected card", () => {
    const first = togglePick([], 8);
    const second = togglePick(first, 19);
    const capped = togglePick(second, 27);

    expect(first).toEqual([8]);
    expect(second).toEqual([8, 19]);
    expect(capped).toEqual([8, 19]);
    expect(capped).not.toBe(second);
    expect(togglePick(second, 8)).toEqual([19]);
    expect(second).toEqual([8, 19]);
  });
});
