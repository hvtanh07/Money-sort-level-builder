import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight, Star, Sparkles } from 'lucide-react';
import { GameState } from '../core/types';
import { sound } from '../core/sound';

interface WinModalProps {
  state: GameState;
  onRestart: () => void;
  onNextLevel?: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({ state, onRestart, onNextLevel }) => {
  useEffect(() => {
    if (state.isWon) {
      sound.playWin();

      // Confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [state.isWon]);

  if (!state.isWon) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(250,204,21,0.4)] text-center relative overflow-hidden animate-deal-pop">
        
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>

        {/* Trophy Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border-4 border-white mb-4">
          <Trophy className="w-10 h-10 text-amber-950" />
          <Sparkles className="w-6 h-6 text-white absolute -top-1 -right-1 animate-spin" />
        </div>

        <h2 className="text-3xl font-black text-white tracking-wide mb-1 drop-shadow">
          LEVEL COMPLETE!
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Level {state.config.levelNumber} Target Score Achieved
        </p>

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center shadow">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
          <div className="w-14 h-14 -mt-2 rounded-2xl bg-amber-400/30 border-2 border-amber-300 flex items-center justify-center shadow-lg">
            <Star className="w-8 h-8 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center shadow">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 mb-6 text-slate-300">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold">Score</div>
            <div className="text-xl font-black text-amber-400">{state.score}</div>
          </div>
          <div className="border-x border-slate-700">
            <div className="text-[11px] text-slate-400 uppercase font-bold">Moves</div>
            <div className="text-xl font-black text-sky-400">{state.movesCount}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold">Deals</div>
            <div className="text-xl font-black text-emerald-400">{state.dealsUsed}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center gap-2 border border-slate-600 shadow transition"
          >
            <RotateCcw className="w-4 h-4" /> Replay
          </button>
          {onNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition scale-105"
            >
              Next Level <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
