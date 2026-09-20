import { AnalysisMode } from '../types';

export interface PromptConfig {
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
  userPrompt: string;
}

const BASE_SYSTEM_PROMPT = `You are an offline on-device developer copilot running on a mobile Snapdragon NPU/GPU.
Your task is to analyze the provided programming error, shell command, or code snippet.

STRICT OUTPUT FORMAT RULES:
1. You MUST respond with EXACTLY two labeled sections:
Explanation:
<Clear, concise explanation of the root cause or behavior without fluff>

Fix:
<The exact corrected code, corrected command, or minimal working patch>

2. The "Fix:" marker is MANDATORY. Do not omit it.
3. If you cannot determine the answer with high confidence, or if the input is completely nonsensical or lacks enough context, respond ONLY with:
Unable to determine

Never fabricate answers. Be direct, accurate, and concise.`;

const FEW_SHOT_EXAMPLES: Record<AnalysisMode, string> = {
  DEBUG: `Example 1:
Input:
Traceback (most recent call last):
  File "app.py", line 4, in <module>
    res = count + " items"
TypeError: unsupported operand type(s) for +: 'int' and 'str'

Output:
Explanation:
Python does not automatically convert integers to strings when using the + operator. You are attempting to concatenate an integer variable 'count' with a string literal.

Fix:
res = str(count) + " items"
# Or using an f-string:
res = f"{count} items"`,

  REGEX_COMMAND: `Example 1:
Input:
How do I recursively find all files containing the word "TODO" using grep?

Output:
Explanation:
The standard 'grep' command needs recursive flags (-r or -R) along with line numbers (-n) and case insensitivity (-i) for efficient searching across directories.

Fix:
grep -rn "TODO" .`,

  EXPLAIN: `Example 1:
Input:
def is_even(n):
    return (n & 1) == 0

Output:
Explanation:
This function checks if an integer 'n' is even using bitwise AND. The least significant bit of any binary integer is 0 if even and 1 if odd. '(n & 1) == 0' evaluates to True for even numbers.

Fix:
# The snippet is already optimal. For negative numbers in other languages, note behavior, but in Python it works reliably:
def is_even(n: int) -> bool:
    """Return True if n is even, False otherwise."""
    return (n & 1) == 0`,
};

export function buildPrompt(input: string, mode: AnalysisMode): PromptConfig {
  const fewShot = FEW_SHOT_EXAMPLES[mode] || FEW_SHOT_EXAMPLES.DEBUG;

  const userPrompt = `${fewShot}

Current Request:
Input:
${input.trim()}

Output:`;

  return {
    temperature: 0.2, // Controlled, low temperature as specified in PRD (0.1 - 0.3)
    maxTokens: 450,
    systemInstruction: BASE_SYSTEM_PROMPT,
    userPrompt,
  };
}
