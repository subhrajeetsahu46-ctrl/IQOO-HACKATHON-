import React from 'react';
import { X, Clock, Trash2, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { AnalysisRecord } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-400" />
            <h3 className="font-semibold text-neutral-100 text-sm">Offline Analysis History</h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                id="clear-history-btn"
                onClick={() => {
                  onClearHistory();
                  triggerHaptic('warning');
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No offline analyses recorded yet. Run your first analysis from the home screen!
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRecord(item);
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-2xl cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
                      {item.mode}
                    </span>
                    {item.detectedSecrets.length > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                        <ShieldAlert className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-emerald-400 text-[10px]">
                      {item.latencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs text-neutral-200 line-clamp-2 truncate">
                  {item.input}
                </div>

                {item.output && (
                  <div className="text-[11px] text-neutral-400 line-clamp-1 font-sans">
                    {item.output.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
