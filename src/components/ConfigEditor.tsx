import React, { useState } from 'react';
import { LevelConfig, DEFAULT_MERGE_SCORES, TOTAL_SLOTS_COUNT, COIN_THEMES } from '../core/types';
import { PRESET_LEVELS } from '../core/presets';
import {
  Sliders,
  Dices,
  Sparkles,
  Lock,
  Unlock,
  Flame
} from 'lucide-react';

interface ConfigEditorProps {
  config: LevelConfig;
  onChangeConfig: (newConfig: LevelConfig) => void;
  onApplyGenerate: () => void;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
  config,
  onChangeConfig,
  onApplyGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'scoring' | 'slots'>('general');

  // Handle single field change
  const handleChange = <K extends keyof LevelConfig>(key: K, value: LevelConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value
    });
  };

  // Roll random seed
  const handleRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 10000;
    handleChange('randomSeed', newSeed);
  };

  // Handle Stack Range Min/Max
  const handleRangeChange = (type: 'min' | 'max', val: number) => {
    const current = config.chipsPerStackRange || { min: 3, max: 8 };
    if (type === 'min') {
      const minVal = Math.min(val, current.max);
      handleChange('chipsPerStackRange', { ...current, min: minVal });
    } else {
      const maxVal = Math.max(val, current.min);
      handleChange('chipsPerStackRange', { ...current, max: maxVal });
    }
  };

  // Toggle individual slot lock
  const handleToggleSlotLock = (index: number) => {
    const lockedSet = new Set<number>(
      config.lockedSlotIndices ?? 
      Array.from({ length: TOTAL_SLOTS_COUNT - config.openedStackCount }, (_, i) => config.openedStackCount + i)
    );

    if (lockedSet.has(index)) {
      lockedSet.delete(index);
    } else {
      lockedSet.add(index);
    }

    const newLockedArray = Array.from(lockedSet).sort((a, b) => a - b);
    const newOpenedCount = TOTAL_SLOTS_COUNT - newLockedArray.length;

    onChangeConfig({
      ...config,
      lockedSlotIndices: newLockedArray,
      openedStackCount: newOpenedCount
    });
  };

  // Handle Merge Scores change
  const handleScoreChange = (level: number, points: number) => {
    const currentScores = { ...(config.mergeScores || DEFAULT_MERGE_SCORES) };
    currentScores[level.toString()] = points;
    handleChange('mergeScores', currentScores);
  };

  // Load Preset
  const handleLoadPreset = (preset: LevelConfig) => {
    onChangeConfig({ ...preset });
  };

  const lockedIndices = new Set<number>(
    config.lockedSlotIndices ?? 
    Array.from({ length: TOTAL_SLOTS_COUNT - config.openedStackCount }, (_, i) => config.openedStackCount + i)
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-slate-200 overflow-y-auto shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Level Configuration</h2>
            <p className="text-xs text-slate-400">Design parameters & spawn rules</p>
          </div>
        </div>

        {/* Generate / Apply Button */}
        <button
          onClick={onApplyGenerate}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Apply & Generate
        </button>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" /> Quick Presets:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_LEVELS.map((preset) => (
            <button
              key={preset.levelNumber}
              onClick={() => handleLoadPreset(preset)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition ${
                config.levelNumber === preset.levelNumber && config.colorCount === preset.colorCount
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Level {preset.levelNumber} ({preset.colorCount} Colors)
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 mb-4 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'general'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          General Params
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'slots'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Slot Locks ({TOTAL_SLOTS_COUNT - lockedIndices.size} Open)
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'scoring'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Merge Scores Table
        </button>
      </div>

      {/* Tab: General Parameters */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          
          {/* Level Number & Random Seed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Level Number
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={config.levelNumber}
                onChange={(e) => handleChange('levelNumber', parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Random Seed
                </label>
                <button
                  onClick={handleRandomSeed}
                  title="Generate Random Seed"
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                >
                  <Dices className="w-3 h-3" /> Roll
                </button>
              </div>
              <input
                type="number"
                value={config.randomSeed}
                onChange={(e) => handleChange('randomSeed', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Count (1 - 10) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-300">
                Color Count (Levels 1 to {config.colorCount})
              </span>
              <span className="text-xs font-black text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {config.colorCount} Colors
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={config.colorCount}
              onChange={(e) => handleChange('colorCount', parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            {/* Color spectrum preview */}
            <div className="flex gap-1 mt-1.5">
              {Array.from({ length: config.colorCount }, (_, i) => i + 1).map((lvl) => (
                <div
                  key={lvl}
                  style={{ backgroundColor: COIN_THEMES[lvl]?.bgColor || '#40c057' }}
                  className="flex-1 h-3 rounded-sm flex items-center justify-center text-[8px] font-black text-white"
                  title={`Level ${lvl}`}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>

          {/* Initial Chip Count */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-300">
                Initial Chip Count (At start)
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {config.initialChipCount} Coins
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="80"
              value={config.initialChipCount}
              onChange={(e) => handleChange('initialChipCount', parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Deal Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Deal Chip Count
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.dealChipCount}
                  onChange={(e) => handleChange('dealChipCount', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Total chips added per deal</p>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Deal Max Chip Count
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.dealMaxChipCount}
                onChange={(e) => handleChange('dealMaxChipCount', parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">Max chunk per slot</p>
            </div>
          </div>

          {/* Chips Per Stack Range (Min, Max) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-300">
                Chips Per Stack Range (Deal sub-stack size)
              </span>
              <span className="text-xs font-mono text-cyan-300">
                Min: {config.chipsPerStackRange?.min || 3} - Max: {config.chipsPerStackRange?.max || 8}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-[10px] text-slate-400">Min Stack</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.chipsPerStackRange?.min || 3}
                  onChange={(e) => handleRangeChange('min', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max Stack</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.chipsPerStackRange?.max || 8}
                  onChange={(e) => handleRangeChange('max', parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
                />
              </div>
            </div>
          </div>

          {/* Required Chip Score (Win condition) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-300">
                Required Chip Score (Goal to Win)
              </span>
              <span className="text-xs font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                {config.requiredChipScore} PTS
              </span>
            </div>
            <input
              type="number"
              min="10"
              max="10000"
              step="10"
              value={config.requiredChipScore}
              onChange={(e) => handleChange('requiredChipScore', parseInt(e.target.value) || 100)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-black text-amber-300"
            />
          </div>
        </div>
      )}

      {/* Tab: Slot Locks */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Click on any of the 10 slots below to toggle between <b>Open</b> and <b>Locked</b>.
          </p>

          <div className="grid grid-cols-5 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            {Array.from({ length: TOTAL_SLOTS_COUNT }, (_, i) => {
              const isLocked = lockedIndices.has(i);
              return (
                <button
                  key={i}
                  onClick={() => handleToggleSlotLock(i)}
                  className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                    isLocked
                      ? 'bg-slate-900 border-dashed border-rose-500/80 text-rose-400'
                      : 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-sm'
                  }`}
                >
                  {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  <span className="text-[11px] font-black">Slot #{i + 1}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold">
                    {isLocked ? 'Locked' : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            Current Opened Slots: <b className="text-emerald-400">{TOTAL_SLOTS_COUNT - lockedIndices.size} / 10</b>
          </div>
        </div>
      )}

      {/* Tab: Merge Scoring Table */}
      {activeTab === 'scoring' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Set points awarded when 10 coins of a specific level merge into 2 higher-level coins:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
              const theme = COIN_THEMES[lvl];
              const scoreMap = config.mergeScores || DEFAULT_MERGE_SCORES;
              const currentScore = scoreMap[lvl.toString()] ?? (lvl * 15);

              return (
                <div
                  key={lvl}
                  className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: theme.bgColor }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
                    >
                      {lvl}
                    </div>
                    <span className="text-xs font-bold text-slate-300">Level {lvl}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={currentScore}
                      onChange={(e) => handleScoreChange(lvl, parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-amber-300 text-right"
                    />
                    <span className="text-[10px] text-slate-400">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
