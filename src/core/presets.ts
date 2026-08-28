import { LevelConfig, DEFAULT_MERGE_SCORES } from './types';

/**
 * Standard 10 Levels Configuration
 * Configured with chipsPerLevel map
 */
export const INITIAL_10_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    openedStackCount: 6,
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 5,
      "4": 3
    },
    dealChipCount: 10,
    maxDealChipLevel: 4,
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
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 4,
      "4": 3,
      "5": 3
    },
    dealChipCount: 9,
    maxDealChipLevel: 5,
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
    chipsPerLevel: {
      "1": 10,
      "2": 5,
      "3": 5,
      "4": 3,
      "5": 3,
      "6": 2
    },
    dealChipCount: 10,
    maxDealChipLevel: 6,
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
    chipsPerLevel: {
      "1": 10,
      "2": 5,
      "3": 4,
      "4": 4,
      "5": 3,
      "6": 2,
      "7": 2
    },
    dealChipCount: 11,
    maxDealChipLevel: 7,
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
    chipsPerLevel: {
      "1": 10,
      "2": 5,
      "3": 4,
      "4": 4,
      "5": 3,
      "6": 2,
      "7": 2,
      "8": 2
    },
    dealChipCount: 12,
    maxDealChipLevel: 8,
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
    chipsPerLevel: {
      "1": 10,
      "2": 5,
      "3": 4,
      "4": 4,
      "5": 3,
      "6": 3,
      "7": 2,
      "8": 2,
      "9": 1
    },
    dealChipCount: 13,
    maxDealChipLevel: 9,
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
    chipsPerLevel: {
      "1": 10,
      "2": 5,
      "3": 4,
      "4": 4,
      "5": 3,
      "6": 3,
      "7": 2,
      "8": 2,
      "9": 2,
      "10": 1
    },
    dealChipCount: 20,
    maxDealChipLevel: 10,
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
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 4,
      "4": 4,
      "5": 3,
      "6": 3,
      "7": 3,
      "8": 2,
      "9": 2,
      "10": 1
    },
    dealChipCount: 25,
    maxDealChipLevel: 10,
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
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 5,
      "4": 4,
      "5": 4,
      "6": 3,
      "7": 3,
      "8": 2,
      "9": 2,
      "10": 1
    },
    dealChipCount: 28,
    maxDealChipLevel: 10,
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
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 5,
      "4": 5,
      "5": 4,
      "6": 3,
      "7": 3,
      "8": 3,
      "9": 2,
      "10": 1
    },
    dealChipCount: 30,
    maxDealChipLevel: 10,
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
