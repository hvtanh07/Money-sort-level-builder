/**
 * Money Sort - Core Types & JSON Data Schema
 */

export interface StackRange {
  min: number;
  max: number;
}

export interface MergeScoreMap {
  [level: string]: number; // e.g. "1": 10, "2": 15, ...
}

export interface ChipsPerLevelMap {
  [level: string]: number; // e.g. "1": 10, "2": 6, "3": 5, ...
}

export interface LevelConfig {
  levelNumber: number;
  openedStackCount: number; // How many slots available at start (0 - 10)
  chipsPerLevel: ChipsPerLevelMap; // Count of chips for each level at start: { "1": 10, "2": 6, ... }
  dealChipCount: number; // Amount of chips added per deal action
  maxDealChipLevel: number; // Maximum coin level that can spawn when dealing (1 - 10)
  requiredChipScore: number; // Score to win the level
  chipsPerStackRange: StackRange; // Min & Max stack height allowed per deal batch
  randomSeed: number; // Deterministic random seed
  lockedSlotIndices?: number[]; // Specific slots locked (defaults to slots >= openedStackCount)
  customLayout?: number[][]; // Optional manual preset for all 10 slots
}

export interface CoinData {
  id: string;
  level: number; // 1 to 10
  isNew?: boolean; // For deal animation
  isMerging?: boolean;
}

export interface SlotState {
  index: number;
  isLocked: boolean;
  coins: CoinData[]; // bottom to top (index 0 = bottom, index length-1 = top)
  lockCost?: number; // Optional unlock currency
}

export interface MergeEvent {
  slotIndex: number;
  fromLevel: number;
  toLevel: number;
  gainedScore: number;
  timestamp: number;
}

export interface MoveAction {
  fromSlot: number;
  toSlot: number;
  coins: CoinData[];
  previousState: SlotState[];
  scoreBefore: number;
}

export interface GameState {
  config: LevelConfig;
  slots: SlotState[];
  score: number;
  movesCount: number;
  dealsRemainingCount: number;
  dealsUsed: number;
  isWon: boolean;
  isDeadlocked: boolean;
  selectedSlotIndex: number | null;
  history: MoveAction[];
  lastMergeEvents: MergeEvent[];
}

export interface CoinTheme {
  level: number;
  name: string;
  valueLabel: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  badgeBg: string;
  gradient: string;
}

export const DEFAULT_MERGE_SCORES: MergeScoreMap = {
  "1": 10,
  "2": 15,
  "3": 25,
  "4": 40,
  "5": 60,
  "6": 90,
  "7": 130,
  "8": 180,
  "9": 250,
  "10": 350
};

export const MAX_SLOT_CAPACITY = 10;
export const TOTAL_SLOTS_COUNT = 10; // 5 x 2 grid

export const COIN_THEMES: Record<number, CoinTheme> = {
  1: {
    level: 1,
    name: '1 Dollar',
    valueLabel: '1',
    bgColor: '#40c057',
    borderColor: '#2b8a3e',
    textColor: '#ffffff',
    glowColor: 'rgba(64, 192, 87, 0.6)',
    badgeBg: '#2f9e44',
    gradient: 'from-emerald-500 to-green-600',
  },
  2: {
    level: 2,
    name: '2 Dollars',
    valueLabel: '2',
    bgColor: '#fa5252',
    borderColor: '#c92a2a',
    textColor: '#ffffff',
    glowColor: 'rgba(250, 82, 82, 0.6)',
    badgeBg: '#e03131',
    gradient: 'from-rose-500 to-red-600',
  },
  3: {
    level: 3,
    name: '5 Dollars',
    valueLabel: '3',
    bgColor: '#22b8cf',
    borderColor: '#1098ad',
    textColor: '#ffffff',
    glowColor: 'rgba(34, 184, 207, 0.6)',
    badgeBg: '#15aabf',
    gradient: 'from-cyan-400 to-teal-500',
  },
  4: {
    level: 4,
    name: '10 Dollars',
    valueLabel: '4',
    bgColor: '#fab005',
    borderColor: '#e67700',
    textColor: '#ffffff',
    glowColor: 'rgba(250, 176, 5, 0.6)',
    badgeBg: '#f59f00',
    gradient: 'from-amber-400 to-yellow-500',
  },
  5: {
    level: 5,
    name: '20 Dollars',
    valueLabel: '5',
    bgColor: '#fd7e14',
    borderColor: '#d9480f',
    textColor: '#ffffff',
    glowColor: 'rgba(253, 126, 20, 0.6)',
    badgeBg: '#f76707',
    gradient: 'from-orange-400 to-orange-600',
  },
  6: {
    level: 6,
    name: '50 Dollars',
    valueLabel: '6',
    bgColor: '#be4bdb',
    borderColor: '#862e9c',
    textColor: '#ffffff',
    glowColor: 'rgba(190, 75, 219, 0.6)',
    badgeBg: '#ae3ec9',
    gradient: 'from-purple-500 to-fuchsia-600',
  },
  7: {
    level: 7,
    name: '100 Dollars',
    valueLabel: '7',
    bgColor: '#f06595',
    borderColor: '#c2255c',
    textColor: '#ffffff',
    glowColor: 'rgba(240, 101, 149, 0.6)',
    badgeBg: '#e64980',
    gradient: 'from-pink-500 to-rose-600',
  },
  8: {
    level: 8,
    name: '200 Dollars',
    valueLabel: '8',
    bgColor: '#4c6ef5',
    borderColor: '#364fc7',
    textColor: '#ffffff',
    glowColor: 'rgba(76, 110, 245, 0.6)',
    badgeBg: '#3b5bdb',
    gradient: 'from-indigo-500 to-blue-600',
  },
  9: {
    level: 9,
    name: '500 Dollars',
    valueLabel: '9',
    bgColor: '#20c997',
    borderColor: '#0ca678',
    textColor: '#ffffff',
    glowColor: 'rgba(32, 201, 151, 0.6)',
    badgeBg: '#12b886',
    gradient: 'from-teal-400 to-emerald-600',
  },
  10: {
    level: 10,
    name: '1000 Gold Note',
    valueLabel: '10',
    bgColor: '#ffd43b',
    borderColor: '#f08c00',
    textColor: '#5c3a00',
    glowColor: 'rgba(255, 212, 59, 0.8)',
    badgeBg: '#fcc419',
    gradient: 'from-yellow-300 via-amber-400 to-amber-600',
  },
};
