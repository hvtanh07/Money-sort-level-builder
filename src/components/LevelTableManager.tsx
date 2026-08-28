import React, { useState } from 'react';
import { LevelConfig, DEFAULT_MERGE_SCORES } from '../core/types';
import { INITIAL_10_LEVELS } from '../core/presets';
import {
  Table,
  Plus,
  Trash2,
  Copy,
  Play,
  Download,
  Upload,
  RotateCcw,
  Dices,
  Check,
  FileSpreadsheet,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface LevelTableManagerProps {
  levels: LevelConfig[];
  currentLevelNumber: number;
  onSelectLevel: (level: LevelConfig) => void;
  onUpdateLevels: (newLevels: LevelConfig[]) => void;
}

export const LevelTableManager: React.FC<LevelTableManagerProps> = ({
  levels,
  currentLevelNumber,
  onSelectLevel,
  onUpdateLevels,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Update a specific field for a level row
  const handleCellChange = (
    index: number,
    field: keyof LevelConfig | 'minStack' | 'maxStack',
    value: number
  ) => {
    const updated = levels.map((lvl, i) => {
      if (i !== index) return lvl;

      if (field === 'minStack') {
        const currentMax = lvl.chipsPerStackRange?.max || 2;
        return {
          ...lvl,
          chipsPerStackRange: {
            min: Math.min(value, currentMax),
            max: currentMax
          }
        };
      }

      if (field === 'maxStack') {
        const currentMin = lvl.chipsPerStackRange?.min || 1;
        return {
          ...lvl,
          chipsPerStackRange: {
            min: currentMin,
            max: Math.max(value, currentMin)
          }
        };
      }

      return {
        ...lvl,
        [field]: value
      };
    });

    onUpdateLevels(updated);
  };

  // Add a new level
  const handleAddLevel = () => {
    const nextNum = levels.length + 1;
    const lastLvl = levels[levels.length - 1] || INITIAL_10_LEVELS[0];

    const newLevel: LevelConfig = {
      levelNumber: nextNum,
      openedStackCount: Math.min(10, lastLvl.openedStackCount),
      colorCount: Math.min(10, lastLvl.colorCount),
      initialChipCount: lastLvl.initialChipCount + 2,
      dealChipCount: lastLvl.dealChipCount + 2,
      dealMaxChipCount: lastLvl.dealMaxChipCount,
      requiredChipScore: lastLvl.requiredChipScore + 20,
      chipsPerStackRange: {
        min: lastLvl.chipsPerStackRange?.min || 1,
        max: lastLvl.chipsPerStackRange?.max || 3
      },
      randomSeed: Math.floor(Math.random() * 9000) + 1000,
      mergeScores: DEFAULT_MERGE_SCORES
    };

    onUpdateLevels([...levels, newLevel]);
    showToast(`Level ${nextNum} added!`);
  };

  // Duplicate a level
  const handleDuplicateLevel = (index: number) => {
    const target = levels[index];
    const newLvl: LevelConfig = {
      ...target,
      levelNumber: levels.length + 1,
      randomSeed: Math.floor(Math.random() * 9000) + 1000
    };

    onUpdateLevels([...levels, newLvl]);
    showToast(`Duplicated Level ${target.levelNumber} as Level ${newLvl.levelNumber}!`);
  };

  // Delete a level
  const handleDeleteLevel = (index: number) => {
    if (levels.length <= 1) {
      showToast('Cannot delete the last remaining level.');
      return;
    }

    const updated = levels
      .filter((_, i) => i !== index)
      .map((lvl, i) => ({ ...lvl, levelNumber: i + 1 }));

    onUpdateLevels(updated);
    showToast(`Level deleted. Remaining levels re-indexed.`);
  };

  // Move level up/down
  const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= levels.length) return;

    const copy = [...levels];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Re-index level numbers sequentially
    const reindexed = copy.map((lvl, i) => ({ ...lvl, levelNumber: i + 1 }));
    onUpdateLevels(reindexed);
  };

  // Randomize Seed for a specific row
  const handleRandomizeRowSeed = (index: number) => {
    const newSeed = Math.floor(Math.random() * 9000) + 1000;
    handleCellChange(index, 'randomSeed', newSeed);
  };

  // Reset to default 10 levels
  const handleResetDefaults = () => {
    if (window.confirm('Reset all levels to standard 10-level configuration?')) {
      onUpdateLevels(INITIAL_10_LEVELS);
      onSelectLevel(INITIAL_10_LEVELS[0]);
      showToast('Reset to default 10 levels!');
    }
  };

  // Export All as JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(levels, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money_sort_all_levels.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported all levels to JSON!');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated: LevelConfig[] = parsed.map((item, idx) => ({
            levelNumber: idx + 1,
            openedStackCount: Number(item.openedStackCount) || 8,
            colorCount: Number(item.colorCount) || 4,
            initialChipCount: Number(item.initialChipCount) || 24,
            dealChipCount: Number(item.dealChipCount) || 10,
            dealMaxChipCount: Number(item.dealMaxChipCount) || 2,
            requiredChipScore: Number(item.requiredChipScore) || 100,
            chipsPerStackRange: {
              min: Number(item.chipsPerStackRange?.min) || 1,
              max: Number(item.chipsPerStackRange?.max) || 2
            },
            randomSeed: Number(item.randomSeed) || (1800 + idx * 100),
            mergeScores: item.mergeScores || DEFAULT_MERGE_SCORES
          }));

          onUpdateLevels(validated);
          onSelectLevel(validated[0]);
          showToast(`Imported ${validated.length} levels successfully!`);
        } else {
          showToast('Invalid JSON: expected an array of level configs.');
        }
      } catch {
        showToast('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Level',
      'Open slots',
      'Colors',
      'Initial chips',
      'Deal chips',
      'Required score',
      'Chips/stack min',
      'Chips/stack max',
      'Random Seed'
    ];

    const rows = levels.map((lvl) => [
      lvl.levelNumber,
      lvl.openedStackCount,
      lvl.colorCount,
      lvl.initialChipCount,
      lvl.dealChipCount,
      lvl.requiredChipScore,
      lvl.chipsPerStackRange?.min || 1,
      lvl.chipsPerStackRange?.max || 2,
      lvl.randomSeed
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money_sort_levels.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported levels to CSV!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-slate-200 shadow-xl overflow-hidden">
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-400">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Multi-Level Manager Table</h2>
            <p className="text-xs text-slate-400">Manage, edit, and playtest all {levels.length} levels</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleAddLevel}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Level
          </button>

          <button
            onClick={handleExportCsv}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold flex items-center gap-1 transition"
            title="Export as CSV table"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>

          <button
            onClick={handleExportJson}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold flex items-center gap-1 transition"
            title="Export full levels array as JSON"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>

          <label className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" /> Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDefaults}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 font-bold flex items-center gap-1 transition"
            title="Reset to initial 10 levels"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="mb-2 p-2 bg-emerald-950/90 border border-emerald-500 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-deal-pop">
          <Check className="w-4 h-4 text-emerald-400" />
          {notification}
        </div>
      )}

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-950/70 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead className="sticky top-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-200 text-[11px] font-black uppercase tracking-wider border-b border-slate-700 shadow z-10">
            <tr>
              <th className="py-2.5 px-3">Level</th>
              <th className="py-2.5 px-2 text-center">Open Slots</th>
              <th className="py-2.5 px-2 text-center">Colors</th>
              <th className="py-2.5 px-2 text-center">Initial Chips</th>
              <th className="py-2.5 px-2 text-center">Deal Chips</th>
              <th className="py-2.5 px-2 text-center">Required Score</th>
              <th className="py-2.5 px-2 text-center">Chips/Stack</th>
              <th className="py-2.5 px-2 text-center">Random Seed</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
            {levels.map((lvl, index) => {
              const isActive = lvl.levelNumber === currentLevelNumber;

              return (
                <tr
                  key={`lvl_${lvl.levelNumber}_${index}`}
                  className={`transition group ${
                    isActive
                      ? 'bg-sky-950/50 hover:bg-sky-900/60 font-bold'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Level Number */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {lvl.levelNumber}
                      </span>
                      {isActive && (
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/40 px-1 py-0.2 rounded font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Open Slots */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={lvl.openedStackCount}
                      onChange={(e) =>
                        handleCellChange(index, 'openedStackCount', parseInt(e.target.value) || 1)
                      }
                      className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-slate-200 focus:border-cyan-400 focus:outline-none"
                    />
                  </td>

                  {/* Colors */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={lvl.colorCount}
                      onChange={(e) =>
                        handleCellChange(index, 'colorCount', parseInt(e.target.value) || 1)
                      }
                      className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </td>

                  {/* Initial Chips */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="80"
                      value={lvl.initialChipCount}
                      onChange={(e) =>
                        handleCellChange(index, 'initialChipCount', parseInt(e.target.value) || 0)
                      }
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-emerald-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </td>

                  {/* Deal Chips */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={lvl.dealChipCount}
                      onChange={(e) =>
                        handleCellChange(index, 'dealChipCount', parseInt(e.target.value) || 1)
                      }
                      className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-emerald-400 focus:border-cyan-400 focus:outline-none"
                    />
                  </td>

                  {/* Required Score */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      step="10"
                      value={lvl.requiredChipScore}
                      onChange={(e) =>
                        handleCellChange(index, 'requiredChipScore', parseInt(e.target.value) || 50)
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-amber-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </td>

                  {/* Chips/Stack Range (min-max) */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={lvl.chipsPerStackRange?.min || 1}
                        onChange={(e) =>
                          handleCellChange(index, 'minStack', parseInt(e.target.value) || 1)
                        }
                        className="w-9 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-[11px] font-bold text-slate-200"
                        title="Min stack"
                      />
                      <span className="text-slate-500 font-bold">–</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={lvl.chipsPerStackRange?.max || 2}
                        onChange={(e) =>
                          handleCellChange(index, 'maxStack', parseInt(e.target.value) || 2)
                        }
                        className="w-9 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-[11px] font-bold text-slate-200"
                        title="Max stack"
                      />
                    </div>
                  </td>

                  {/* Random Seed */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        value={lvl.randomSeed}
                        onChange={(e) =>
                          handleCellChange(index, 'randomSeed', parseInt(e.target.value) || 0)
                        }
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-[11px] text-cyan-300 focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        onClick={() => handleRandomizeRowSeed(index)}
                        title="Roll new seed"
                        className="p-1 text-slate-400 hover:text-cyan-300"
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Playtest Button */}
                      <button
                        onClick={() => onSelectLevel(lvl)}
                        title="Playtest this Level"
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicateLevel(index)}
                        title="Duplicate Level"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => handleMoveLevel(index, 'up')}
                        disabled={index === 0}
                        title="Move Level Up"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMoveLevel(index, 'down')}
                        disabled={index === levels.length - 1}
                        title="Move Level Down"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteLevel(index)}
                        title="Delete Level"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Total Levels Configured: <b className="text-white">{levels.length}</b></span>
        </div>
        <span className="text-[11px] text-slate-500">
          Click any cell to edit • Changes are auto-synced across the builder
        </span>
      </div>
    </div>
  );
};
