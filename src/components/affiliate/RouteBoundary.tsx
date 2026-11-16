import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/dashboard-ui/button";
import { LoadErrorScreen, MissingScreen } from "@/components/shared/StatusScreen";

export function AffiliateError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <LoadErrorScreen
      onRetry={async () => { await router.invalidate(); reset(); }}
      actions={<Button asChild variant="outline"><Link to="/affiliate/help">Visit Help</Link></Button>}
    />
  );
}

const targets = {
  Product: { kind: "marketProduct", to: "/affiliate/market", label: "Browse the market" },
  Article: { kind: "article", to: "/affiliate/help", label: "Search Help" },
  Guide: { kind: "guide", to: "/affiliate/guides", label: "Browse guides" },
} as const;

export function ResourceNotFound({ kind }: { kind: keyof typeof targets }) {
  const t = targets[kind];
  return (
    <MissingScreen
      kind={t.kind}
      actions={<>
        <Button asChild variant="outline"><Link to="/affiliate/dashboard">Go to overview</Link></Button>
        <Button asChild><Link to={t.to}>{t.label}</Link></Button>
      </>}
    />
  );
}
