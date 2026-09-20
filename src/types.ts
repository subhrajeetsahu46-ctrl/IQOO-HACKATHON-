export type AnalysisMode = 'DEBUG' | 'EXPLAIN' | 'REGEX_COMMAND';

export type ResultStatus = 'idle' | 'loading' | 'success' | 'not_confident' | 'error';

export interface SecretMatch {
  type: string;
  patternName: string;
  matchText: string;
  index: number;
}

export interface AnalysisInput {
  rawText: string;
  source: 'text' | 'paste' | 'camera' | 'voice' | 'office_kit';
  timestamp: number;
}

export interface ParsedLlmOutput {
  raw: string;
  explanation: string;
  fix: string;
  isConfident: boolean;
  confidenceScore?: number;
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  input: string;
  source: AnalysisInput['source'];
  mode: AnalysisMode;
  detectedSecrets: SecretMatch[];
  status: ResultStatus;
  output?: ParsedLlmOutput;
  errorMessage?: string;
  latencyMs: number;
  tokensPerSec: number;
  modelUsed: string;
  retryCount: number;
}

export interface ModelBenchmark {
  modelId: string;
  name: string;
  parameterSize: string;
  ramUsage: string;
  npuCompatibility: 'Full NPU' | 'NPU+GPU' | 'GPU Only';
  syntaxErrorPass: boolean;
  nullRefPass: boolean;
  typeErrorPass: boolean;
  logicExplanationPass: boolean;
  pythonErrorPass: boolean;
  cErrorPass: boolean;
  javaErrorPass: boolean;
  tokensPerSec: number;
  avgLatencyMs: number;
  testedOnDevice: boolean;
}
