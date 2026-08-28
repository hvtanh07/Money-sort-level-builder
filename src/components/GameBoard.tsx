import React, { useState } from 'react';
import { GameState, SlotState } from '../core/types';
import { canMove, getTopContiguousGroup, executeMove, undoMove } from '../core/gameEngine';
import { executeDeal } from '../core/dealEngine';
import { BanknoteStack } from './BanknoteStack';
import { ScorePopup } from './ScorePopup';
import { WinModal } from './WinModal';
import { sound } from '../core/sound';
import {
  RotateCcw,
  Undo2,
  Layers,
  Volume2,
  VolumeX,
  AlertCircle,
  Play,
  Hammer,
  Gamepad2
} from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  onStateChange: (newState: GameState) => void;
  onRestart: () => void;
  onNextLevel?: () => void;
  isPlaytestMode?: boolean;
  onTogglePlaytestMode?: () => void;
  onToggleSlotLock?: (slotIndex: number) => void;
  onUnlockSlotInPlaytest?: (slotIndex: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onStateChange,
  onRestart,
  onNextLevel,
  isPlaytestMode = false,
  onTogglePlaytestMode,
  onToggleSlotLock,
  onUnlockSlotInPlaytest,
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [dealAnimationActive, setDealAnimationActive] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Toggle Sound
  const toggleAudio = () => {
    sound.enabled = audioMuted;
    setAudioMuted(!audioMuted);
  };

  // Handle Slot Selection and Moving
  const handleSlotClick = (clickedIndex: number) => {
    // If in Design Mode, do not play test
    if (!isPlaytestMode) {
      sound.playTap();
      setHintMessage('🛠️ Design Mode: Switch to Playtest Mode to play!');
      setTimeout(() => setHintMessage(null), 2500);
      return;
    }

    const clickedSlot = gameState.slots[clickedIndex];

    // If no slot is currently selected
    if (selectedSlotIndex === null) {
      if (clickedSlot.isLocked) {
        sound.playError();
        setHintMessage(`Slot #${clickedIndex + 1} is locked!`);
        setTimeout(() => setHintMessage(null), 2000);
        return;
      }

      if (clickedSlot.coins.length === 0) {
        return; // Nothing to select in empty slot
      }

      // Select this slot
      setSelectedSlotIndex(clickedIndex);
      sound.playTap();
      return;
    }

    // A slot was already selected
    const sourceIndex = selectedSlotIndex;

    // Deselect if tapping the same slot
    if (sourceIndex === clickedIndex) {
      setSelectedSlotIndex(null);
      sound.playTap();
      return;
    }

    const sourceSlot = gameState.slots[sourceIndex];
    const targetSlot = clickedSlot;

    if (targetSlot.isLocked) {
      sound.playError();
      setHintMessage(`Slot #${clickedIndex + 1} is locked!`);
      setTimeout(() => setHintMessage(null), 2000);
      return;
    }

    // Check if move is valid
    const moveCheck = canMove(sourceSlot, targetSlot);

    if (moveCheck.valid) {
      // Execute the move!
      const nextState = executeMove(gameState, sourceIndex, targetIndexSlot(clickedIndex));
      setSelectedSlotIndex(null);
      
      if (nextState.lastMergeEvents && nextState.lastMergeEvents.length > 0) {
        sound.playMerge();
      } else {
        sound.playTap();
      }

      onStateChange(nextState);
    } else {
      // If target slot is not empty and has coins of a different level, switch selection to clicked slot!
      if (targetSlot.coins.length > 0) {
        setSelectedSlotIndex(clickedIndex);
        sound.playTap();
      } else {
        sound.playError();
        setHintMessage(moveCheck.reason || 'Invalid Move');
        setTimeout(() => setHintMessage(null), 2000);
      }
    }
  };

  const targetIndexSlot = (idx: number) => idx;

  // Handle Deal Action
  const handleDeal = () => {
    if (!isPlaytestMode) {
      if (onTogglePlaytestMode) {
        onTogglePlaytestMode();
      }
      return;
    }

    if (gameState.isWon) return;

    setDealAnimationActive(true);
    sound.playDeal();

    const dealResult = executeDeal(gameState.slots, gameState.config);

    const nextState: GameState = {
      ...gameState,
      slots: dealResult.updatedSlots,
      dealsUsed: gameState.dealsUsed + 1,
      selectedSlotIndex: null,
    };

    onStateChange(nextState);

    setTimeout(() => {
      setDealAnimationActive(false);
    }, 400);
  };

  // Handle Undo
  const handleUndo = () => {
    if (!isPlaytestMode) return;
    if (gameState.history.length === 0) return;
    const restoredState = undoMove(gameState);
    setSelectedSlotIndex(null);
    sound.playTap();
    onStateChange(restoredState);
  };

  // Calculate Progress towards Required Score
  const scorePercent = Math.min(
    100,
    Math.floor((gameState.score / gameState.config.requiredChipScore) * 100)
  );

  // Identify valid target slots for currently selected slot
  const selectedSlot = selectedSlotIndex !== null ? gameState.slots[selectedSlotIndex] : null;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl mx-auto h-full min-h-[750px] p-3 sm:p-4 bg-gradient-to-b from-sky-600 via-sky-700 to-blue-900 rounded-3xl shadow-2xl border-4 border-sky-400/50 relative overflow-hidden select-none">
      
      {/* Top Header HUD */}
      <div className="w-full flex items-center justify-between gap-2 px-2 py-1 mb-2 z-10">
        
        {/* Level Star Badge & Mode Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-400/50 shadow-md">
            <div className="w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-950 text-sm shadow">
              ★
            </div>
            <div className="text-xs font-black text-amber-300 tracking-wide uppercase">
              LVL {gameState.config.levelNumber}
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow border ${
              isPlaytestMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
            }`}
          >
            {isPlaytestMode ? '🎮 PLAYTEST' : '🛠️ PREVIEW (DESIGN)'}
          </div>
        </div>

        {/* Progress Bar (% to Target Score) */}
        <div className="flex-1 max-w-xs flex flex-col items-center">
          <div className="w-full bg-slate-950/80 rounded-full h-6 p-1 border border-sky-300/40 relative shadow-inner overflow-hidden flex items-center">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 rounded-full transition-all duration-500 shadow-glow-gold"
              style={{ width: `${scorePercent}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow tracking-wider">
              {scorePercent}% ({gameState.score} / {gameState.config.requiredChipScore} PTS)
            </span>
          </div>
        </div>

        {/* Action Controls (Sound, Undo, Restart) */}
        <div className="flex items-center gap-1.5">
          {onTogglePlaytestMode && (
            <button
              onClick={onTogglePlaytestMode}
              className={`text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition shadow ${
                isPlaytestMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              }`}
              title={isPlaytestMode ? 'Switch to Design Mode' : 'Switch to Playtest Mode'}
            >
              {isPlaytestMode ? (
                <>
                  <Hammer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Design</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Playtest</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={toggleAudio}
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700 shadow transition"
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleUndo}
            disabled={!isPlaytestMode || gameState.history.length === 0}
            title="Undo Move"
            className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 text-slate-200 flex items-center justify-center border border-slate-700 shadow transition relative"
          >
            <Undo2 className="w-4 h-4" />
            {gameState.history.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {gameState.history.length}
              </span>
            )}
          </button>

          <button
            onClick={onRestart}
            title="Restart Level"
            className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700 shadow transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Hint / Warning Toast Banner */}
      {hintMessage && (
        <div className="absolute top-16 z-30 bg-rose-500 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg border border-rose-300 flex items-center gap-1.5 animate-bounce">
          <AlertCircle className="w-4 h-4" /> {hintMessage}
        </div>
      )}

      {/* Main 5 x 2 Grid Board */}
      <div className="w-full flex-1 flex flex-col justify-center my-1">
        
        {/* Top Row: Slots 1 to 5 */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-2.5">
          {gameState.slots.slice(0, 5).map((slot: SlotState) => {
            const isSelected = selectedSlotIndex === slot.index;
            const isValidTarget =
              isPlaytestMode &&
              selectedSlotIndex !== null &&
              selectedSlotIndex !== slot.index &&
              !slot.isLocked &&
              canMove(gameState.slots[selectedSlotIndex], slot).valid;

            return (
              <BanknoteStack
                key={`slot_${slot.index}`}
                slot={slot}
                isSelected={isSelected}
                isValidTarget={isValidTarget}
                isPlaytestMode={isPlaytestMode}
                onSelectSlot={handleSlotClick}
                onToggleLock={onToggleSlotLock}
                onUnlockInPlaytest={onUnlockSlotInPlaytest}
              />
            );
          })}
        </div>

        {/* Bottom Row: Slots 6 to 10 */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {gameState.slots.slice(5, 10).map((slot: SlotState) => {
            const isSelected = selectedSlotIndex === slot.index;
            const isValidTarget =
              isPlaytestMode &&
              selectedSlotIndex !== null &&
              selectedSlotIndex !== slot.index &&
              !slot.isLocked &&
              canMove(gameState.slots[selectedSlotIndex], slot).valid;

            return (
              <BanknoteStack
                key={`slot_${slot.index}`}
                slot={slot}
                isSelected={isSelected}
                isValidTarget={isValidTarget}
                isPlaytestMode={isPlaytestMode}
                onSelectSlot={handleSlotClick}
                onToggleLock={onToggleSlotLock}
                onUnlockInPlaytest={onUnlockSlotInPlaytest}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Controls & Big Deal Button */}
      <div className="w-full flex flex-col items-center gap-2 mt-2 z-10">
        
        {/* Selected Stack Details Banner */}
        {selectedSlot && selectedSlot.coins.length > 0 && (
          <div className="w-full bg-slate-900/90 border border-cyan-500/50 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-cyan-300 shadow-lg animate-deal-pop">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">
                SELECTED
              </span>
              <span>
                Slot #{selectedSlot.index + 1}: {getTopContiguousGroup(selectedSlot)?.count}x Level {getTopContiguousGroup(selectedSlot)?.level} Notes
              </span>
            </div>
            <button
              onClick={() => setSelectedSlotIndex(null)}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Deal Button */}
        <button
          onClick={handleDeal}
          disabled={isPlaytestMode && gameState.isWon}
          className={`w-full max-w-sm py-4 px-8 rounded-2xl bg-gradient-to-t ${
            isPlaytestMode
              ? 'from-emerald-600 via-emerald-500 to-green-400 hover:from-emerald-500 hover:to-green-300 border-emerald-800'
              : 'from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 border-blue-800'
          } active:translate-y-1 text-white font-black text-xl tracking-wider uppercase border-b-4 shadow-3d flex items-center justify-center gap-3 transition-all ${
            dealAnimationActive ? 'scale-95' : 'hover:scale-[1.02]'
          } disabled:opacity-50`}
        >
          {isPlaytestMode ? (
            <>
              <Layers className="w-7 h-7 text-emerald-100" />
              <span>DEAL (+{gameState.config.dealChipCount})</span>
            </>
          ) : (
            <>
              <Gamepad2 className="w-7 h-7 text-cyan-100" />
              <span>START PLAYTEST</span>
            </>
          )}
        </button>

        {/* Quick Footer Stats */}
        <div className="flex items-center justify-between w-full text-[11px] text-sky-200 font-semibold px-2">
          <span>Moves: <b className="text-white">{gameState.movesCount}</b></span>
          <span>Seed: <b className="text-white font-mono">{gameState.config.randomSeed}</b></span>
          <span>Deals Made: <b className="text-white">{gameState.dealsUsed}</b></span>
        </div>
      </div>

      {/* Floating Score Popups & Win Celebration Modal */}
      <ScorePopup events={gameState.lastMergeEvents || []} />
      <WinModal state={gameState} onRestart={onRestart} onNextLevel={onNextLevel} />
    </div>
  );
};
