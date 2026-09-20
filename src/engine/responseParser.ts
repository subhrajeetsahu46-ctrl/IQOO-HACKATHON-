import { ParsedLlmOutput } from '../types';

/**
 * Validates and parses the LLM output into Explanation and Fix.
 * Enforces the mandatory "Fix:" marker and identifies "Unable to determine".
 */
export function parseLlmResponse(rawOutput: string): {
  parsed: ParsedLlmOutput;
  isValid: boolean;
  isUnableToDetermine: boolean;
  validationError?: string;
} {
  const trimmed = (rawOutput || '').trim();

  // Check for explicit uncertainty marker
  if (trimmed.toLowerCase().includes('unable to determine') || trimmed === 'Unable to determine') {
    return {
      parsed: {
        raw: rawOutput,
        explanation: 'The local model could not determine a definitive explanation with high confidence given the input context.',
        fix: 'Please provide more surrounding code, the complete compiler trace, or line numbers.',
        isConfident: false,
        confidenceScore: 0.1,
      },
      isValid: false,
      isUnableToDetermine: true,
      validationError: 'Model returned "Unable to determine"',
    };
  }

  // Check for Fix: marker
  const fixMarkerRegex = /(?:^|\n)\s*Fix\s*:\s*/i;
  const explanationMarkerRegex = /(?:^|\n)\s*Explanation\s*:\s*/i;

  const hasFixMarker = fixMarkerRegex.test(trimmed);

  if (!hasFixMarker) {
    return {
      parsed: {
        raw: rawOutput,
        explanation: trimmed,
        fix: '',
        isConfident: false,
        confidenceScore: 0.3,
      },
      isValid: false,
      isUnableToDetermine: false,
      validationError: 'Mandatory "Fix:" marker is missing from response',
    };
  }

  // Split into Explanation and Fix
  let explanation = '';
  let fix = '';

  const fixSplit = trimmed.split(fixMarkerRegex);
  if (fixSplit.length >= 2) {
    let beforeFix = fixSplit[0];
    fix = fixSplit.slice(1).join('\nFix:').trim();

    // Remove "Explanation:" prefix if present
    if (explanationMarkerRegex.test(beforeFix)) {
      beforeFix = beforeFix.replace(explanationMarkerRegex, '').trim();
    }
    explanation = beforeFix.trim();
  } else {
    explanation = trimmed;
  }

  // Final sanity checks
  if (!explanation || !fix) {
    return {
      parsed: {
        raw: rawOutput,
        explanation: explanation || 'No explanation generated',
        fix: fix || '',
        isConfident: false,
        confidenceScore: 0.4,
      },
      isValid: false,
      isUnableToDetermine: false,
      validationError: 'Either explanation or fix block was empty',
    };
  }

  return {
    parsed: {
      raw: rawOutput,
      explanation,
      fix,
      isConfident: true,
      confidenceScore: 0.95,
    },
    isValid: true,
    isUnableToDetermine: false,
  };
}
