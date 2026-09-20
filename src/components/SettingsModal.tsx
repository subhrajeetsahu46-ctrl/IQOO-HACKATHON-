import React from 'react';
import { X, Sliders, Cpu, Shield, Zap, Sparkles, Database, CheckCircle2, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  npuEnabled: boolean;
  onToggleNpu: () => void;
  onLaunchDemoFlow: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  temperature,
  onTemperatureChange,
  npuEnabled,
  onToggleNpu,
  onLaunchDemoFlow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-neutral-100 text-sm">Copilot System Configuration</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Target Hardware Readout */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Primary Hardware: iQOO 15</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-400 space-y-0.5">
              <div>SoC: Qualcomm Snapdragon 8 Elite</div>
              <div>NPU: Hexagon Neural Accelerator (Gen 4)</div>
              <div>RAM: 16 GB LPDDR5X (Model alloc: 1.18 GB)</div>
            </div>
          </div>

          {/* Temperature Slider (PRD 13: approximately 0.1 - 0.3) */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
              <span>Sampling Temperature</span>
              <span className="font-mono text-sky-400">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              id="temperature-slider"
              min="0.05"
              max="0.4"
              step="0.05"
              value={temperature}
              onChange={(e) => {
                onTemperatureChange(parseFloat(e.target.value));
                triggerHaptic('light');
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <p className="text-[11px] text-neutral-500">
              PRD mandate: 0.1–0.3 ensures controlled, deterministic, predictable outputs rather than creative hallucination.
            </p>
          </div>

          {/* NPU Acceleration Toggle */}
          <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-200">NPU Acceleration</div>
              <p className="text-[11px] text-neutral-500">Offload INT4 weights to Hexagon Tensor NPU</p>
            </div>
            <button
              type="button"
              id="toggle-npu-accel-btn"
              onClick={() => {
                onToggleNpu();
                triggerHaptic('medium');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                npuEnabled ? 'bg-sky-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  npuEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 60-Second Guided Demo Flow (PRD Section 22 Kill Criteria) */}
          <div className="pt-2">
            <button
              type="button"
              id="launch-60s-demo-btn"
              onClick={() => {
                onClose();
                onLaunchDemoFlow();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 60-Second Demo Presentation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
