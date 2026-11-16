import { Link } from "@tanstack/react-router";
import { LayoutDashboard, PenLine } from "lucide-react";
import { OutcomeScreen, outcomeButton } from "./OutcomeScreen";

/** Labels of the fields whose values differ between two saves (photo and other non-labelled keys are ignored). */
export function changedLabels<T extends object>(before: T, after: T, labels: Partial<Record<keyof T, string>>): string[] {
  return (Object.keys(labels) as (keyof T)[]).filter((k) => JSON.stringify(before[k] ?? "") !== JSON.stringify(after[k] ?? "")).map((k) => labels[k] as string);
}

/** "Profile updated" result after saving profile changes, for every role. */
export function ProfileUpdated({ name, email, changes, dashboard, onKeepEditing }: {
  name: string;
  email?: string | undefined;
  changes: string[];
  dashboard: "/learner/dashboard" | "/creator/dashboard" | "/affiliate/dashboard";
  onKeepEditing: () => void;
}) {
  return (
    <div className="py-2">
      <OutcomeScreen
        tone="success"
        eyebrow="Changes saved"
        title="Profile updated"
        message="Your changes are saved and show across your Enski account straight away."
        details={[
          { label: "Name", value: name || "—" },
          ...(email ? [{ label: "Email", value: email }] : []),
          { label: "Updated", value: changes.length ? changes.join(", ") : "Profile details" },
        ]}
        actions={<>
          <Link to={dashboard} className={outcomeButton.primary}><LayoutDashboard aria-hidden="true" />Back to dashboard</Link>
          <button type="button" className={outcomeButton.secondary} onClick={onKeepEditing}><PenLine aria-hidden="true" />Keep editing</button>
        </>}
      />
    </div>
  );
}
