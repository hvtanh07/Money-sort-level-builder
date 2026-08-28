import { LevelConfig, DEFAULT_MERGE_SCORES } from './types';

/**
 * Standard 10 Levels Configuration
 * Exact match from Level Design Specification Table
 */
export const INITIAL_10_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    openedStackCount: 6,
    colorCount: 4,
    initialChipCount: 24,
    dealChipCount: 10,
    dealMaxChipCount: 2,
    requiredChipScore: 100,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 1810,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 2,
    openedStackCount: 7,
    colorCount: 5,
    initialChipCount: 26,
    dealChipCount: 9,
    dealMaxChipCount: 2,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 1911,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 3,
    openedStackCount: 8,
    colorCount: 6,
    initialChipCount: 28,
    dealChipCount: 10,
    dealMaxChipCount: 2,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 2012,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 4,
    openedStackCount: 8,
    colorCount: 7,
    initialChipCount: 30,
    dealChipCount: 11,
    dealMaxChipCount: 2,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 2113,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 5,
    openedStackCount: 9,
    colorCount: 8,
    initialChipCount: 32,
    dealChipCount: 12,
    dealMaxChipCount: 3,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2214,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 6,
    openedStackCount: 9,
    colorCount: 9,
    initialChipCount: 34,
    dealChipCount: 13,
    dealMaxChipCount: 3,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2315,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 7,
    openedStackCount: 9,
    colorCount: 10,
    initialChipCount: 36,
    dealChipCount: 20,
    dealMaxChipCount: 3,
    requiredChipScore: 180,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2416,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 8,
    openedStackCount: 9,
    colorCount: 10,
    initialChipCount: 38,
    dealChipCount: 25,
    dealMaxChipCount: 3,
    requiredChipScore: 200,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2517,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 9,
    openedStackCount: 9,
    colorCount: 10,
    initialChipCount: 40,
    dealChipCount: 28,
    dealMaxChipCount: 3,
    requiredChipScore: 220,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2318,
    mergeScores: DEFAULT_MERGE_SCORES
  },
  {
    levelNumber: 10,
    openedStackCount: 9,
    colorCount: 10,
    initialChipCount: 42,
    dealChipCount: 30,
    dealMaxChipCount: 3,
    requiredChipScore: 240,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2719,
    mergeScores: DEFAULT_MERGE_SCORES
  }
];

export const PRESET_LEVELS = INITIAL_10_LEVELS;
