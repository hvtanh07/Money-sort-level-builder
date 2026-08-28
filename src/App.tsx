import React, { useState, useEffect, useCallback } from 'react';
import { LevelConfig, GameState, SlotState } from './core/types';
import { INITIAL_10_LEVELS } from './core/presets';
import { initGameState } from './core/gameEngine';
import { GameBoard } from './components/GameBoard';
import { ConfigEditor } from './components/ConfigEditor';
import { SlotCustomizer } from './components/SlotCustomizer';
import { JsonManager } from './components/JsonManager';
import { LevelTableManager } from './components/LevelTableManager';
import { GuidelinesViewer } from './components/GuidelinesViewer';
import {
  Sliders,
  Layers,
  FileJson,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dices,
  RotateCcw,
  Table,
  Maximize2,
  Minimize2
} from 'lucide-react';

const STORAGE_KEY = 'money_sort_levels_pack_v3';

// Ensures all levels have chipsPerLevel properly populated even if legacy cache exists
function validateAndHydrateLevels(rawList: unknown[]): LevelConfig[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return INITIAL_10_LEVELS;
  }

  return rawList.map((item: unknown, idx: number) => {
    const raw = (item || {}) as Record<string, unknown>;
    const defaultLvl = INITIAL_10_LEVELS[idx] || INITIAL_10_LEVELS[INITIAL_10_LEVELS.length - 1];

    let chipsMap = raw.chipsPerLevel as Record<string, number> | undefined;
    if (!chipsMap || typeof chipsMap !== 'object' || Object.keys(chipsMap).length === 0) {
      chipsMap = defaultLvl.chipsPerLevel;
    }

    return {
      levelNumber: Number(raw.levelNumber) || idx + 1,
      openedStackCount: Number(raw.openedStackCount) || defaultLvl.openedStackCount,
      chipsPerLevel: chipsMap,
      dealChipCount: Number(raw.dealChipCount) || defaultLvl.dealChipCount,
      maxDealChipLevel: Number(raw.maxDealChipLevel) || defaultLvl.maxDealChipLevel,
      requiredChipScore: Number(raw.requiredChipScore) || defaultLvl.requiredChipScore,
      chipsPerStackRange: (raw.chipsPerStackRange as LevelConfig['chipsPerStackRange']) || defaultLvl.chipsPerStackRange,
      randomSeed: Number(raw.randomSeed) || defaultLvl.randomSeed,
      mergeScores: (raw.mergeScores as LevelConfig['mergeScores']) || defaultLvl.mergeScores
    };
  });
}

