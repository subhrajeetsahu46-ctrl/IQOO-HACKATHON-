import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cpu, BatteryMedium, ShieldAlert, Sliders } from 'lucide-react';

interface StatusBarProps {
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onOpenSettings: () => void;
  onOpenBenchmarks: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isOfflineMode,
  onToggleOffline,
  onOpenSettings,
  onOpenBenchmarks,
}) => {
  const [timeStr, setTimeStr] = useState('10:16');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-neutral-950/90 backdrop-blur border-b border-neutral-800/80 px-4 py-2 flex items-center justify-between text-xs text-neutral-400 select-none z-30">
      {/* Left: Clock and Target Device */}
      <div className="flex items-center gap-2 font-mono">
        <span className="font-semibold text-neutral-200">{timeStr}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 hidden sm:inline-block">
          iQOO 15 (Snapdragon 8 Elite)
        </span>
      </div>

      {/* Center: Demonstrable Offline Verification Pill */}
      <button
        type="button"
        id="toggle-offline-mode-btn"
        onClick={onToggleOffline}
        title="Click to toggle Network Simulator (Demonstrate 100% offline local inference)"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
          isOfflineMode
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
            : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
        }`}
      >
        {isOfflineMode ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wi-Fi: OFF (Offline Verified)</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>Wi-Fi: ON (Tap to cut network)</span>
          </>
        )}
      </button>

      {/* Right: NPU status, Benchmarks, Settings & Battery */}
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <button
          type="button"
          id="open-benchmarks-btn"
          onClick={onOpenBenchmarks}
          title="Empirical Model Benchmarks (PRD Section 20)"
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/60 px-2 py-0.5 rounded transition-colors"
        >
          <Cpu className="w-3 h-3" />
          <span className="hidden sm:inline">NPU 46 tok/s</span>
        </button>

        <button
          type="button"
          id="open-settings-btn"
          onClick={onOpenSettings}
          title="On-device Model Settings"
          aria-label="Settings"
          className="text-neutral-400 hover:text-neutral-200 p-1 rounded hover:bg-neutral-800 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-neutral-300">
          <span>87%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
