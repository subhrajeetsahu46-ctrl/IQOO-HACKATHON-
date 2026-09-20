import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, WifiOff, Cpu, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface DemoPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemoStep: (sampleId: string) => void;
}

export const DemoPresentationModal: React.FC<DemoPresentationModalProps> = ({
  isOpen,
  onClose,
  onRunDemoStep,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    {
      title: 'Step 1: Disable Network',
      description: 'Turn off Wi-Fi and Mobile Data. Prove 0 packets leaving the device.',
      badge: 'Wi-Fi: OFF',
      icon: WifiOff,
    },
    {
      title: 'Step 2: Paste Real Error',
      description: 'Input Python TypeError or Java NullPointerException directly into pipeline.',
      badge: 'Input Normalization',
      icon: CheckCircle2,
    },
    {
      title: 'Step 3: Deterministic Secret Scanner',
      description: 'Scan with regex before LLM call; flag exposed API keys / private keys.',
      badge: 'Regex Security',
      icon: ShieldAlert,
    },
    {
      title: 'Step 4: On-Device NPU Inference',
      description: 'MediaPipe INT4 model executes in ~340ms at 46 tok/s with 0 network calls.',
      badge: 'Snapdragon NPU',
      icon: Cpu,
    },
    {
      title: 'Step 5: Mandatory Explanation + Fix',
      description: 'Strict format validation and honest uncertainty handling if unresolvable.',
      badge: 'Verified Fix',
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(60);
      setActiveStepIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-100 text-sm">
              60-Second Kill Criteria Demo Walkthrough
            </h3>
            <p className="text-[11px] text-neutral-400">
              PRD Section 19 & 22 • Demonstrable Offline Execution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950 border border-emerald-800 rounded-full">
              {secondsLeft}s
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-5 space-y-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = idx === activeStepIndex;
            return (
              <div
                key={s.title}
                onClick={() => {
                  setActiveStepIndex(idx);
                  triggerHaptic('light');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-neutral-950 border-sky-500/80 shadow-md'
                    : 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-950/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isCurrent ? 'bg-sky-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-neutral-200">{s.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {s.badge}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5 ml-9">{s.description}</p>
              </div>
            );
          })}

          <button
            type="button"
            id="run-step-sample-btn"
            onClick={() => {
              triggerHaptic('success');
              onRunDemoStep('py-type-error');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors mt-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Demonstrate Step Live in Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
