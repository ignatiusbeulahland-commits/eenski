import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LifeBuoy } from "lucide-react";
import { OutcomeScreen, outcomeButton } from "./OutcomeScreen";

/** "Request received" result after contacting support from any dashboard. */
export function SupportSent({ reference, subject, topic, email, dashboard, onDone }: {
  reference: string;
  subject: string;
  topic?: string | undefined;
  email?: string | undefined;
  dashboard: "/learner/dashboard" | "/creator/dashboard" | "/affiliate/dashboard";
  onDone: () => void;
}) {
  return (
    <div className="py-2">
      <OutcomeScreen
        tone="success"
        eyebrow="Request received"
        title="Support request submitted"
        message={<>Thanks for telling us. Our support team will reply{email ? <> to <b className="text-ink">{email}</b></> : " by email"}, usually within one working day.</>}
        details={[
          { label: "Reference", value: reference, copy: reference, mono: true },
          { label: "Subject", value: subject },
          ...(topic ? [{ label: "Topic", value: topic }] : []),
          { label: "Expected reply", value: "Within one working day" },
        ]}
        actions={<>
          <button type="button" className={outcomeButton.primary} onClick={onDone}><LifeBuoy aria-hidden="true" />Back to Help</button>
          <Link to={dashboard} className={outcomeButton.secondary}><LayoutDashboard aria-hidden="true" />Go to dashboard</Link>
        </>}
        footer="Keep the reference handy if you write to us again about this."
      />
    </div>
  );
}

/** SUP-0001 style reference from how many requests came before. */
export const supportReference = (count: number) => `SUP-${String(count + 1).padStart(4, "0")}`;
