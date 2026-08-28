import React, { useState, useEffect } from 'react';
import { LevelConfig, DEFAULT_MERGE_SCORES } from '../core/types';
import {
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle,
  FileJson,
  Sparkles
} from 'lucide-react';

interface JsonManagerProps {
  config: LevelConfig;
  onApplyConfig: (newConfig: LevelConfig) => void;
}

export const JsonManager: React.FC<JsonManagerProps> = ({
  config,
  onApplyConfig,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state with incoming config
  useEffect(() => {
    // Format JSON according to user specification
    const exportData = {
      levelNumber: config.levelNumber,
      openedStackCount: config.openedStackCount,
      chipsPerLevel: config.chipsPerLevel || { "1": 10, "2": 6, "3": 4 },
      dealChipCount: config.dealChipCount,
      maxDealChipLevel: config.maxDealChipLevel || 5,
      requiredChipScore: config.requiredChipScore,
      chipsPerStackRange: config.chipsPerStackRange || { min: 1, max: 2 },
      randomSeed: config.randomSeed,
      ...(config.mergeScores ? { mergeScores: config.mergeScores } : {}),
      ...(config.lockedSlotIndices ? { lockedSlotIndices: config.lockedSlotIndices } : {})
    };

    setJsonText(JSON.stringify(exportData, null, 2));
  }, [config]);

  // Copy JSON to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON file
  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level_${config.levelNumber}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        validateAndApply(parsed);
      } catch {
        setErrorMsg('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Validate and apply JSON
  const validateAndApply = (data: unknown) => {
    try {
      const obj = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Basic validation
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('Config must be a JSON object');
      }

      const raw = obj as Record<string, unknown>;
      const rawRange = (raw.chipsPerStackRange || {}) as Record<string, unknown>;

      // Parse chipsPerLevel
      let parsedChipsMap: Record<string, number> = { "1": 10 };
      if (raw.chipsPerLevel && typeof raw.chipsPerLevel === 'object') {
        parsedChipsMap = {};
        for (const [k, v] of Object.entries(raw.chipsPerLevel as Record<string, unknown>)) {
          const num = Number(v);
          if (!isNaN(num) && num > 0) {
            parsedChipsMap[k] = num;
          }
        }
      }

      const validConfig: LevelConfig = {
        levelNumber: Number(raw.levelNumber) || 1,
        openedStackCount: Math.min(10, Math.max(1, Number(raw.openedStackCount) || 8)),
        chipsPerLevel: parsedChipsMap,
        dealChipCount: Math.max(1, Number(raw.dealChipCount) || 5),
        maxDealChipLevel: Math.min(10, Math.max(1, Number(raw.maxDealChipLevel) || 5)),
        requiredChipScore: Math.max(10, Number(raw.requiredChipScore) || 100),
        chipsPerStackRange: {
          min: Number(rawRange.min) || 1,
          max: Number(rawRange.max) || 2
        },
        randomSeed: Number(raw.randomSeed) || 12345,
        mergeScores: (raw.mergeScores as LevelConfig['mergeScores']) || DEFAULT_MERGE_SCORES,
        lockedSlotIndices: Array.isArray(raw.lockedSlotIndices) ? (raw.lockedSlotIndices as number[]) : undefined
      };

      setErrorMsg(null);
      setSuccessMsg('Config parsed & applied successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
      onApplyConfig(validConfig);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-slate-200 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">JSON Import / Export</h2>
            <p className="text-xs text-slate-400">Level configuration payload with chipsPerLevel</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            Download
          </button>

          <label className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="mb-2 p-2 bg-rose-950/80 border border-rose-600 rounded-lg text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-2 p-2 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Code Textarea */}
      <div className="flex-1 flex flex-col mb-3">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="flex-1 w-full min-h-[320px] bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed shadow-inner"
          spellCheck={false}
        />
      </div>

      {/* Apply Changes Button */}
      <button
        onClick={() => validateAndApply(jsonText)}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
      >
        <Sparkles className="w-4 h-4" /> Validate & Apply JSON to Level
      </button>
    </div>
  );
};
