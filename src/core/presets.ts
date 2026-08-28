import { LevelConfig } from './types';

/**
 * Standard 10 Levels Configuration
 * Configured with chipsPerLevel map
 */
export const INITIAL_10_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 10,
      "2": 6,
      "3": 5,
      "4": 3
    },
    dealChipCount: 8,
    maxDealChipLevel: 4,
    requiredChipScore: 100,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 1810
  },
  {
    levelNumber: 2,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 10,
      "2": 7,
      "3": 5,
      "4": 4
    },
    dealChipCount: 8,
    maxDealChipLevel: 4,
    requiredChipScore: 150,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 1911
  },
  {
    levelNumber: 3,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 10,
      "2": 7,
      "3": 5,
      "4": 4,
      "5": 2
    },
    dealChipCount: 9,
    maxDealChipLevel: 5,
    requiredChipScore: 200,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 2012
  },
  {
    levelNumber: 4,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 11,
      "2": 8,
      "3": 6,
      "4": 4,
      "5": 2
    },
    dealChipCount: 9,
    maxDealChipLevel: 5,
    requiredChipScore: 250,
    chipsPerStackRange: {
      min: 1,
      max: 2
    },
    randomSeed: 2113
  },
  {
    levelNumber: 5,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 11,
      "2": 8,
      "3": 6,
      "4": 5,
      "6": 2
    },
    dealChipCount: 10,
    maxDealChipLevel: 6,
    requiredChipScore: 300,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2214
  },
  {
    levelNumber: 6,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 12,
      "2": 8,
      "3": 6,
      "4": 5,
      "6": 2
    },
    dealChipCount: 10,
    maxDealChipLevel: 6,
    requiredChipScore: 350,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2315
  },
  {
    levelNumber: 7,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 12,
      "2": 8,
      "3": 7,
      "4": 5,
      "7": 2
    },
    dealChipCount: 11,
    maxDealChipLevel: 7,
    requiredChipScore: 400,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2416
  },
  {
    levelNumber: 8,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 12,
      "2": 9,
      "3": 7,
      "4": 5,
      "7": 2
    },
    dealChipCount: 11,
    maxDealChipLevel: 7,
    requiredChipScore: 450,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2517
  },
  {
    levelNumber: 9,
    openedStackCount: 8,
    chipsPerLevel: {
      "1": 12,
      "2": 9,
      "3": 7,
      "4": 6,
      "7": 2
    },
    dealChipCount: 12,
    maxDealChipLevel: 7,
    requiredChipScore: 500,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2318
  },
  {
    levelNumber: 10,
    openedStackCount: 9,
    chipsPerLevel: {
      "1": 12,
      "2": 9,
      "3": 8,
      "4": 6,
      "8": 2
    },
    dealChipCount: 12,
    maxDealChipLevel: 8,
    requiredChipScore: 550,
    chipsPerStackRange: {
      min: 1,
      max: 3
    },
    randomSeed: 2719
  }
];

export const PRESET_LEVELS = INITIAL_10_LEVELS;
