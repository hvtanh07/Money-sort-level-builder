/**
 * Mulberry32 Deterministic Pseudo-Random Number Generator (PRNG)
 * 32-bit state generator for 100% reproducible level layouts and deal sequences.
 */

export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = (seed | 0) || 12345;
  }

  /**
   * Generates a pseudo-random 32-bit integer.
   */
  public nextInt32(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /**
   * Generates a floating point number in [0, 1).
   */
  public nextFloat(): number {
    return this.nextInt32() / 4294967296;
  }

  /**
   * Generates an integer in range [min, max] inclusive.
   */
  public nextInt(min: number, max: number): number {
    if (min >= max) return min;
    const range = max - min + 1;
    return min + Math.floor(this.nextFloat() * range);
  }

  /**
   * Shuffles an array in place deterministically using Fisher-Yates.
   */
  public shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Selects a random element from an array.
   */
  public choice<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot pick from empty array');
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Clones PRNG with current internal state.
   */
  public clone(): PRNG {
    const clonePrng = new PRNG(1);
    clonePrng.state = this.state;
    return clonePrng;
  }
}
