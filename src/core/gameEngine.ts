/**
 * Game Engine
 * Core mechanics: selection, movement, 10-coin stack merging, score calculation, cascade merges, undo.
 */

import {
  GameState,
  SlotState,
  CoinData,
  LevelConfig,
  MergeEvent,
  MAX_SLOT_CAPACITY,
  DEFAULT_MERGE_SCORES
} from './types';
import { generateLevelBoard, createUniqueCoin } from './levelGenerator';

export interface SelectedGroup {
  slotIndex: number;
  level: number;
  count: number;
  coins: CoinData[];
}

/**
 * Identifies the top contiguous group of coins of the same level in a slot.
 */
export function getTopContiguousGroup(slot: SlotState): SelectedGroup | null {
  if (slot.isLocked || slot.coins.length === 0) return null;

  const topCoin = slot.coins[slot.coins.length - 1];
  const targetLevel = topCoin.level;
  let count = 0;

  for (let i = slot.coins.length - 1; i >= 0; i--) {
    if (slot.coins[i].level === targetLevel) {
      count++;
    } else {
      break;
    }
  }

  const selectedCoins = slot.coins.slice(slot.coins.length - count);

  return {
    slotIndex: slot.index,
    level: targetLevel,
    count,
    coins: selectedCoins
  };
}

/**
 * Checks if a move from source to target is valid.
 */
export function canMove(
  sourceSlot: SlotState,
  targetSlot: SlotState
): { valid: boolean; reason?: string; transferableCount?: number } {
  if (sourceSlot.index === targetSlot.index) {
    return { valid: false, reason: 'Same slot' };
  }

  if (sourceSlot.isLocked || targetSlot.isLocked) {
    return { valid: false, reason: 'Slot is locked' };
  }

  if (sourceSlot.coins.length === 0) {
    return { valid: false, reason: 'Source slot is empty' };
  }

  if (targetSlot.coins.length >= MAX_SLOT_CAPACITY) {
    return { valid: false, reason: 'Target slot is full' };
  }

  const group = getTopContiguousGroup(sourceSlot);
  if (!group || group.count === 0) {
    return { valid: false, reason: 'No coins to move' };
  }

  // If target is empty, can move
  if (targetSlot.coins.length === 0) {
    const spaceAvailable = MAX_SLOT_CAPACITY - targetSlot.coins.length;
    const transferable = Math.min(group.count, spaceAvailable);
    return { valid: true, transferableCount: transferable };
  }

  // If target is not empty, top coin level must match
  const targetTopCoin = targetSlot.coins[targetSlot.coins.length - 1];
  if (targetTopCoin.level !== group.level) {
    return { valid: false, reason: 'Mismatched coin level' };
  }

  const spaceAvailable = MAX_SLOT_CAPACITY - targetSlot.coins.length;
  const transferable = Math.min(group.count, spaceAvailable);

  if (transferable <= 0) {
    return { valid: false, reason: 'Target slot has no remaining capacity' };
  }

  return { valid: true, transferableCount: transferable };
}

/**
 * Evaluates a single slot for 10-count same-level stack merge.
 * If 10 coins of level L are in the slot -> merge into 2 coins of (L + 1).
 * Awards points and returns any merge events (handles cascades).
 */
export function processSlotMerges(
  slot: SlotState
): { slot: SlotState; mergeEvents: MergeEvent[]; totalPoints: number } {
  let modifiedSlot: SlotState = {
    ...slot,
    coins: [...slot.coins]
  };

  const mergeEvents: MergeEvent[] = [];
  let totalPoints = 0;
  let hasMerged = true;

  while (hasMerged) {
    hasMerged = false;

    // Check if slot has exactly 10 coins of the same level
    if (modifiedSlot.coins.length === MAX_SLOT_CAPACITY) {
      const firstLevel = modifiedSlot.coins[0].level;
      const allSame = modifiedSlot.coins.every(c => c.level === firstLevel);

      if (allSame) {
        // Calculate points based on standard game merge scores
        const pts = DEFAULT_MERGE_SCORES[firstLevel.toString()] ?? (firstLevel * 15);
        totalPoints += pts;

        const nextLevel = Math.min(10, firstLevel + 1);

        // Replace 10 coins with 2 coins of level + 1
        const newCoin1 = { ...createUniqueCoin(nextLevel), isMerging: true };
        const newCoin2 = { ...createUniqueCoin(nextLevel), isMerging: true };

        modifiedSlot.coins = [newCoin1, newCoin2];

        mergeEvents.push({
          slotIndex: slot.index,
          fromLevel: firstLevel,
          toLevel: nextLevel,
          gainedScore: pts,
          timestamp: Date.now()
        });

        // Set hasMerged = true to check if cascade merge happens
        hasMerged = true;
      }
    }
  }

  return {
    slot: modifiedSlot,
    mergeEvents,
    totalPoints
  };
}

