import { ModelBenchmark } from '../types';

export interface SampleTestCase {
  id: string;
  category: string;
  title: string;
  language: string;
  input: string;
  expectedMode: 'DEBUG' | 'EXPLAIN' | 'REGEX_COMMAND';
  explanation: string;
  fix: string;
  isUncertain?: boolean;
}

export const SAMPLE_TEST_CASES: SampleTestCase[] = [
  {
    id: 'py-type-error',
    category: 'Type Error',
    title: 'Python: Int + Str Concatenation',
    language: 'Python',
    input: `Traceback (most recent call last):
  File "calculate.py", line 12, in <module>
    total_message = "Current score is: " + score
TypeError: can only concatenate str (not "int") to str`,
    expectedMode: 'DEBUG',
    explanation: 'In Python, string concatenation with the + operator strictly requires both operands to be strings. The variable `score` is an integer, so Python raises a TypeError instead of implicitly coercing types.',
    fix: `# Convert the integer to str explicitly:
total_message = "Current score is: " + str(score)

# Or use an f-string (recommended for modern Python):
total_message = f"Current score is: {score}"`,
  },
  {
    id: 'java-npe',
    category: 'Null / Reference Error',
    title: 'Java: NullPointerException',
    language: 'Java',
    input: `Exception in thread "main" java.lang.NullPointerException
	at com.copilot.demo.UserManager.getUserName(UserManager.java:28)
	at com.copilot.demo.App.main(App.java:14)

// Code snippet around UserManager.java:28
public String getUserName(User user) {
    return user.getProfile().getDisplayName();
}`,
    expectedMode: 'DEBUG',
    explanation: 'A NullPointerException occurred at line 28 because either the `user` object itself or the returned `user.getProfile()` object is null before invoking `.getDisplayName()`.',
    fix: `public String getUserName(User user) {
    if (user != null && user.getProfile() != null) {
        return user.getProfile().getDisplayName();
    }
    return "Anonymous";
    
    // Or using Optional (Java 8+):
    // return Optional.ofNullable(user)
    //     .map(User::getProfile)
    //     .map(Profile::getDisplayName)
    //     .orElse("Anonymous");
}`,
  },
  {
    id: 'c-segfault',
    category: 'C / Memory Error',
    title: 'C: Segmentation Fault (Unallocated Pointer)',
    language: 'C',
    input: `Program received signal SIGSEGV, Segmentation fault.
0x0000555555555189 in main () at buffer.c:9
9	    strcpy(buffer, "Hello World");

// Snippet:
int main() {
    char *buffer;
    strcpy(buffer, "Hello World");
    printf("%s\\n", buffer);
    return 0;
}`,
    expectedMode: 'DEBUG',
    explanation: 'The pointer `char *buffer` was declared without allocating any memory or initializing it to point to a valid memory location. Calling `strcpy()` writes to a random address, causing a memory violation (SIGSEGV).',
    fix: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Option 1: Stack array with sufficient capacity:
    char buffer[64];
    strcpy(buffer, "Hello World");
    printf("%s\\n", buffer);
    return 0;

    // Option 2: Dynamic heap allocation:
    // char *buffer = malloc(64 * sizeof(char));
    // if (!buffer) return 1;
    // strcpy(buffer, "Hello World");
    // free(buffer);
}`,
  },
  {
    id: 'py-syntax-colon',
    category: 'Syntax Error',
    title: 'Python: Missing Colon & Indentation',
    language: 'Python',
    input: `  File "loop.py", line 5
    if x > 10
            ^
SyntaxError: expected ':'`,
    expectedMode: 'DEBUG',
    explanation: 'Python syntax requires a colon (:) at the end of conditional statements, loop headers, function definitions, and class headers.',
    fix: `if x > 10:
    print("x is greater than 10")`,
  },
  {
    id: 'js-undefined-prop',
    category: 'Null / Reference Error',
    title: 'JS: Cannot read properties of undefined',
    language: 'JavaScript',
    input: `TypeError: Cannot read properties of undefined (reading 'length')
    at calculateStats (analytics.js:42:26)
    at Object.<anonymous> (server.js:15:5)

// analytics.js line 42:
const count = data.metrics.items.length;`,
    expectedMode: 'DEBUG',
    explanation: 'The property `items` (or `metrics`) on the `data` object is undefined. Accessing `.length` on `undefined` causes JavaScript to throw a TypeError.',
    fix: `// Use optional chaining (?.) and nullish coalescing (??):
const count = data?.metrics?.items?.length ?? 0;

// Or with guard clauses:
if (!data?.metrics?.items) {
  return 0;
}
const count = data.metrics.items.length;`,
  },
  {
    id: 'cli-grep-recursive',
    category: 'Regex / CLI Command',
    title: 'CLI: Recursive Grep with Line Numbers',
    language: 'Shell',
    input: `grep error logs/
How do I search for "AUTH_FAILURE" in all .log files recursively under /var/logs, case-insensitive, showing line numbers?`,
    expectedMode: 'REGEX_COMMAND',
    explanation: 'The standard `grep` command uses `-r` (or `-R` to follow symlinks) for recursion, `-i` for case-insensitivity, and `-n` to display line numbers. Use `--include` to restrict matches to `.log` files.',
    fix: `grep -rni --include="*.log" "AUTH_FAILURE" /var/logs/`,
  },
  {
    id: 'secret-leak-detection',
    category: 'Security / Secret Leak',
    title: 'Security: Accidentally Pasted OpenAI API Key',
    language: 'Python',
    input: `import openai

api_key = "sk-live-99xFa92BvX82K19z8L9281982739281a"
openai.api_key = api_key

# Request:
Traceback (most recent call last):
  File "chat.py", line 18, in <module>
    response = openai.ChatCompletion.create(...)
AuthenticationError: Incorrect API key provided`,
    expectedMode: 'DEBUG',
    explanation: 'CRITICAL: Your pasted code contains a plaintext API key `api_key = "sk-..."`. In addition to the AuthenticationError caused by an invalid or revoked key, committing or pasting hardcoded secrets poses a severe security vulnerability.',
    fix: `# 1. Revoke the exposed key immediately in your provider dashboard.
# 2. Store keys safely in environment variables:
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is missing.")`,
  },
  {
    id: 'uncertain-ambiguous',
    category: 'Uncertainty Test',
    title: 'Honest Uncertainty Handling (Unresolvable input)',
    language: 'Unknown',
    input: `it broke again at line 3`,
    expectedMode: 'DEBUG',
    explanation: '',
    fix: '',
    isUncertain: true,
  },
];

