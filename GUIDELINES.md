# Money Sort - AI & Developer Integration Guidelines

> **Target Audience:** AI Coding Assistants, Gameplay Programmers, Level Designers, and QA Engineers.
> **Project Scope:** Deterministic Money/Banknote Stacking & Sorting Puzzle Game Engine & Level Builder.

---

## 1. Game Concept & Core Rules

Money Sort is a tactile, card/banknote-stacking puzzle game where players organize mixed stacks of colored banknotes across a grid of slots, merging full stacks into higher-denomination banknotes to reach a required score goal.

### 1.1 Grid & Slot Architecture
- **Grid Layout:** 10 slots arranged on a **5 x 2 grid** (5 columns, 2 rows).
- **Slot Availability:** Configured via `openedStackCount` (e.g. `6` to `9` opened slots, rest locked) or an explicit `lockedSlotIndices` array.
- **Slot Capacity:** Every slot can hold at most **10 coins/banknotes**.
- **Coin/Banknote Levels:** Values range from **Level 1 to Level 10**, each mapped to a distinct color palette, name, and visual badge.

---

## 2. Gameplay Mechanics & State Transitions

### 2.1 Banknote Selection
- When a player taps a slot with banknotes:
  - The game evaluates the top-most banknotes.
  - It identifies the **top contiguous block** of banknotes sharing the exact same level.
  - Let this group have count $k$ and level $L$.
  - These $k$ banknotes are highlighted, raised, and selected.

### 2.2 Movement Validation
A move from `sourceSlot` to `targetSlot` is valid **if and only if**:
1. `sourceSlot !== targetSlot`
2. Both slots are **unlocked**.
3. `sourceSlot` has at least 1 banknote.
4. `targetSlot` is not full (`targetSlot.coins.length < 10`).
5. **Color/Level Matching Condition:**
   - If `targetSlot` is **empty** $\rightarrow$ **VALID**.
   - If `targetSlot` is **not empty** $\rightarrow$ Valid **if and only if** `targetSlot.topCoin.level === sourceSlot.selectedLevel`.

### 2.3 Transfer Execution
- Transfer quantity: $T = \min(k, 10 - \text{targetSlot.coins.length})$.
- Exactly $T$ banknotes are popped from `sourceSlot` and pushed onto `targetSlot`.

### 2.4 10-Stack Merge Rule & Cascade
- Whenever any slot accumulates **10 banknotes of the same level $L$**:
  1. The 10 banknotes are removed.
  2. Exactly **2 banknotes of level $L + 1$** are placed in that slot (if $L = 10$, 2 banknotes of Level 10).
  3. Points are awarded based on the `mergeScores` configuration for level $L$ (defaulting to Level 1: 10pts, Level 2: 15pts, Level 3: 25pts, etc.).
  4. **Cascade Check:** If the resulting slot or adjacent slots now satisfy the 10-stack condition, merges trigger recursively.

### 2.5 Win Condition
- When $\text{score} \ge \text{requiredChipScore}$, the level transitions to `isWon = true`.

---

## 3. Level Generation Logic (Seeded PRNG & chipsPerLevel)

Level generation is 100% deterministic using the **Mulberry32 PRNG** algorithm driven by `randomSeed`.

### 3.1 Initial Pool from chipsPerLevel
- Instead of generic counts, designers define exact counts of coins per level using `chipsPerLevel`:
  ```json
  "chipsPerLevel": {
    "1": 10,
    "2": 6,
    "3": 5,
    "4": 3
  }
  ```
- The generator creates `rawCoins` matching these exact quantities.
- Coins are shuffled deterministically with `randomSeed`.
- Coins are distributed across opened slots (capacity $\le 10$).
- Coins within each slot are grouped contiguously by level, and the level groups are ordered randomly (e.g., `5,4,5,3,3,1,2,1` $\rightarrow$ `1,1,3,3,4,5,5,2`).

---

## 4. Deal Chip Logic (Targeted Completion & Spectrum)

When the player clicks the **DEAL** button during gameplay:
1. **Targeted Completion for Stacks > 5:**
   - The engine scans the board for any coin level currently having $\text{totalCount} > 5$ (and $< 10$).
   - If found, it randomly picks 1 candidate level $T$ and spawns exactly $10 - \text{count}$ coins of level $T$ so its total count equals 10.
   - *Note: This targeted completion ignores `maxDealChipLevel`.*
2. **Remainder Coins:**
   - The remaining $\max(0, \text{dealChipCount} - \text{targetedSpawnCount})$ coins are spawned randomly with levels in $[1, \text{maxDealChipLevel}]$.
3. **Placement:**
   - The spawned coins are distributed randomly to opened slots with available capacity ($< 10$).

---

## 5. Level Config JSON Specification

The game loads and exports level definitions using the updated JSON payload:

```json
{
  "levelNumber": 1,
  "openedStackCount": 4,
  "chipsPerLevel": {
    "1": 10,
    "2": 6,
    "3": 4
  },
  "dealChipCount": 5,
  "maxDealChipLevel": 5,
  "requiredChipScore": 100,
  "chipsPerStackRange": {
    "min": 3,
    "max": 8
  },
  "randomSeed": 12345,
  "mergeScores": {
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
  }
}
```

---

## 6. Codebase Structure & File Mapping

```
src/
├── core/
│   ├── types.ts           # Type definitions, themes, and chipsPerLevel map
│   ├── prng.ts            # Mulberry32 32-bit PRNG engine
│   ├── levelGenerator.ts  # Procedural level generation with chipsPerLevel & in-slot grouping
│   ├── dealEngine.ts      # Deal logic with targeted completion (> 5) & maxDealChipLevel
│   ├── gameEngine.ts      # Move validation, stack merging, undo & scoring
│   ├── sound.ts           # Web Audio API sound synthesizer
│   └── presets.ts         # Pre-configured 10 game levels with chipsPerLevel
├── components/
│   ├── GameBoard.tsx      # Main 5x2 board layout & gameplay controller
│   ├── BanknoteStack.tsx  # 3D banknote rendering with level badges
│   ├── ConfigEditor.tsx   # Visual parameter sliders & chipsPerLevel count editor
│   ├── SlotCustomizer.tsx # Manual coin-by-coin stack editor
│   ├── LevelTableManager.tsx # Multi-level management table with in-place edits & chipsPerLevel modal
│   ├── JsonManager.tsx    # Live JSON editor, importer & exporter
│   ├── GuidelinesViewer.tsx # In-app guideline documentation modal
│   ├── ScorePopup.tsx     # Floating particle merge score awards
│   └── WinModal.tsx       # Confetti victory modal & stats
├── styles/
│   └── index.css          # 3D perspective, animations & Tailwind styles
└── App.tsx                # Dual-pane application shell
```