export const App: React.FC = () => {
  // Load saved levels or default to INITIAL_10_LEVELS
  const [levels, setLevels] = useState<LevelConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return validateAndHydrateLevels(parsed);
      }
    } catch {
      // Fallback
    }
    return INITIAL_10_LEVELS;
  });

  // Current active level configuration
  const [config, setConfig] = useState<LevelConfig>(levels[0] || INITIAL_10_LEVELS[0]);

  // Game board state for playtesting
  const [gameState, setGameState] = useState<GameState>(() => initGameState(levels[0] || INITIAL_10_LEVELS[0]));

  // Active tab on right panel
  const [activeSideTab, setActiveSideTab] = useState<'table' | 'config' | 'customizer' | 'json' | 'guidelines'>('table');

  // Expanded Table Full-width view toggle
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

  // Sync levels array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    } catch {
      // Ignore
    }
  }, [levels]);

  // Regenerate level from current config
  const handleRegenerate = useCallback((cfg: LevelConfig) => {
    setConfig(cfg);
    const newGameState = initGameState(cfg);
    setGameState(newGameState);
  }, []);

  // Update a single level config from editor
  const handleConfigChange = (newConfig: LevelConfig) => {
    setConfig(newConfig);
    // Update in levels array as well
    setLevels(prev =>
      prev.map(lvl => (lvl.levelNumber === newConfig.levelNumber ? newConfig : lvl))
    );
  };

  // Apply config & regenerate
  const handleApplyGenerate = () => {
    handleRegenerate(config);
  };

  // Select level from Table or Selector
  const handleSelectLevel = (selected: LevelConfig) => {
    setConfig(selected);
    handleRegenerate(selected);
  };

  // Update all levels from LevelTableManager
  const handleUpdateLevels = (newLevels: LevelConfig[]) => {
    const validated = validateAndHydrateLevels(newLevels);
    setLevels(validated);
    // If current level was modified, update active config
    const match = validated.find(l => l.levelNumber === config.levelNumber);
    if (match) {
      setConfig(match);
      handleRegenerate(match);
    } else if (validated.length > 0) {
      setConfig(validated[0]);
      handleRegenerate(validated[0]);
    }
  };

  // Roll next random seed
  const handleRollSeed = () => {
    const nextSeed = Math.floor(Math.random() * 900000) + 10000;
    const updated = { ...config, randomSeed: nextSeed };
    handleConfigChange(updated);
    handleRegenerate(updated);
  };

  // Level Stepper
  const handleStepLevel = (delta: number) => {
    const currentIndex = levels.findIndex(l => l.levelNumber === config.levelNumber);
    const nextIndex = currentIndex !== -1 ? currentIndex + delta : 0;

    if (nextIndex >= 0 && nextIndex < levels.length) {
      const nextLevel = levels[nextIndex];
      handleSelectLevel(nextLevel);
    } else {
      const nextNum = Math.max(1, config.levelNumber + delta);
      const updated = {
        ...config,
        levelNumber: nextNum,
        randomSeed: config.randomSeed + delta * 12345
      };
      handleSelectLevel(updated);
    }
  };

  // Update slots from Manual Customizer
  const handleCustomSlotUpdate = (updatedSlots: SlotState[]) => {
    setGameState(prev => ({
      ...prev,
      slots: updatedSlots
    }));
  };

  // Toggle Slot Lock from Board or Config
  const handleToggleSlotLock = (slotIndex: number) => {
    const currentLocked = new Set<number>(
      config.lockedSlotIndices ?? 
      Array.from({ length: 10 - config.openedStackCount }, (_, i) => config.openedStackCount + i)
    );

    if (currentLocked.has(slotIndex)) {
      currentLocked.delete(slotIndex);
    } else {
      currentLocked.add(slotIndex);
    }

    const newLockedList = Array.from(currentLocked).sort((a, b) => a - b);
    const updated = {
      ...config,
      lockedSlotIndices: newLockedList,
      openedStackCount: 10 - newLockedList.length
    };
    handleConfigChange(updated);
    handleRegenerate(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-game">
      
      {/* Top Header Navbar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-lg z-30">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-md border-2 border-emerald-300">
            $
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
              Money Sort Level Builder
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold">
              Visual Designer, Multi-Level Table & Playtester
            </p>
          </div>
        </div>

        {/* Level Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => handleStepLevel(-1)}
            disabled={levels.findIndex(l => l.levelNumber === config.levelNumber) <= 0}
            title="Previous Level"
            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-black text-amber-400 px-2 text-center min-w-[80px]">
            LEVEL {config.levelNumber} / {levels.length}
          </div>

          <button
            onClick={() => handleStepLevel(1)}
            disabled={levels.findIndex(l => l.levelNumber === config.levelNumber) >= levels.length - 1}
            title="Next Level"
            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {activeSideTab === 'table' && (
            <button
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="hidden md:flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-2 rounded-xl border border-slate-700 transition shadow"
              title={isTableExpanded ? 'Split View' : 'Expand Table View'}
            >
              {isTableExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isTableExpanded ? 'Split' : 'Full Table'}</span>
            </button>
          )}

          <button
            onClick={handleRollSeed}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-2 rounded-xl border border-slate-700 transition shadow"
            title="Generate New Random Seed"
          >
            <Dices className="w-4 h-4" />
            <span>New Seed</span>
          </button>

          <button
            onClick={() => handleRegenerate(config)}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-2 rounded-xl border border-slate-700 transition shadow"
            title="Restart / Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-5 max-w-[1700px] w-full mx-auto">
        
        {/* Left Side: Game Board Playtester */}
        {!isTableExpanded && (
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center">
            <GameBoard
              gameState={gameState}
              onStateChange={setGameState}
              onRestart={() => handleRegenerate(config)}
              onNextLevel={() => handleStepLevel(1)}
              onToggleSlotLock={handleToggleSlotLock}
            />
          </div>
        )}

        {/* Right Side / Full Width: Tool Suite */}
        <div className={`${isTableExpanded ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-6'} flex flex-col h-[750px]`}>
          
          {/* Tool Suite Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-3 shadow-md">
            
            {/* Table Manager Tab */}
            <button
              onClick={() => setActiveSideTab('table')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'table'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Levels Table ({levels.length})</span>
            </button>

            {/* Single Config Editor Tab */}
            <button
              onClick={() => setActiveSideTab('config')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'config'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>

            {/* Manual Slot Customizer Tab */}
            <button
              onClick={() => setActiveSideTab('customizer')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'customizer'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Slot Editor</span>
            </button>

            {/* JSON Import/Export Tab */}
            <button
              onClick={() => setActiveSideTab('json')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'json'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {/* Guidelines Tab */}
            <button
              onClick={() => setActiveSideTab('guidelines')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'guidelines'
                  ? 'bg-purple-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guidelines</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-hidden">
            {activeSideTab === 'table' && (
              <LevelTableManager
                levels={levels}
                currentLevelNumber={config.levelNumber}
                onSelectLevel={handleSelectLevel}
                onUpdateLevels={handleUpdateLevels}
              />
            )}

            {activeSideTab === 'config' && (
              <ConfigEditor
                config={config}
                onChangeConfig={handleConfigChange}
                onApplyGenerate={handleApplyGenerate}
              />
            )}

            {activeSideTab === 'customizer' && (
              <SlotCustomizer
                slots={gameState.slots}
                onUpdateSlots={handleCustomSlotUpdate}
              />
            )}

            {activeSideTab === 'json' && (
              <JsonManager
                config={config}
                onApplyConfig={(newCfg) => {
                  handleConfigChange(newCfg);
                  handleRegenerate(newCfg);
                }}
              />
            )}

            {activeSideTab === 'guidelines' && (
              <GuidelinesViewer />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
