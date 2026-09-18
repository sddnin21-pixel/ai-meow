const suspiciousPatterns = [
  /ignore\s+(all|any|the)?\s*previous\s+instructions/i,
  /disregard\s+(all|any|the)?\s*previous/i,
  /system\s*prompt\s*:/i,
  /developer\s*message\s*:/i,
  /jailbreak/i,
  /reveal\s+(your|the)\s+(system|developer)\s+prompt/i
];

export interface GuardrailResult {
  blocked: boolean;
  warnings: string[];
  sanitized: string;
}

export function inspectUserInput(input: string): GuardrailResult {
  const warnings = suspiciousPatterns.filter((pattern) => pattern.test(input)).map(() => "Phát hiện mẫu prompt injection đáng ngờ.");
  const sanitized = input.replace(/\u0000/g, "").slice(0, 30_000);
  return { blocked: warnings.length > 0, warnings: [...new Set(warnings)], sanitized };
}
