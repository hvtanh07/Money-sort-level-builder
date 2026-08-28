/**
 * Deal Engine
 * Handles dealing new coins to the board during gameplay.
 */

import { LevelConfig, SlotState, CoinData, MAX_SLOT_CAPACITY } from './types';
import { PRNG } from './prng';
import { createUniqueCoin } from './levelGenerator';

export interface DealResult {
  updatedSlots: SlotState[];
  dealtCoinsCount: number;
  highestLevelUsed: number;
  dealBreakdown: { level: number; count: number }[];
  isBoardFull: boolean;
}

/**
 * Finds the highest coin level currently on the board across unlocked slots.
 */
export function getHighestLevelOnBoard(slots: SlotState[], defaultColorCount: number): number {
  let highest = 1;
  let foundAny = false;

  for (const slot of slots) {
    if (slot.isLocked) continue;
    for (const coin of slot.coins) {
      foundAny = true;
      if (coin.level > highest) {
        highest = coin.level;
      }
    }
  }

  return foundAny ? highest : Math.max(1, defaultColorCount);
}

/**
 * Executes a Deal action.
 * 1. Checks highest coin level in the level -> Spawns at least 2 coins of that level.
 * 2. Spawns remaining coins (up to dealChipCount) randomly between 1 and max level.
 * 3. Distributes spawned coins to random unlocked slots with remaining capacity.
 */
export function executeDeal(
  slots: SlotState[],
  config: LevelConfig,
  dealSeed?: number
): DealResult {
  const prng = new PRNG(dealSeed ?? Math.floor(Math.random() * 1000000));
  const deepClonedSlots: SlotState[] = slots.map(slot => ({
    ...slot,
    coins: slot.coins.map(c => ({ ...c, isNew: false, isMerging: false }))
  }));

  const unlockedSlots = deepClonedSlots.filter(s => !s.isLocked);
  if (unlockedSlots.length === 0) {
    return {
      updatedSlots: deepClonedSlots,
      dealtCoinsCount: 0,
      highestLevelUsed: 1,
      dealBreakdown: [],
      isBoardFull: true
    };
  }

  // 1. Find current highest level
  const highestLevel = getHighestLevelOnBoard(deepClonedSlots, config.colorCount);

  // 2. Generate deal coins
  const dealCoinsToSpawn: number[] = [];

  // Guarantee at least 2 coins of highest level
  const guaranteedCount = Math.min(2, config.dealChipCount);
  for (let i = 0; i < guaranteedCount; i++) {
    dealCoinsToSpawn.push(highestLevel);
  }

  // Remainder coins
  const remainingCount = Math.max(0, config.dealChipCount - guaranteedCount);
  const maxSpectrum = Math.min(10, Math.max(config.colorCount, highestLevel));

  for (let i = 0; i < remainingCount; i++) {
    const lvl = prng.nextInt(1, maxSpectrum);
    dealCoinsToSpawn.push(lvl);
  }

  // Shuffle the deal batch
  const shuffledDeal = prng.shuffle(dealCoinsToSpawn);

  // 3. Distribute to random slots with available capacity (< 10)
  let dealtCount = 0;
  const breakdownMap = new Map<number, number>();

  for (const coinLevel of shuffledDeal) {
    // Find unlocked slots with space
    const availableSlots = unlockedSlots.filter(s => s.coins.length < MAX_SLOT_CAPACITY);
    if (availableSlots.length === 0) {
      break; // Board full
    }

    // Pick a random available slot
    const targetSlot = prng.choice(availableSlots);
    const newCoin: CoinData = {
      ...createUniqueCoin(coinLevel),
      isNew: true
    };

    targetSlot.coins.push(newCoin);
    dealtCount++;
    breakdownMap.set(coinLevel, (breakdownMap.get(coinLevel) || 0) + 1);
  }

  const breakdown = Array.from(breakdownMap.entries()).map(([level, count]) => ({
    level,
    count
  }));

  const totalCapacity = unlockedSlots.length * MAX_SLOT_CAPACITY;
  const totalCurrentCoins = unlockedSlots.reduce((acc, s) => acc + s.coins.length, 0);

  return {
    updatedSlots: deepClonedSlots,
    dealtCoinsCount: dealtCount,
    highestLevelUsed: highestLevel,
    dealBreakdown: breakdown,
    isBoardFull: totalCurrentCoins >= totalCapacity
  };
}