export const BENCHMARK_MODELS: ModelBenchmark[] = [
  {
    modelId: 'gemma-3-1b-it',
    name: 'Gemma 3 1B-IT (INT4)',
    parameterSize: '1.2 Billion',
    ramUsage: '1.18 GB',
    npuCompatibility: 'Full NPU',
    syntaxErrorPass: true,
    nullRefPass: true,
    typeErrorPass: true,
    logicExplanationPass: true,
    pythonErrorPass: true,
    cErrorPass: true,
    javaErrorPass: true,
    tokensPerSec: 46.2,
    avgLatencyMs: 340,
    testedOnDevice: true, // Recommended on iQOO 15
  },
  {
    modelId: 'gemma-3n-e2b',
    name: 'Gemma 3n E2B (Mobile NPU)',
    parameterSize: '2.1 Billion',
    ramUsage: '1.75 GB',
    npuCompatibility: 'Full NPU',
    syntaxErrorPass: true,
    nullRefPass: true,
    typeErrorPass: true,
    logicExplanationPass: true,
    pythonErrorPass: true,
    cErrorPass: true,
    javaErrorPass: true,
    tokensPerSec: 38.5,
    avgLatencyMs: 460,
    testedOnDevice: true,
  },
  {
    modelId: 'phi-4-mini',
    name: 'Phi-4 Mini (INT4)',
    parameterSize: '3.8 Billion',
    ramUsage: '2.84 GB',
    npuCompatibility: 'NPU+GPU',
    syntaxErrorPass: true,
    nullRefPass: true,
    typeErrorPass: true,
    logicExplanationPass: true,
    pythonErrorPass: true,
    cErrorPass: true,
    javaErrorPass: false,
    tokensPerSec: 24.1,
    avgLatencyMs: 780,
    testedOnDevice: true,
  },
  {
    modelId: 'qwen-2.5-coder-1.5b',
    name: 'Qwen 2.5 Coder 1.5B',
    parameterSize: '1.54 Billion',
    ramUsage: '1.35 GB',
    npuCompatibility: 'Full NPU',
    syntaxErrorPass: true,
    nullRefPass: true,
    typeErrorPass: true,
    logicExplanationPass: true,
    pythonErrorPass: true,
    cErrorPass: true,
    javaErrorPass: true,
    tokensPerSec: 41.8,
    avgLatencyMs: 380,
    testedOnDevice: true,
  },
  {
    modelId: 'llama-3.2-1b',
    name: 'Llama 3.2 1B-Instruct',
    parameterSize: '1.23 Billion',
    ramUsage: '1.20 GB',
    npuCompatibility: 'Full NPU',
    syntaxErrorPass: true,
    nullRefPass: true,
    typeErrorPass: true,
    logicExplanationPass: false,
    pythonErrorPass: true,
    cErrorPass: false,
    javaErrorPass: true,
    tokensPerSec: 44.0,
    avgLatencyMs: 350,
    testedOnDevice: true,
  },
];
