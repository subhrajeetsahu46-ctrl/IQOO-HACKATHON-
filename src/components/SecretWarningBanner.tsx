import React, { useState } from 'react';
import { ShieldAlert, Eye, EyeOff, Check, Scissors } from 'lucide-react';
import { SecretMatch } from '../types';

interface SecretWarningBannerProps {
  secrets: SecretMatch[];
  onRedact?: () => void;
}

export const SecretWarningBanner: React.FC<SecretWarningBannerProps> = ({ secrets, onRedact }) => {
  const [showValues, setShowValues] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!secrets || secrets.length === 0) return null;

  const maskSecret = (val: string) => {
    if (val.length <= 8) return '••••••••';
    return `${val.substring(0, 4)}••••••••${val.substring(val.length - 4)}`;
  };

  return (
    <div
      id="secret-warning-banner"
      className="w-full bg-amber-950/40 border border-amber-600/70 rounded-xl p-3.5 mb-4 text-amber-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-semibold text-amber-300 text-sm tracking-wide">
              ⚠ Potential secret detected
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
              Deterministic regex scanner flagged {secrets.length} sensitive credential{secrets.length > 1 ? 's' : ''} in your input.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            id="toggle-secret-visibility-btn"
            onClick={() => setShowValues(!showValues)}
            title={showValues ? 'Hide raw credentials' : 'Show flagged matches'}
            className="p-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 text-amber-300 border border-amber-700/50 text-xs transition-colors"
          >
            {showValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {onRedact && (
            <button
              type="button"
              id="redact-secrets-btn"
              onClick={onRedact}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 font-medium text-xs transition-colors shadow-sm"
            >
              <Scissors className="w-3 h-3" />
              <span>Redact</span>
            </button>
          )}
        </div>
      </div>

      {/* Flagged tokens detail list */}
      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-amber-800/40 font-mono text-[11px]">
        {secrets.map((sec, idx) => (
          <div
            key={`${sec.patternName}-${idx}`}
            className="flex items-center justify-between px-2 py-1 rounded bg-amber-950/60 border border-amber-800/60"
          >
            <span className="text-amber-300 font-medium">{sec.patternName}</span>
            <span className="text-amber-100/90 font-mono">
              {showValues ? sec.matchText : maskSecret(sec.matchText)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
