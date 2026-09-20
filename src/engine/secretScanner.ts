import { SecretMatch } from '../types';

export const SECRET_PATTERNS: { name: string; regex: RegExp; description: string }[] = [
  {
    name: 'OpenAI / Generic Secret Key',
    regex: /sk-[A-Za-z0-9]{20,}/g,
    description: 'Matches OpenAI format API keys starting with sk-',
  },
  {
    name: 'Google Cloud / Firebase API Key',
    regex: /AIza[A-Za-z0-9_-]{35}/g,
    description: 'Matches Google Cloud API key format starting with AIza',
  },
  {
    name: 'Private Cryptographic Key',
    regex: /-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----|-----BEGIN[A-Z\s]*PRIVATE KEY-----/g,
    description: 'Matches PEM formatted RSA/DSA/EC private key blocks',
  },
  {
    name: 'Hardcoded API Key Assignment',
    regex: /api_key\s*=\s*["'][^"']+["']/gi,
    description: 'Matches explicit api_key = "..." variable assignments',
  },
];

/**
 * Deterministic regex-based secret scanner executed before LLM processing.
 * Does NOT rely on AI reasoning.
 */
export function scanForSecrets(text: string): SecretMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: SecretMatch[] = [];

  for (const pattern of SECRET_PATTERNS) {
    // Reset regex state
    pattern.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(text)) !== null) {
      matches.push({
        type: pattern.name,
        patternName: pattern.name,
        matchText: match[0],
        index: match.index,
      });
      // Prevent infinite loop on zero-length matches
      if (match.index === pattern.regex.lastIndex) {
        pattern.regex.lastIndex++;
      }
    }
  }

  return matches;
}

/**
 * Redacts detected secrets with [REDACTED_SECRET] to prevent leaks.
 */
export function redactSecrets(text: string, secrets: SecretMatch[]): string {
  if (!secrets || secrets.length === 0) return text;
  let redacted = text;
  for (const s of secrets) {
    redacted = redacted.split(s.matchText).join(`[REDACTED_${s.type.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}]`);
  }
  return redacted;
}
