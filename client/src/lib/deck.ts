type RandomSource = () => number;

const UINT32_RANGE = 0x1_0000_0000;

function cryptoIndex(upperBound: number): number | undefined {
  const crypto = globalThis.crypto;
  if (!crypto?.getRandomValues) return undefined;

  // Reject the incomplete tail so each index has exactly the same number of inputs.
  const limit = UINT32_RANGE - (UINT32_RANGE % upperBound);
  const sample = new Uint32Array(1);
  let value: number;

  do {
    crypto.getRandomValues(sample);
    value = sample[0];
  } while (value >= limit);

  return value % upperBound;
}

function randomIndex(upperBound: number, random?: RandomSource): number {
  if (!random) {
    const secureIndex = cryptoIndex(upperBound);
    if (secureIndex !== undefined) return secureIndex;
    return Math.floor(Math.random() * upperBound);
  }

  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError(
      "shuffleDeck random source must return a number from 0 (inclusive) to 1 (exclusive)."
    );
  }

  return Math.floor(value * upperBound);
}

/**
 * Returns a new, uniformly shuffled deck without changing the source array.
 * A supplied random source makes calling code and tests deterministic.
 */
export function shuffleDeck<T>(
  items: readonly T[],
  random?: RandomSource
): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

/** Adds an unselected card unless two cards are already chosen; selecting again removes it. */
export function togglePick(selected: number[], id: number): number[] {
  if (selected.includes(id))
    return selected.filter(selectedId => selectedId !== id);
  if (selected.length >= 2) return [...selected];
  return [...selected, id];
}
