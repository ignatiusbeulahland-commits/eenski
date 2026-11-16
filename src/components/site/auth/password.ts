/** Password requirements shown live on the register form (same three rules as the Enski app). */
export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "number", label: "A number (0-9)", test: (p: string) => /\d/.test(p) },
  { id: "symbol", label: "A symbol, e.g. ! @ # $ %", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

export function checkPassword(password: string) {
  return passwordRules.map((r) => ({ id: r.id, label: r.label, met: r.test(password) }));
}

export function isStrongPassword(password: string) {
  return passwordRules.every((r) => r.test(password));
}
