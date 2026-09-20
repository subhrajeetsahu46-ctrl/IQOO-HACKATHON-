import React, { useState } from 'react';
import { Laptop, QrCode, ArrowRight, Camera, Copy, Check, RefreshCw, AlertCircle, Share2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface OfficeKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnippetReceived: (snippet: string) => void;
  onOpenPhotographFallback: () => void;
}

export const OfficeKitModal: React.FC<OfficeKitModalProps> = ({
  isOpen,
  onClose,
  onSnippetReceived,
  onOpenPhotographFallback,
}) => {
  const [devicePairCode, setDevicePairCode] = useState('IQOO-8942');
  const [laptopCodeInput, setLaptopCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  if (!isOpen) return null;

  const handleCopyPairCode = () => {
    navigator.clipboard.writeText(devicePairCode);
    setCopiedCode(true);
    triggerHaptic('light');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const simulateLaptopReceive = () => {
    setIsReceiving(true);
    triggerHaptic('medium');
    setTimeout(() => {
      const sampleLaptopCode = `// Pushed from Laptop via Office Kit (Peer-to-Peer):
def calculate_discount(price, discount_percent):
    # Bug report from VS Code terminal:
    # ZeroDivisionError: division by zero
    return price / (1 - (discount_percent / 100))`;
      setIsReceiving(false);
      onSnippetReceived(sampleLaptopCode);
      triggerHaptic('success');
      onClose();
    }, 1200);
  };

  const handleDirectTransfer = () => {
    if (!laptopCodeInput.trim()) return;
    triggerHaptic('success');
    onSnippetReceived(laptopCodeInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-neutral-100 text-sm">Office Kit (Laptop Bridge)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Pairing Code Card */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Direct Device Pair Code
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {devicePairCode}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Local Wi-Fi Direct or Bluetooth channel. No internet needed.
              </p>
            </div>
            <button
              type="button"
              id="copy-pair-code-btn"
              onClick={handleCopyPairCode}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Push from Laptop simulation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                Receive from Laptop Extension
              </span>
              <button
                type="button"
                id="simulate-laptop-push-btn"
                onClick={simulateLaptopReceive}
                disabled={isReceiving}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isReceiving ? 'animate-spin' : ''}`} />
                <span>Simulate Push</span>
              </button>
            </div>

            <textarea
              id="office-kit-input-textarea"
              value={laptopCodeInput}
              onChange={(e) => setLaptopCodeInput(e.target.value)}
              placeholder="Paste code snippet from laptop terminal or web editor here..."
              rows={4}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
            />

            {laptopCodeInput.trim() && (
              <button
                type="button"
                id="transfer-laptop-code-btn"
                onClick={handleDirectTransfer}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Transfer to Copilot Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MANDATORY FALLBACK: Photograph Laptop Screen -> OCR -> Local AI */}
          <div className="pt-3 border-t border-neutral-800">
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80">
              <div className="flex items-center gap-2 mb-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Reliable Fallback (PRD Section 11)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                If the laptop network bridge is blocked by firewall or exam restrictions, use the mandatory hardware fallback:
                <strong className="text-neutral-200 block mt-0.5">
                  Laptop Screen → Photograph Screen → OCR → Local AI
                </strong>
              </p>
              <button
                type="button"
                id="office-kit-photograph-fallback-btn"
                onClick={() => {
                  onClose();
                  onOpenPhotographFallback();
                }}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Screen Viewfinder / OCR</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
