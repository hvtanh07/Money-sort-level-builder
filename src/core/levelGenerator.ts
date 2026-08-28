/**
 * Level Generator Engine
 * Generates reproducible initial board states according to LevelConfig.
 */

import { LevelConfig, SlotState, CoinData, TOTAL_SLOTS_COUNT, MAX_SLOT_CAPACITY } from './types';
import { PRNG } from './prng';

let globalCoinCounter = 1;

export function createUniqueCoin(level: number): CoinData {
  return {
    id: `c_${Date.now()}_${globalCoinCounter++}_${Math.random().toString(36).substring(2, 6)}`,
    level,
    isNew: false
  };
}

/**
 * Groups coins by level and shuffles the group order randomly.
 * Example: [5, 4, 5, 3, 3, 1, 2, 1] -> {1:[1,1], 2:[2], 3:[3,3], 4:[4], 5:[5,5]} -> [1,1,3,3,4,5,5,2]
 */
export function groupCoinsByLevelWithRandomOrder(coins: number[], prng: PRNG): number[] {
  if (coins.length <= 1) return [...coins];

  // Map frequency of each level
  const groupMap: Map<number, number[]> = new Map();
  for (const level of coins) {
    if (!groupMap.has(level)) {
      groupMap.set(level, []);
    }
    groupMap.get(level)!.push(level);
  }

  // Extract blocks
  const blocks: number[][] = Array.from(groupMap.values());

  // Deterministically shuffle block order
  const shuffledBlocks = prng.shuffle(blocks);

  // Flatten back into a contiguous stack
  return shuffledBlocks.flat();
}

/**
 * Generates the full initial board state for a given LevelConfig.
 */
export function generateLevelBoard(config: LevelConfig): SlotState[] {
  const prng = new PRNG(config.randomSeed);

  // Determine unlocked vs locked slots
  const slots: SlotState[] = [];
  const lockedIndices = new Set<number>(
    config.lockedSlotIndices ?? 
    Array.from({ length: TOTAL_SLOTS_COUNT - config.openedStackCount }, (_, i) => config.openedStackCount + i)
  );

  for (let i = 0; i < TOTAL_SLOTS_COUNT; i++) {
    const isLocked = lockedIndices.has(i);
    slots.push({
      index: i,
      isLocked,
      coins: [],
      lockCost: isLocked ? (i + 1) * 100 : undefined
    });
  }

  // If a custom layout is explicitly provided in config, use it
  if (config.customLayout && config.customLayout.length === TOTAL_SLOTS_COUNT) {
    for (let i = 0; i < TOTAL_SLOTS_COUNT; i++) {
      if (!slots[i].isLocked) {
        slots[i].coins = config.customLayout[i].map(lvl => createUniqueCoin(lvl));
      }
    }
    return slots;
  }

  const unlockedSlots = slots.filter(s => !s.isLocked);
  if (unlockedSlots.length === 0) return slots;

  // Generate coin level pool for initialChipCount
  // Levels available: 1 to colorCount (clamped between 1 and 10)
  const maxColorLevel = Math.max(1, Math.min(10, config.colorCount));
  const rawCoins: number[] = [];

  for (let i = 0; i < config.initialChipCount; i++) {
    const coinLevel = prng.nextInt(1, maxColorLevel);
    rawCoins.push(coinLevel);
  }

  // Distribute coins among unlocked slots
  // We can respect chipsPerStackRange if applicable, while guaranteeing max slot capacity = 10
  const slotCoinNumbers: number[][] = Array.from({ length: unlockedSlots.length }, () => []);

  // Strategy: randomly assign each coin to an unlocked slot that has space (< 10)
  const shuffledCoinPool = prng.shuffle(rawCoins);

  for (const coinLvl of shuffledCoinPool) {
    // Find unlocked slots with capacity < MAX_SLOT_CAPACITY
    const candidateSlots = slotCoinNumbers
      .map((coins, idx) => ({ coins, idx }))
      .filter(s => s.coins.length < MAX_SLOT_CAPACITY);

    if (candidateSlots.length === 0) break; // All slots full

    // Pick a candidate slot
    const chosen = prng.choice(candidateSlots);
    chosen.coins.push(coinLvl);
  }

  // Now for each unlocked slot, apply grouping by level with random order
  for (let i = 0; i < unlockedSlots.length; i++) {
    const rawList = slotCoinNumbers[i];
    const groupedList = groupCoinsByLevelWithRandomOrder(rawList, prng);
    unlockedSlots[i].coins = groupedList.map(lvl => createUniqueCoin(lvl));
  }

  return slots;
}
