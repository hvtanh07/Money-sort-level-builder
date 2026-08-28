import React, { useEffect, useState } from 'react';
import { MergeEvent } from '../core/types';
import { Sparkles } from 'lucide-react';

interface ScorePopupProps {
  events: MergeEvent[];
}

export const ScorePopup: React.FC<ScorePopupProps> = ({ events }) => {
  const [activePopups, setActivePopups] = useState<MergeEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      setActivePopups(prev => [...prev, ...events]);
      const timer = setTimeout(() => {
        setActivePopups([]);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [events]);

  if (activePopups.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {activePopups.map((ev, i) => (
        <div
          key={`${ev.timestamp}_${i}`}
          className="animate-float-score bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-2xl px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.9)] border-2 border-white flex items-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-amber-900 fill-amber-900" />
          <span>+{ev.gainedScore} PTS!</span>
          <span className="text-xs bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full">
            MERGE Lv.{ev.fromLevel} ➜ Lv.{ev.toLevel}
          </span>
        </div>
      ))}
    </div>
  );
};
