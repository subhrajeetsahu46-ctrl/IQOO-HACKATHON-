import React from 'react';
import {
  Camera,
  Mic,
  Laptop,
  Clipboard,
  Play,
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  History,
  Info,
} from 'lucide-react';
import { AnalysisMode, SecretMatch } from '../types';
import { SAMPLE_TEST_CASES, SampleTestCase } from '../engine/sampleDataset';
import { triggerHaptic } from '../utils/haptics';

interface HomeScreenProps {
  inputText: string;
  onInputChange: (text: string) => void;
  detectedMode: AnalysisMode;
  detectedSecrets: SecretMatch[];
  onAnalyze: () => void;
  onOpenPaste: () => void;
  onOpenCamera: () => void;
  onOpenVoice: () => void;
  onOpenOfficeKit: () => void;
  onOpenHistory: () => void;
  onSelectSample: (sample: SampleTestCase) => void;
  isAnalyzing: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  inputText,
  onInputChange,
  detectedMode,
  detectedSecrets,
  onAnalyze,
  onOpenPaste,
  onOpenCamera,
  onOpenVoice,
  onOpenOfficeKit,
  onOpenHistory,
  onSelectSample,
  isAnalyzing,
}) => {
  const hasSecrets = detectedSecrets.length > 0;

  const modeTagColor = {
    DEBUG: 'text-red-400 border-red-800/80 bg-red-950/40',
    REGEX_COMMAND: 'text-indigo-400 border-indigo-800/80 bg-indigo-950/40',
    EXPLAIN: 'text-sky-400 border-sky-800/80 bg-sky-950/40',
  }[detectedMode];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 py-3 max-w-2xl mx-auto w-full">
      {/* Top Bar / App Title & History */}
      <div className="flex items-center justify-between pb-2 mb-2">
        <div>
          <h1 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-2">
            <span>Offline Developer Copilot</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-neutral-400">
            On-device error debugger & code explainer • Zero cloud reliance
          </p>
        </div>

        <button
          type="button"
          id="open-history-btn"
          onClick={onOpenHistory}
          title="Analysis History"
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>

      {/* FR-01: Primary Text Input Container */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-neutral-950 rounded-2xl border border-neutral-800/90 shadow-lg focus-within:border-neutral-700 transition-all overflow-hidden relative">
        {/* Status Bar inside Editor Header */}
        <div className="px-3.5 py-2 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-[11px] font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">INPUT PIPELINE:</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${modeTagColor}`}>
              {detectedMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasSecrets && (
              <span className="flex items-center gap-1 text-amber-400 font-medium animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Secret Flagged</span>
              </span>
            )}
            <span className="text-neutral-500">{inputText.length} chars</span>
            {inputText.length > 0 && (
              <button
                type="button"
                id="clear-input-btn"
                onClick={() => {
                  onInputChange('');
                  triggerHaptic('light');
                }}
                className="text-neutral-500 hover:text-neutral-300 p-0.5 rounded"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          id="primary-code-input"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={`Enter or paste compiler errors, stack traces, or code...
e.g.:
TypeError: unsupported operand type(s) for +: 'int' and 'str'
or
java.lang.NullPointerException at UserManager.java:28
or
grep -rni "TODO" /src`}
          className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none resize-none leading-relaxed overflow-y-auto"
        />

        {/* FR-01 Input Modality Toolbar (Clean horizontal bar, avoiding feature grid) */}
        <div className="p-2.5 bg-neutral-900/40 border-t border-neutral-800/70 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Input Modalities */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              id="paste-code-btn"
              onClick={onOpenPaste}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-medium border border-neutral-700/60 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5 text-sky-400" />
              <span>Paste</span>
            </button>

            <button
              type="button"
              id="camera-scan-btn"
              onClick={onOpenCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-medium border border-neutral-700/60 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera Scan</span>
            </button>

            <button
              type="button"
              id="voice-input-btn"
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-medium border border-neutral-700/60 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>Voice</span>
            </button>

            <button
              type="button"
              id="office-kit-btn"
              onClick={onOpenOfficeKit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-medium border border-neutral-700/60 transition-colors"
            >
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span>Laptop</span>
            </button>
          </div>

          {/* Analyze Primary CTA */}
          <button
            type="button"
            id="analyze-btn"
            onClick={() => {
              triggerHaptic('medium');
              onAnalyze();
            }}
            disabled={isAnalyzing || !inputText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all ml-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze (Local)'}</span>
          </button>
        </div>
      </div>

      {/* Quick Tested Sample Chips (PRD Section 20 Fixed Error Dataset) */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>TESTED ERROR SAMPLES (1-CLICK LOAD):</span>
          <span className="text-neutral-500">Snapdragon NPU Benchmark Set</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TEST_CASES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                onSelectSample(sample);
                triggerHaptic('light');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white transition-colors text-left"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Specs Note */}
      <div className="mt-auto pt-3 text-center text-[10px] text-neutral-500 font-mono">
        Inference engine: MediaPipe On-Device • INT4 Quantized • Zero network requests
      </div>
    </div>
  );
};
