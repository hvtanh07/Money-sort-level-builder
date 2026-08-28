/**
 * Deal Engine
 * Handles dealing new coins to the board during gameplay.
 * 
 * Logic:
 * 1. Targeted Completion: Checks board for any coin level with total count > 5 (and < 10).
 *    If found, selects 1 candidate level and spawns the exact needed coins so its total count equals 10.
 *    (This targeted logic ignores maxDealChipLevel).
 * 2. Remainder Coins: The rest of the deal batch (up to dealChipCount) spawns randomly from [1, maxDealChipLevel].
 * 3. Distribution: Distributes all spawned coins randomly across unlocked slots with available capacity (< 10).
 */

import { LevelConfig, SlotState, CoinData, MAX_SLOT_CAPACITY } from './types';
import { PRNG } from './prng';
import { createUniqueCoin } from './levelGenerator';

export interface DealResult {
  updatedSlots: SlotState[];
  dealtCoinsCount: number;
  maxLevelUsed: number;
  dealBreakdown: { level: number; count: number }[];
  targetedLevelUsed?: { level: number; addedCount: number };
  isBoardFull: boolean;
}

/**
 * Executes a Deal action.
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
      maxLevelUsed: 1,
      dealBreakdown: [],
      isBoardFull: true
    };
  }

  // 1. Count coins of each level across all unlocked slots
  const countByLevel = new Map<number, number>();
  for (const slot of unlockedSlots) {
    for (const coin of slot.coins) {
      countByLevel.set(coin.level, (countByLevel.get(coin.level) || 0) + 1);
    }
  }

  // Find candidate levels where total count on board > 5 and < 10 (or has unmerged stack > 5)
  const candidateLevels: { level: number; needed: number }[] = [];
  for (const [lvl, count] of countByLevel.entries()) {
    const unmergedCount = count % 10;
    if (count > 5 && count < 10) {
      candidateLevels.push({ level: lvl, needed: 10 - count });
    } else if (unmergedCount > 5) {
      candidateLevels.push({ level: lvl, needed: 10 - unmergedCount });
    }
  }

  const dealCoinsToSpawn: number[] = [];
  let targetedInfo: { level: number; addedCount: number } | undefined = undefined;

  // If candidate levels exist, select 1 and generate exact chips to reach 10 (ignoring maxDealChipLevel)
  if (candidateLevels.length > 0) {
    const chosenCandidate = prng.choice(candidateLevels);
    for (let i = 0; i < chosenCandidate.needed; i++) {
      dealCoinsToSpawn.push(chosenCandidate.level);
    }
    targetedInfo = {
      level: chosenCandidate.level,
      addedCount: chosenCandidate.needed
    };
  }

  // 2. Generate remainder coins from [1, maxDealChipLevel]
  const activeLevels = Object.keys(config.chipsPerLevel || {}).map(Number).filter(n => n >= 1);
  const highestActive = activeLevels.length > 0 ? Math.max(...activeLevels) : 5;
  const maxAllowedLevel = Math.max(1, Math.min(10, config.maxDealChipLevel || highestActive));
  const remainingDealCount = Math.max(0, config.dealChipCount - dealCoinsToSpawn.length);

  for (let i = 0; i < remainingDealCount; i++) {
    const lvl = prng.nextInt(1, maxAllowedLevel);
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
    maxLevelUsed: maxAllowedLevel,
    dealBreakdown: breakdown,
    targetedLevelUsed: targetedInfo,
    isBoardFull: totalCurrentCoins >= totalCapacity
  };
}
