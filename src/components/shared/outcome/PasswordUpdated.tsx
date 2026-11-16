import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { OutcomeScreen, outcomeButton } from "./OutcomeScreen";

/** "Password updated" result after changing a password, for every role. */
export function PasswordUpdated({ email, dashboard, onDone }: {
  email?: string | undefined;
  dashboard: "/learner/dashboard" | "/creator/dashboard" | "/affiliate/dashboard";
  onDone: () => void;
}) {
  const at = new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="py-2">
      <OutcomeScreen
        tone="success"
        eyebrow="Security"
        title="Password updated"
        message="Use your new password the next time you log in."
        details={[
          ...(email ? [{ label: "Account", value: email }] : []),
          { label: "Changed", value: at },
          { label: "This device", value: "Still logged in" },
        ]}
        actions={<>
          <button type="button" className={outcomeButton.primary} onClick={onDone}><ShieldCheck aria-hidden="true" />Back to security</button>
          <Link to={dashboard} className={outcomeButton.secondary}><LayoutDashboard aria-hidden="true" />Go to dashboard</Link>
        </>}
      />
    </div>
  );
}
