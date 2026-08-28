import React from 'react';
import { BookOpen, Cpu, Sparkles, Code2, Layers, CheckCircle2 } from 'lucide-react';

export const GuidelinesViewer: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-slate-200 overflow-y-auto shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-400 shadow">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">AI & Developer Guidelines</h2>
          <p className="text-xs text-slate-400">Architecture, Game Logic, Seeded PRNG & Schema Reference</p>
        </div>
      </div>

      {/* Section 1: Core Mechanics */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> 1. Core Gameplay Mechanics
        </h3>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          <li><b>Grid Layout:</b> 10 slots arranged in a 5 x 2 grid. Unlocked count is controlled by <code className="text-cyan-300">openedStackCount</code> (e.g. 8 opened, 2 locked).</li>
          <li><b>Slot Capacity:</b> Maximum <b>10 coins/banknotes</b> per slot.</li>
          <li><b>Coin Levels:</b> Levels 1 to 10 with distinct visual colors and banknote denominations.</li>
          <li><b>Selection:</b> Tapping a slot selects the top-most contiguous group of identical coin levels.</li>
          <li><b>Movement Rule:</b> Selected coins can move to any unlocked slot that is <b>empty</b> or whose <b>top coin matches the selected level</b> (up to remaining capacity &lt;= 10).</li>
          <li><b>10-Stack Merge Rule:</b> When 10 coins of the same level gather in a slot, they instantly merge into <b>2 coins of (Level + 1)</b> and award points. Cascading merges trigger recursively.</li>
          <li><b>Win Condition:</b> Score reaches or exceeds <code className="text-amber-300">requiredChipScore</code>.</li>
        </ul>
      </section>

      {/* Section 2: Level Generation Logic */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
          <Cpu className="w-4 h-4" /> 2. Level Generation Logic (Seeded PRNG)
        </h3>
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 leading-relaxed">
          <p>
            Generation uses a deterministic <b>Mulberry32 PRNG</b> with <code className="text-cyan-300">randomSeed</code> for 100% reproducibility across sessions and platforms.
          </p>
          <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400">
            {`1. Pool = Generate initialChipCount coins with random levels in [1, colorCount]
2. Distribute Pool across opened slots (ensuring slot size <= 10)
3. For each slot: Group coins by level, then shuffle the group order
   Ex: [5, 4, 5, 3, 3, 1, 2, 1] -> groups {1:[1,1], 2:[2], 3:[3,3], 4:[4], 5:[5,5]}
   -> Shuffled: [1, 1, 3, 3, 4, 5, 5, 2]`}
          </div>
        </div>
      </section>

      {/* Section 3: Deal Logic */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> 3. Deal Chip Logic
        </h3>
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 leading-relaxed">
          <p>When the player taps the <b>DEAL</b> button:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Find current <b>highest coin level</b> present on the board (<code className="text-cyan-300">H</code>).</li>
            <li>Spawn at least <b>2 coins of level H</b> first.</li>
            <li>Spawn remaining <code className="text-cyan-300">dealChipCount - 2</code> coins randomly from <code className="text-cyan-300">[1, max(colorCount, H)]</code>.</li>
            <li>Distribute newly spawned coins randomly into opened slots with available capacity (&lt; 10).</li>
          </ol>
        </div>
      </section>

      {/* Section 4: JSON Config Schema */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-purple-300 flex items-center gap-1.5">
          <Code2 className="w-4 h-4" /> 4. JSON Schema Specification
        </h3>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{`{
  "levelNumber": 1,
  "openedStackCount": 4,
  "colorCount": 3,
  "initialChipCount": 20,
  "dealChipCount": 5,
  "dealMaxChipCount": 2,
  "requiredChipScore": 100,
  "chipsPerStackRange": {
    "min": 3,
    "max": 8
  },
  "randomSeed": 12345,
  "mergeScores": {
    "1": 10, "2": 15, "3": 25, "4": 40, "5": 60,
    "6": 90, "7": 130, "8": 180, "9": 250, "10": 350
  }
}`}
        </pre>
      </section>

      {/* Section 5: Engine Architecture */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-rose-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> 5. Codebase Structure & Extension
        </h3>
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <p>The codebase is modularly designed with pure TypeScript logic separated from UI rendering:</p>
          <ul className="list-disc list-inside text-slate-400 space-y-1 font-mono text-[11px]">
            <li><code className="text-cyan-300">src/core/prng.ts</code> - Deterministic Mulberry32 algorithm.</li>
            <li><code className="text-cyan-300">src/core/levelGenerator.ts</code> - Procedural board generator with in-slot level grouping.</li>
            <li><code className="text-cyan-300">src/core/dealEngine.ts</code> - Deal queue & distribution engine.</li>
            <li><code className="text-cyan-300">src/core/gameEngine.ts</code> - Move validation, cascade merge engine, score calculation, and undo history.</li>
            <li><code className="text-cyan-300">src/core/sound.ts</code> - Web Audio API audio synthesizer.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
