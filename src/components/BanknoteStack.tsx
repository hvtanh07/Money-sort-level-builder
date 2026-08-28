import React from 'react';
import { SlotState, COIN_THEMES, MAX_SLOT_CAPACITY, CoinData } from '../core/types';
import { getTopContiguousGroup } from '../core/gameEngine';
import { Lock, Sparkles } from 'lucide-react';

interface BanknoteStackProps {
  slot: SlotState;
  isSelected: boolean;
  isValidTarget: boolean;
  isPlaytestMode?: boolean;
  onSelectSlot: (slotIndex: number) => void;
  onToggleLock?: (slotIndex: number) => void;
  onUnlockInPlaytest?: (slotIndex: number) => void;
}

export const BanknoteStack: React.FC<BanknoteStackProps> = ({
  slot,
  isSelected,
  isValidTarget,
  isPlaytestMode = false,
  onSelectSlot,
  onToggleLock,
  onUnlockInPlaytest,
}) => {
  const topGroup = !slot.isLocked ? getTopContiguousGroup(slot) : null;
  const isFull = slot.coins.length >= MAX_SLOT_CAPACITY;
  const coinCount = slot.coins.length;

  const handleClick = () => {
    if (slot.isLocked) {
      if (isPlaytestMode && onUnlockInPlaytest) {
        onUnlockInPlaytest(slot.index);
      } else if (!isPlaytestMode && onToggleLock) {
        onToggleLock(slot.index);
      }
      return;
    }
    onSelectSlot(slot.index);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full h-[280px] rounded-2xl p-2 flex flex-col justify-end items-center cursor-pointer transition-all duration-200 select-none ${
        slot.isLocked
          ? 'bg-slate-800/80 border-2 border-dashed border-slate-600/60 shadow-inner hover:border-slate-500'
          : isSelected
          ? 'bg-sky-950/70 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
          : isValidTarget
          ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
          : 'bg-slate-800/90 border-2 border-slate-700/80 hover:border-slate-500 shadow-md'
      }`}
    >
      {/* Slot Index & Capacity Badge */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[11px] font-bold text-slate-400 z-20 pointer-events-none">
        <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
          #{slot.index + 1}
        </span>
        {!slot.isLocked && (
          <span
            className={`px-1.5 py-0.5 rounded border text-[10px] ${
              isFull
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-300'
            }`}
          >
            {coinCount}/{MAX_SLOT_CAPACITY}
          </span>
        )}
      </div>

      {/* Target indicator ring */}
      {isValidTarget && (
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 pointer-events-none flex items-center justify-center">
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Place Here
          </div>
        </div>
      )}

      {/* Locked Slot Display */}
      {slot.isLocked ? (
        <div className="flex flex-col items-center justify-center h-full w-full gap-2 text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition">
            <Lock className="w-6 h-6 text-slate-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Locked
          </span>
          {isPlaytestMode && onUnlockInPlaytest ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlockInPlaytest(slot.index);
              }}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition"
              title="Unlock this slot for current playtest session only (level config remains 8 slots)"
            >
              🔓 Unlock (Playtest)
            </button>
          ) : onToggleLock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(slot.index);
              }}
              className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-0.5 rounded transition"
              title="Toggle slot lock in level configuration"
            >
              Unlock (Config)
            </button>
          ) : null}
        </div>
      ) : coinCount === 0 ? (
        /* Empty Slot Tray */
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700/50 rounded-xl">
          <span className="text-xs font-medium">Empty Slot</span>
        </div>
      ) : (
        /* Stack of Banknotes */
        <div className="relative w-full h-[220px] flex flex-col justify-end items-center pb-1">
          {slot.coins.map((coin: CoinData, idx: number) => {
            const theme = COIN_THEMES[coin.level] || COIN_THEMES[1];
            
            // Check if this coin belongs to the top contiguous group
            const isCoinInTopGroup = isSelected && topGroup && idx >= slot.coins.length - topGroup.count;

            // Compute vertical offset (isometric overlapping stack effect)
            // Each banknote is ~32px high, overlapping so 10 fit within 220px height
            const bottomOffset = idx * 18;
            const liftOffset = isCoinInTopGroup ? 14 : 0;

            return (
              <div
                key={coin.id || idx}
                style={{
                  bottom: `${bottomOffset + liftOffset}px`,
                  zIndex: idx + 5 + (isCoinInTopGroup ? 20 : 0),
                  backgroundColor: theme.bgColor,
                  borderColor: theme.borderColor,
                }}
                className={`absolute w-[92%] h-[34px] rounded-lg border-2 shadow-md flex items-center justify-between px-2.5 transition-all duration-200 ${
                  isCoinInTopGroup
                    ? 'ring-2 ring-white scale-105 shadow-xl brightness-110'
                    : 'hover:brightness-105'
                } ${coin.isNew ? 'animate-deal-pop' : ''} ${
                  coin.isMerging ? 'animate-merge-glow' : ''
                }`}
              >
                {/* Banknote Watermark / Level Pill Left */}
                <div
                  style={{ backgroundColor: theme.badgeBg }}
                  className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs text-white shadow-inner border border-white/30"
                >
                  {theme.valueLabel}
                </div>

                {/* Banknote Center Graphics */}
                <div className="flex-1 flex items-center justify-center gap-1 px-1">
                  <div className="h-[2px] w-3 bg-white/40 rounded"></div>
                  <div className="text-[11px] font-black tracking-wider uppercase text-white/90 drop-shadow">
                    LEVEL {coin.level}
                  </div>
                  <div className="h-[2px] w-3 bg-white/40 rounded"></div>
                </div>

                {/* Banknote Value Pill Right */}
                <div
                  style={{ backgroundColor: theme.badgeBg }}
                  className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs text-white shadow-inner border border-white/30"
                >
                  {theme.valueLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
