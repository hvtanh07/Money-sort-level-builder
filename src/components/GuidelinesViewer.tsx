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
          <li><b>Grid Layout:</b> 10 slots arranged in a 5 x 2 grid. Unlocked count is controlled by <code className="text-cyan-300">openedStackCount</code> (e.g. 6 to 9 opened, rest locked).</li>
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
          <Cpu className="w-4 h-4" /> 2. Level Generation Logic (Seeded PRNG & chipsPerLevel)
        </h3>
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 leading-relaxed">
          <p>
            Generation uses a deterministic <b>Mulberry32 PRNG</b> with <code className="text-cyan-300">randomSeed</code> for 100% reproducibility.
          </p>
          <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400">
            {`1. Pool Creation:
   - Read chipsPerLevel: { "1": 10, "2": 6, "3": 5, "4": 3 }
   - Populate pool with the exact number of coins defined for each level.
2. Distribution:
   - Distribute the shuffled pool across opened slots (ensuring slot size <= 10).
3. In-Slot Grouping:
   - For each slot: Group coins by level, then shuffle the group order.
   - Ex: [5, 4, 5, 3, 3, 1, 2, 1] -> groups {1:[1,1], 2:[2], 3:[3,3], 4:[4], 5:[5,5]}
   - Result in slot: [1, 1, 3, 3, 4, 5, 5, 2]`}
          </div>
        </div>
      </section>

      {/* Section 3: Deal Logic */}
      <section className="space-y-2">
        <h3 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> 3. Deal Chip Logic (Targeted Completion & Spectrum)
        </h3>
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2 leading-relaxed">
          <p>When the player taps the <b>DEAL</b> button:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
            <li>
              <b>Targeted Completion:</b> Inspect all active coin levels on the board that currently have <code className="text-cyan-300">totalCount &gt; 5</code> (and &lt; 10).
              If found, randomly select 1 candidate level <code className="text-amber-300">T</code> and spawn exactly <code className="text-amber-300">10 - count</code> coins of level <code className="text-amber-300">T</code> so its total count equals 10.
              <i>(This targeted spawn ignores maxDealChipLevel).</i>
            </li>
            <li>
              <b>Remainder Coins:</b> The remaining coins to reach <code className="text-cyan-300">dealChipCount</code> spawn randomly from <code className="text-cyan-300">[1, maxDealChipLevel]</code>.
            </li>
            <li>
              <b>Placement:</b> Distribute all deal coins randomly across unlocked slots with remaining capacity (&lt; 10).
            </li>
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
  "openedStackCount": 8,
  "chipsPerLevel": {
    "1": 10,
    "2": 6,
    "3": 5,
    "4": 3
  },
  "dealChipCount": 8,
  "maxDealChipLevel": 4,
  "requiredChipScore": 100,
  "chipsPerStackRange": {
    "min": 1,
    "max": 2
  },
  "randomSeed": 1810
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
            <li><code className="text-cyan-300">src/core/levelGenerator.ts</code> - Procedural board generator with chipsPerLevel & in-slot grouping.</li>
            <li><code className="text-cyan-300">src/core/dealEngine.ts</code> - Deal distribution engine with targeted stack completion.</li>
            <li><code className="text-cyan-300">src/core/gameEngine.ts</code> - Move validation, cascade merge engine, score calculation, and undo history.</li>
            <li><code className="text-cyan-300">src/core/sound.ts</code> - Web Audio API audio synthesizer.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
