/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar } from './components/StatusBar';
import { HomeScreen } from './components/HomeScreen';
import { ResultScreen } from './components/ResultScreen';
import { CameraScanModal } from './components/CameraScanModal';
import { VoiceInputModal } from './components/VoiceInputModal';
import { OfficeKitModal } from './components/OfficeKitModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ModelEvaluationModal } from './components/ModelEvaluationModal';
import { DemoPresentationModal } from './components/DemoPresentationModal';

import {
  AnalysisMode,
  AnalysisRecord,
  ParsedLlmOutput,
  ResultStatus,
  SecretMatch,
} from './types';
import { scanForSecrets, redactSecrets } from './engine/secretScanner';
import { classifyInputMode } from './engine/modeClassifier';
import { localLlmEngine } from './engine/llmEngine';
import { SAMPLE_TEST_CASES, SampleTestCase } from './engine/sampleDataset';
import { triggerHaptic } from './utils/haptics';
import { Smartphone, Monitor } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'offline_developer_copilot_history_v1';

export default function App() {
  // Input & Pipeline State
  const [inputText, setInputText] = useState('');
  const [inputSource, setInputSource] = useState<'text' | 'paste' | 'camera' | 'voice' | 'office_kit'>('text');
  const [resultStatus, setResultStatus] = useState<ResultStatus>('idle');
  const [activeScreen, setActiveScreen] = useState<'home' | 'result'>('home');

  // Result Data
  const [lastOutput, setLastOutput] = useState<ParsedLlmOutput | undefined>();
  const [lastLatencyMs, setLastLatencyMs] = useState(340);
  const [lastTokensPerSec, setLastTokensPerSec] = useState(46.2);
  const [lastRetryCount, setLastRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Modals & Tools State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isOfficeKitOpen, setIsOfficeKitOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBenchmarksOpen, setIsBenchmarksOpen] = useState(false);
  const [isDemoWalkthroughOpen, setIsDemoWalkthroughOpen] = useState(false);

  // Settings
  const [isOfflineMode, setIsOfflineMode] = useState(true); // Default to Wi-Fi OFF as required by PRD
  const [temperature, setTemperature] = useState(0.2); // Controlled 0.1-0.3
  const [npuEnabled, setNpuEnabled] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState('gemma-3-1b-it');
  const [deviceFrameMode, setDeviceFrameMode] = useState<'framed' | 'full'>('framed');

  // History Records
  const [history, setHistory] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
    return [];
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not persist history to localStorage:', e);
    }
  }, [history]);

  // Deterministic Secret Scanner (Runs on input changes before LLM)
  const detectedSecrets = useMemo<SecretMatch[]>(() => {
    return scanForSecrets(inputText);
  }, [inputText]);

  // Deterministic Mode Classifier (DEBUG / EXPLAIN / REGEX_COMMAND)
  const { mode: detectedMode } = useMemo(() => {
    return classifyInputMode(inputText);
  }, [inputText]);

  // Main Pipeline Execution (FR-01, FR-02, Secret Scanner, LLM, Result)
  const handleAnalyze = async (overrideInput?: string) => {
    const textToProcess = (overrideInput ?? inputText).trim();
    if (!textToProcess) return;

    triggerHaptic('medium');
    setResultStatus('loading');
    setActiveScreen('result');
    setErrorMessage(undefined);

    try {
      // Execute On-Device MediaPipe Engine
      const result = await localLlmEngine.runInference(textToProcess, detectedMode);

      setLastLatencyMs(result.latencyMs);
      setLastTokensPerSec(result.tokensPerSec);
      setLastRetryCount(result.retryCount);
      setLastOutput(result.parsed);

      let finalStatus: ResultStatus = 'success';
      if (!result.parsed.isConfident) {
        finalStatus = 'not_confident';
        triggerHaptic('warning');
      } else {
        triggerHaptic('success');
      }
      setResultStatus(finalStatus);

      // Record in local history
      const newRecord: AnalysisRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        input: textToProcess,
        source: inputSource,
        mode: detectedMode,
        detectedSecrets: scanForSecrets(textToProcess),
        status: finalStatus,
        output: result.parsed,
        latencyMs: result.latencyMs,
        tokensPerSec: result.tokensPerSec,
        modelUsed: result.modelUsed,
        retryCount: result.retryCount,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 49)]);
    } catch (err: any) {
      console.error('Local inference failure:', err);
      setResultStatus('error');
      setErrorMessage(err?.message || 'Local Snapdragon NPU model execution halted unexpectedly.');
      triggerHaptic('error');
    }
  };

  // Clipboard Paste Helper
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setInputSource('paste');
        triggerHaptic('light');
      }
    } catch {
      // Fallback if browser permission is blocked
      const sample = SAMPLE_TEST_CASES[0].input;
      setInputText(sample);
      setInputSource('paste');
      triggerHaptic('light');
    }
  };

  // 1-Click Tested Sample Selection
  const handleSelectSample = (sample: SampleTestCase) => {
    setInputText(sample.input);
    setInputSource('text');
    triggerHaptic('light');
  };

  // Redact secrets
  const handleRedactSecrets = () => {
    if (detectedSecrets.length === 0) return;
    const sanitized = redactSecrets(inputText, detectedSecrets);
    setInputText(sanitized);
    triggerHaptic('success');
  };

  // Load record from History
  const handleSelectHistoryRecord = (record: AnalysisRecord) => {
    setInputText(record.input);
    setLastOutput(record.output);
    setResultStatus(record.status);
    setLastLatencyMs(record.latencyMs);
    setLastTokensPerSec(record.tokensPerSec);
    setLastRetryCount(record.retryCount);
    setActiveScreen('result');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans antialiased overflow-x-hidden selection:bg-sky-500/30">
      {/* Outer Floating Viewport Switcher */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5 p-1 bg-neutral-900/90 backdrop-blur rounded-xl border border-neutral-800 text-xs text-neutral-400 select-none shadow-lg">
        <button
          type="button"
          onClick={() => {
            setDeviceFrameMode('framed');
            triggerHaptic('light');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            deviceFrameMode === 'framed'
              ? 'bg-neutral-800 text-neutral-100 font-semibold'
              : 'hover:text-neutral-200'
          }`}
          title="iQOO 15 Native Device Bezel View"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">iQOO 15 Frame</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setDeviceFrameMode('full');
            triggerHaptic('light');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
            deviceFrameMode === 'full'
              ? 'bg-neutral-800 text-neutral-100 font-semibold'
              : 'hover:text-neutral-200'
          }`}
          title="Full Viewport Responsive View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full Screen</span>
        </button>
      </div>

      {/* Main Container / Mobile Frame Wrapper */}
      <main
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceFrameMode === 'framed'
            ? 'max-w-md h-[94vh] max-h-[890px] my-auto bg-neutral-950 border-[6px] border-neutral-800 rounded-[44px] shadow-2xl overflow-hidden relative ring-1 ring-neutral-700/50'
            : 'h-screen max-w-4xl bg-neutral-950 overflow-hidden'
        }`}
      >
        {/* Device Punch Hole Camera (only on framed mode) */}
        {deviceFrameMode === 'framed' && (
          <div className="w-full flex justify-center pt-2 pb-0 bg-neutral-950 select-none pointer-events-none z-30">
            <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
            </div>
          </div>
        )}

        {/* Status Bar */}
        <StatusBar
          isOfflineMode={isOfflineMode}
          onToggleOffline={() => {
            setIsOfflineMode(!isOfflineMode);
            triggerHaptic('warning');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenBenchmarks={() => setIsBenchmarksOpen(true)}
        />

        {/* Dynamic Screen View (Home vs Result) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeScreen === 'home' ? (
            <HomeScreen
              inputText={inputText}
              onInputChange={(text) => setInputText(text)}
              detectedMode={detectedMode}
              detectedSecrets={detectedSecrets}
              onAnalyze={() => handleAnalyze()}
              onOpenPaste={handlePasteCode}
              onOpenCamera={() => setIsCameraOpen(true)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenOfficeKit={() => setIsOfficeKitOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onSelectSample={handleSelectSample}
              isAnalyzing={resultStatus === 'loading'}
            />
          ) : (
            <ResultScreen
              status={resultStatus}
              mode={detectedMode}
              inputSnippet={inputText}
              output={lastOutput}
              secrets={detectedSecrets}
              errorMessage={errorMessage}
              latencyMs={lastLatencyMs}
              tokensPerSec={lastTokensPerSec}
              retryCount={lastRetryCount}
              onBack={() => setActiveScreen('home')}
              onRetry={() => handleAnalyze()}
              onRedactInputSecrets={handleRedactSecrets}
            />
          )}
        </div>
      </main>

      {/* MODALS */}
      <CameraScanModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCodeExtracted={(code) => {
          setInputText(code);
          setInputSource('camera');
        }}
      />

      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onVoiceTranscribed={(text) => {
          setInputText(text);
          setInputSource('voice');
        }}
      />

      <OfficeKitModal
        isOpen={isOfficeKitOpen}
        onClose={() => setIsOfficeKitOpen(false)}
        onSnippetReceived={(snippet) => {
          setInputText(snippet);
          setInputSource('office_kit');
        }}
        onOpenPhotographFallback={() => setIsCameraOpen(true)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRecord={handleSelectHistoryRecord}
        onClearHistory={() => setHistory([])}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        npuEnabled={npuEnabled}
        onToggleNpu={() => setNpuEnabled(!npuEnabled)}
        onLaunchDemoFlow={() => setIsDemoWalkthroughOpen(true)}
      />

      <ModelEvaluationModal
        isOpen={isBenchmarksOpen}
        onClose={() => setIsBenchmarksOpen(false)}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
      />

      <DemoPresentationModal
        isOpen={isDemoWalkthroughOpen}
        onClose={() => setIsDemoWalkthroughOpen(false)}
        onRunDemoStep={(sampleId) => {
          const sample = SAMPLE_TEST_CASES.find((s) => s.id === sampleId) || SAMPLE_TEST_CASES[0];
          setInputText(sample.input);
          handleAnalyze(sample.input);
        }}
      />
    </div>
  );
}
