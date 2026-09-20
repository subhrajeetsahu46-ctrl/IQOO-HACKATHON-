import { AnalysisMode } from '../types';

const DEBUG_KEYWORDS = [
  'error',
  'exception',
  'traceback',
  'at line',
  'stack trace',
  'fatal',
  'panic',
  'sigsegv',
  'segmentation fault',
  'nullpointerexception',
  'typeerror',
  'syntaxerror',
  'indexerror',
  'referenceerror',
  'undefined is not',
  'cannot read property',
  'compilation failed',
  'build failed',
  'exit status 1',
  'exit code 1',
  'core dumped',
  'assertion failed',
  'unhandled rejection',
  'runtime error',
  'nameerror',
  'keyerror',
  'zerodivisionerror',
  'attributeerror',
];

const SHELL_COMMAND_KEYWORDS = [
  'grep',
  'git',
  'curl',
  'sed',
  'awk',
  'find',
  'chmod',
  'chown',
  'tar',
  'rsync',
  'ssh',
  'scp',
  'xargs',
  'cut',
  'sort',
  'uniq',
  'cat',
  'docker',
  'kubectl',
  'powershell',
  'bash',
  'zsh',
];

const REGEX_METACHARACTERS_REGEX = /(\^|\$|\[\^?.*?\]|\\d|\\w|\\s|\(\?[:!=<]|[\w\.-]+\+[\w\.-]*|\.\*|\.\+)/;

/**
 * Classifies the incoming code/error into DEBUG, REGEX_COMMAND, or EXPLAIN.
 * Fully deterministic, runs in < 1ms on-device.
 */
export function classifyInputMode(rawText: string): { mode: AnalysisMode; reason: string } {
  if (!rawText || !rawText.trim()) {
    return { mode: 'EXPLAIN', reason: 'Empty input default' };
  }

  const lower = rawText.toLowerCase();

  // 1. Check for DEBUG keywords (Stack traces, errors, compiler failures)
  for (const kw of DEBUG_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        mode: 'DEBUG',
        reason: `Matched debug indicator: "${kw}"`,
      };
    }
  }

  // 2. Check for REGEX_COMMAND keywords or patterns
  for (const cmd of SHELL_COMMAND_KEYWORDS) {
    // Check word boundary or start of line
    const regex = new RegExp(`(^|\\s|\\|\\s*)${cmd}(\\s+|$)`, 'i');
    if (regex.test(rawText)) {
      return {
        mode: 'REGEX_COMMAND',
        reason: `Matched shell/CLI command: "${cmd}"`,
      };
    }
  }

  if (REGEX_METACHARACTERS_REGEX.test(rawText) && (rawText.includes('regex') || rawText.includes('pattern') || rawText.includes('match') || rawText.includes('/'))) {
    return {
      mode: 'REGEX_COMMAND',
      reason: 'Matched regex metacharacter sequence',
    };
  }

  // 3. Fallback to EXPLAIN
  return {
    mode: 'EXPLAIN',
    reason: 'Standard code snippet or algorithmic explanation request',
  };
}
