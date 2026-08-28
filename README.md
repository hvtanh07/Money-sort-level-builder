# Money Sort Level Builder & Playtester

A web-based visual Level Builder, Game Engine, and Playtest environment for **Money Sort** puzzle games.

![Money Sort Level Builder](https://img.shields.io/badge/Money%20Sort-Level%20Builder-emerald)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🎮 Core Features

- **Mobile-Faithful Interactive Board**:
  - 5x2 grid with 10 slots and realistic 3D banknote stacks.
  - Smooth banknote selection, move transfers, and 10-count stack merge animations.
  - Big 3D "DEAL" button with animated chip dealing.
  - Web Audio API arcade sounds (tap, deal, merge chime, win fanfare, error bonk).
  - Undo & Restart mechanics.
  - Progress bar and victory modal with confetti celebration.

- **Level Config Editor**:
  - Live parameter controls: `levelNumber`, `openedStackCount`, `chipsPerLevel`, `dealChipCount`, `maxDealChipLevel`, `requiredChipScore`, `chipsPerStackRange`, `randomSeed`.
  - Visual 5x2 slot lock/unlock toggles.
  - Customizable Merge Score table (Level 1 to 10).
  - Quick presets (Level 1 to Level 10).

- **Multi-Level Table Manager**:
  - Spreadsheet table view to manage, edit, and playtest all levels in one place.
  - In-place cell editing, CSV import/export, and JSON import/export.

- **Manual Slot Customizer**:
  - Fine-grained inspection of individual slot stacks.
  - Add, remove, reorder banknotes per slot.

- **JSON Import / Export**:
  - Exact JSON format with `chipsPerLevel` and `maxDealChipLevel`.
  - Copy to clipboard, download `.json`, import existing JSON files.

- **AI & Developer Guidelines**:
  - Integrated in-app guide and standalone [`GUIDELINES.md`](./GUIDELINES.md) documenting core rules, Seeded PRNG math, deal prioritization, and state transitions for AI assistants and developers.
