/** Visual password strength used by every role's security page. Validation rules stay per role. */
export function passwordStrength(pw: string) {
  const checks = [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "Upper and lower case", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A number", ok: /\d/.test(pw) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  // Short passwords never rate above weak, however varied.
  const score = !pw ? 0 : pw.length < 8 ? Math.min(passed, 1) : passed;
  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][score] ?? "Too weak";
  return { score, label, checks };
}
