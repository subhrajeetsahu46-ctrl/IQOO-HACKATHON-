import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Cpu,
  Sparkles,
  ExternalLink,
  Code2,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AnalysisMode, ParsedLlmOutput, ResultStatus, SecretMatch } from '../types';
import { SecretWarningBanner } from './SecretWarningBanner';
import { triggerHaptic } from '../utils/haptics';

interface ResultScreenProps {
  status: ResultStatus;
  mode: AnalysisMode;
  inputSnippet: string;
  output?: ParsedLlmOutput;
  secrets: SecretMatch[];
  errorMessage?: string;
  latencyMs: number;
  tokensPerSec: number;
  retryCount: number;
  onBack: () => void;
  onRetry: () => void;
  onRedactInputSecrets?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  status,
  mode,
  inputSnippet,
  output,
  secrets,
  errorMessage,
  latencyMs,
  tokensPerSec,
  retryCount,
  onBack,
  onRetry,
  onRedactInputSecrets,
}) => {
  const [copiedFix, setCopiedFix] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);
  const [showRawInput, setShowRawInput] = useState(false);

  const handleCopyFix = () => {
    if (!output?.fix) return;
    navigator.clipboard.writeText(output.fix);
    setCopiedFix(true);
    triggerHaptic('success');
    setTimeout(() => setCopiedFix(false), 2000);
  };

  const handleCopyExplanation = () => {
    if (!output?.explanation) return;
    navigator.clipboard.writeText(output.explanation);
    setCopiedExplanation(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  const modeBadgeColor = {
    DEBUG: 'bg-red-950/60 text-red-300 border-red-800/80',
    REGEX_COMMAND: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80',
    EXPLAIN: 'bg-sky-950/60 text-sky-300 border-sky-800/80',
  }[mode];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-800/80">
        <button
          type="button"
          id="back-to-input-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${modeBadgeColor}`}>
            MODE: {mode}
          </span>
          {retryCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
              Retried (1x)
            </span>
          )}
        </div>
      </div>

      {/* STATE 1: LOADING */}
      {status === 'loading' && (
        <div className="my-auto flex flex-col items-center justify-center py-12 text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-2 border-sky-500 border-t-transparent animate-spin flex items-center justify-center">
              <Cpu className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-neutral-100">Running On-Device Inference...</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs font-mono">
            Snapdragon Hexagon NPU executing Gemma 3 INT4 weights locally. Network completely disconnected.
          </p>
          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target speed: ~46 tok/s</span>
          </div>
        </div>
      )}

      {/* STATE 2: NOT CONFIDENT (Uncertainty Handling) */}
      {status === 'not_confident' && (
        <div className="my-auto py-6">
          <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-5 mb-4 text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-amber-200">
                  Honest Uncertainty: Unable to determine fix
                </h3>
                <p className="text-xs text-amber-300/80 mt-1.5 leading-relaxed">
                  As required by the specification, the offline copilot refrains from hallucinating or fabricating certainty. The model evaluated your input, performed one internal retry, and confirmed it lacks sufficient context.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-neutral-950/60 rounded-xl border border-amber-900/50 text-xs font-mono text-neutral-300 space-y-1.5">
              <div className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">
                Tips to get an accurate fix:
              </div>
              <p>• Include the full compiler or runtime stack trace.</p>
              <p>• Include 3-5 lines of surrounding code around the failure.</p>
              <p>• Specify the language or framework if not obvious.</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                id="retry-analysis-btn"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Inference</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs transition-colors"
              >
                Refine Input Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: ERROR (System Failure) */}
      {status === 'error' && (
        <div className="my-auto py-6">
          <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-5 mb-4 text-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-red-200">Local System Failure</h3>
                <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                  {errorMessage || 'The on-device model engine encountered an unexpected runtime failure or memory exhaustion.'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                id="error-retry-btn"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-initialize Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: SUCCESS */}
      {status === 'success' && output && (
        <div className="space-y-4 pb-8">
          {/* Secret Warning Banner if regex matched */}
          <SecretWarningBanner secrets={secrets} onRedact={onRedactInputSecrets} />

          {/* Performance Pill: Latency + Tok/s (Observed 100% Offline) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-neutral-300">On-Device NPU:</span>
              <span className="text-emerald-400 font-semibold">{latencyMs} ms</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{tokensPerSec} tok/s</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">0 KB Network</span>
            </div>
          </div>

          {/* Collapsible Input Preview */}
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <button
              type="button"
              id="toggle-raw-input-btn"
              onClick={() => setShowRawInput(!showRawInput)}
              className="w-full px-3 py-2 text-left text-xs font-mono text-neutral-400 hover:text-neutral-200 flex items-center justify-between transition-colors"
            >
              <span>{showRawInput ? '▼ Hide original input' : '▶ View original input snippet'}</span>
              <span className="text-[10px] text-neutral-500">{inputSnippet.length} chars</span>
            </button>
            {showRawInput && (
              <pre className="p-3 bg-neutral-950 font-mono text-xs text-neutral-300 overflow-x-auto border-t border-neutral-800 whitespace-pre-wrap">
                {inputSnippet}
              </pre>
            )}
          </div>

          {/* Explanation Block (Sans-serif per PRD Section 14) */}
          <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Explanation</span>
              </div>
              <button
                type="button"
                id="copy-explanation-btn"
                onClick={handleCopyExplanation}
                title="Copy explanation"
                className="text-[11px] flex items-center gap-1 text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
              >
                {copiedExplanation ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedExplanation ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
              {output.explanation}
            </p>
          </section>

          {/* Fix Block (Monospace per PRD Section 14, Green highlight) */}
          <section className="bg-emerald-950/20 border border-emerald-800/60 rounded-2xl p-4 shadow-lg shadow-emerald-950/10">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Fix:</span>
              </div>
              <button
                type="button"
                id="copy-fix-btn"
                onClick={handleCopyFix}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                {copiedFix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFix ? 'Copied to Clipboard!' : 'Copy Fix'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
              <pre className="p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {output.fix}
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
