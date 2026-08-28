import React, { useState } from 'react';
import { SlotState, COIN_THEMES, MAX_SLOT_CAPACITY } from '../core/types';
import { createUniqueCoin } from '../core/levelGenerator';
import { sound } from '../core/sound';
import { Trash2, ArrowUp, ArrowDown, Layers } from 'lucide-react';

interface SlotCustomizerProps {
  slots: SlotState[];
  onUpdateSlots: (newSlots: SlotState[]) => void;
}

export const SlotCustomizer: React.FC<SlotCustomizerProps> = ({
  slots,
  onUpdateSlots,
}) => {
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);

  const currentSlot = slots[activeSlotIdx] || slots[0];

  // Add coin to active slot
  const handleAddCoin = (level: number) => {
    if (currentSlot.coins.length >= MAX_SLOT_CAPACITY) {
      sound.playError();
      return;
    }

    const updated = slots.map((s, idx) => {
      if (idx === activeSlotIdx) {
        return {
          ...s,
          coins: [...s.coins, createUniqueCoin(level)]
        };
      }
      return s;
    });

    sound.playTap();
    onUpdateSlots(updated);
  };

  // Remove specific coin from active slot
  const handleRemoveCoin = (coinIdx: number) => {
    const updated = slots.map((s, idx) => {
      if (idx === activeSlotIdx) {
        const nextCoins = [...s.coins];
        nextCoins.splice(coinIdx, 1);
        return { ...s, coins: nextCoins };
      }
      return s;
    });
    sound.playTap();
    onUpdateSlots(updated);
  };

  // Clear active slot
  const handleClearSlot = () => {
    const updated = slots.map((s, idx) => {
      if (idx === activeSlotIdx) {
        return { ...s, coins: [] };
      }
      return s;
    });
    sound.playTap();
    onUpdateSlots(updated);
  };

  // Move coin up/down in stack
  const handleMoveCoin = (coinIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? coinIdx + 1 : coinIdx - 1;
    if (targetIdx < 0 || targetIdx >= currentSlot.coins.length) return;

    const updated = slots.map((s, idx) => {
      if (idx === activeSlotIdx) {
        const nextCoins = [...s.coins];
        const temp = nextCoins[coinIdx];
        nextCoins[coinIdx] = nextCoins[targetIdx];
        nextCoins[targetIdx] = temp;
        return { ...s, coins: nextCoins };
      }
      return s;
    });
    sound.playTap();
    onUpdateSlots(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-slate-200 overflow-y-auto shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Manual Slot Editor</h2>
            <p className="text-xs text-slate-400">Fine-tune individual slot banknote stacks</p>
          </div>
        </div>
      </div>

      {/* Slot Selector Grid */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-400 mb-1.5">
          Select Slot to Edit:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {slots.map((s) => (
            <button
              key={s.index}
              onClick={() => setActiveSlotIdx(s.index)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeSlotIdx === s.index
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                  : s.isLocked
                  ? 'bg-slate-950 text-slate-500 border-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <span>#{s.index + 1}</span>
              <span className="text-[10px] opacity-80">
                {s.isLocked ? 'Lock' : `${s.coins.length}/10`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Slot Inspector */}
      <div className="flex-1 flex flex-col bg-slate-950/60 rounded-xl border border-slate-800 p-3 mb-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <span className="text-xs font-black text-white">
            Slot #{currentSlot.index + 1} ({currentSlot.coins.length} / {MAX_SLOT_CAPACITY} Coins)
          </span>
          <button
            onClick={handleClearSlot}
            disabled={currentSlot.coins.length === 0}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" /> Clear Slot
          </button>
        </div>

        {/* Stack List (Top to Bottom) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px] max-h-[220px]">
          {currentSlot.coins.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
              Empty stack - click a level below to add coins
            </div>
          ) : (
            currentSlot.coins.map((coin, i) => {
              const theme = COIN_THEMES[coin.level] || COIN_THEMES[1];
              return (
                <div
                  key={coin.id || i}
                  className="flex items-center justify-between p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-4">
                      #{i + 1}
                    </span>
                    <div
                      style={{ backgroundColor: theme.bgColor }}
                      className="w-5 h-5 rounded flex items-center justify-center font-black text-[11px] text-white shadow-sm"
                    >
                      {theme.valueLabel}
                    </div>
                    <span className="font-bold text-slate-300">
                      Level {coin.level} Note
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveCoin(i, 'down')}
                      disabled={i === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move Down in Stack"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveCoin(i, 'up')}
                      disabled={i === currentSlot.coins.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move Up in Stack"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveCoin(i)}
                      className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Banknote Buttons */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1.5">
          + Add Banknote to Slot #{currentSlot.index + 1}:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
            const theme = COIN_THEMES[lvl];
            return (
              <button
                key={lvl}
                onClick={() => handleAddCoin(lvl)}
                disabled={currentSlot.coins.length >= MAX_SLOT_CAPACITY}
                style={{ backgroundColor: theme.bgColor }}
                className="h-9 rounded-lg border border-white/20 text-white font-black text-xs flex items-center justify-center gap-1 shadow hover:brightness-110 active:scale-95 transition disabled:opacity-40"
              >
                <span>+{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