/**
 * Evaluates all slots on the board for merges and cascades.
 */
export function processBoardMerges(
  slots: SlotState[]
): { updatedSlots: SlotState[]; mergeEvents: MergeEvent[]; pointsEarned: number } {
  let updatedSlots = slots.map(s => ({ ...s, coins: [...s.coins] }));
  const allMergeEvents: MergeEvent[] = [];
  let totalPoints = 0;

  for (let i = 0; i < updatedSlots.length; i++) {
    if (!updatedSlots[i].isLocked) {
      const result = processSlotMerges(updatedSlots[i]);
      if (result.mergeEvents.length > 0) {
        updatedSlots[i] = result.slot;
        allMergeEvents.push(...result.mergeEvents);
        totalPoints += result.totalPoints;
      }
    }
  }

  return {
    updatedSlots,
    mergeEvents: allMergeEvents,
    pointsEarned: totalPoints
  };
}

/**
 * Checks if there are any valid moves available on the current board.
 */
export function findAvailableMoves(slots: SlotState[]): { from: number; to: number; count: number }[] {
  const moves: { from: number; to: number; count: number }[] = [];
  const unlocked = slots.filter(s => !s.isLocked);

  for (const src of unlocked) {
    if (src.coins.length === 0) continue;
    for (const tgt of unlocked) {
      if (src.index === tgt.index) continue;
      const check = canMove(src, tgt);
      if (check.valid && check.transferableCount && check.transferableCount > 0) {
        moves.push({
          from: src.index,
          to: tgt.index,
          count: check.transferableCount
        });
      }
    }
  }

  return moves;
}

/**
 * Creates initial game state from a LevelConfig.
 */
export function initGameState(config: LevelConfig): GameState {
  const initialSlots = generateLevelBoard(config);

  // Check initial merges if any
  const { updatedSlots, pointsEarned, mergeEvents } = processBoardMerges(initialSlots);

  return {
    config,
    slots: updatedSlots,
    score: pointsEarned,
    movesCount: 0,
    dealsRemainingCount: 999, // unlimited or configurable
    dealsUsed: 0,
    isWon: pointsEarned >= config.requiredChipScore,
    isDeadlocked: false,
    selectedSlotIndex: null,
    history: [],
    lastMergeEvents: mergeEvents
  };
}

/**
 * Performs a move action in the game state.
 */
export function executeMove(
  state: GameState,
  fromIndex: number,
  toIndex: number
): GameState {
  const sourceSlot = state.slots[fromIndex];
  const targetSlot = state.slots[toIndex];

  if (!sourceSlot || !targetSlot) return state;

  const check = canMove(sourceSlot, targetSlot);
  if (!check.valid || !check.transferableCount) return state;

  const transferableCount = check.transferableCount;

  // Clone slots
  const newSlots: SlotState[] = state.slots.map(s => ({
    ...s,
    coins: s.coins.map(c => ({ ...c, isNew: false, isMerging: false }))
  }));

  const srcCoins = newSlots[fromIndex].coins;
  const tgtCoins = newSlots[toIndex].coins;

  // Slice transferable coins from top of source
  const movedCoins = srcCoins.splice(srcCoins.length - transferableCount, transferableCount);
  tgtCoins.push(...movedCoins);

  // Check for 10-count stack merges on the target slot & board
  const { updatedSlots, mergeEvents, pointsEarned } = processBoardMerges(newSlots);

  const newScore = state.score + pointsEarned;
  const isWon = newScore >= state.config.requiredChipScore;

  // Check deadlock
  const availableMoves = findAvailableMoves(updatedSlots);
  const isDeadlocked = availableMoves.length === 0 && !isWon;

  // Record history for Undo
  const moveRecord = {
    fromSlot: fromIndex,
    toSlot: toIndex,
    coins: movedCoins,
    previousState: state.slots,
    scoreBefore: state.score
  };

  return {
    ...state,
    slots: updatedSlots,
    score: newScore,
    movesCount: state.movesCount + 1,
    isWon,
    isDeadlocked,
    selectedSlotIndex: null,
    history: [...state.history, moveRecord],
    lastMergeEvents: mergeEvents
  };
}

/**
 * Undoes the last move.
 */
export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;

  const lastMove = state.history[state.history.length - 1];
  const newHistory = state.history.slice(0, -1);

  return {
    ...state,
    slots: lastMove.previousState,
    score: lastMove.scoreBefore,
    movesCount: Math.max(0, state.movesCount - 1),
    isWon: lastMove.scoreBefore >= state.config.requiredChipScore,
    isDeadlocked: false,
    selectedSlotIndex: null,
    history: newHistory,
    lastMergeEvents: []
  };
}
