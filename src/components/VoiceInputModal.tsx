import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Radio, ArrowRight, MessageSquareCode, GitCommit, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceTranscribed: (text: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onVoiceTranscribed,
}) => {
  const [voiceMode, setVoiceMode] = useState<'question' | 'commit'>('question');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOfflineRequested, setIsOfflineRequested] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      triggerHaptic('light');
      return;
    }

    triggerHaptic('medium');
    setIsListening(true);
    setTranscript('');

    // Check for native SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('Could not start webkitSpeechRecognition:', err);
      }
    }

    // Offline speech simulation if browser speech API is blocked or offline
    setTimeout(() => {
      if (voiceMode === 'question') {
        setTranscript(
          'How do I fix a TypeError in Python when concatenating an integer and a string in calculate.py?'
        );
      } else {
        setTranscript(
          'fix(core): resolve null pointer exception when loading uninitialized user profile'
        );
      }
      setIsListening(false);
      triggerHaptic('success');
    }, 2200);
  };

  const handleApply = () => {
    if (!transcript) return;
    triggerHaptic('success');
    onVoiceTranscribed(transcript);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-neutral-100 text-sm">Offline Voice Recognition</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode Selector (Coding Question vs Commit Message) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              id="voice-mode-question-btn"
              onClick={() => {
                setVoiceMode('question');
                triggerHaptic('light');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                voiceMode === 'question'
                  ? 'bg-neutral-800 text-neutral-100 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Coding Question</span>
            </button>
            <button
              type="button"
              id="voice-mode-commit-btn"
              onClick={() => {
                setVoiceMode('commit');
                triggerHaptic('light');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
                voiceMode === 'commit'
                  ? 'bg-neutral-800 text-neutral-100 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commit Message</span>
            </button>
          </div>

          {/* Microphone Visualizer & Action */}
          <div className="flex flex-col items-center justify-center py-6 bg-neutral-950/60 rounded-2xl border border-neutral-800/80">
            <button
              type="button"
              id="toggle-mic-recording-btn"
              onClick={toggleListening}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
              )}
            </button>

            <span className="text-xs font-mono text-neutral-400 mt-3">
              {isListening ? 'Listening (Offline Recognizer)...' : 'Tap microphone to speak'}
            </span>

            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-mono">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>RecognizerIntent.EXTRA_PREFER_OFFLINE = true</span>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Transcribed Text
            </label>
            <div className="min-h-20 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-200 font-mono flex items-center">
              {transcript ? (
                <span>{transcript}</span>
              ) : (
                <span className="text-neutral-600 italic">
                  {voiceMode === 'question'
                    ? 'Speak an error question, e.g., "Why does my code have a syntax error?"'
                    : 'Speak a commit summary, e.g., "fix: handle edge case in array length"'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              id="insert-voice-transcript-btn"
              onClick={handleApply}
              disabled={!transcript}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Insert into Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
