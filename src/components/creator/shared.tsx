import { LoadErrorScreen, MissingScreen } from "@/components/shared/StatusScreen";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { StatusBadge } from "@/components/affiliate/ui";
import { type CreatorItem, type ItemKind } from "@/lib/creator/rules";
export const itemPaths = {
  course: {
    list: "/creator/courses",
    create: "/creator/courses/create",
    detail: "/creator/courses/$slug",
    edit: "/creator/courses/$slug/edit",
  },
  ebook: {
    list: "/creator/ebooks",
    create: "/creator/ebooks/create",
    detail: "/creator/ebooks/$slug",
    edit: "/creator/ebooks/$slug/edit",
  },
  live: {
    list: "/creator/live-trainings",
    create: "/creator/live-trainings/create",
    detail: "/creator/live-trainings/$slug",
    edit: "/creator/live-trainings/$slug/edit",
  },
  service: {
    list: "/creator/services",
    create: "/creator/services/create",
    detail: "/creator/services/$slug",
    edit: "/creator/services/$slug/edit",
  },
  coaching: {
    list: "/creator/coaching",
    create: "/creator/coaching/create",
    detail: "/creator/coaching/$slug",
    edit: "/creator/coaching/$slug/edit",
  },
} as const satisfies Record<ItemKind, Record<string, string>>;
export function ItemLink({
  item,
  edit = false,
  children,
  className,
  onClick,
}: {
  item: Pick<CreatorItem, "id" | "kind">;
  edit?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const p = itemPaths[item.kind];
  return (
    <Link to={edit ? p.edit : p.detail} params={{ slug: item.id }} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
export const ItemStatus = ({ status }: { status: string }) => (
  <StatusBadge
    tone={
      status === "published" || status === "paid" || status === "active"
        ? "success"
        : status === "draft" || status === "invited"
          ? "pending"
          : "neutral"
    }
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </StatusBadge>
);
export async function copyText(text: string, label = "Link copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Couldn't copy that", { description: `Copy it by hand: ${text}` });
  }
}
export function downloadCsv(name: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export const shortDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
export function CreatorError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <LoadErrorScreen
      onRetry={async () => { await router.invalidate(); reset(); }}
      actions={<Button asChild variant="outline"><Link to="/creator/help">Visit Help</Link></Button>}
    />
  );
}
type CreatorMissing = "page" | "product" | "programme" | "affiliate" | "guide" | "article" | "media" | "landingPage";
const creatorTargets = {
  page: { to: "/creator/dashboard", label: "Go to overview" },
  product: { to: "/creator/products", label: "View my products" },
  programme: { to: "/creator/affiliations", label: "View affiliations" },
  affiliate: { to: "/creator/affiliates", label: "View affiliates" },
  guide: { to: "/creator/guides", label: "Browse guides" },
  article: { to: "/creator/help", label: "Search Help" },
  media: { to: "/creator/media-library", label: "Open Media Library" },
  landingPage: { to: "/creator/landing-pages", label: "View landing pages" },
} as const;
export function CreatorNotFound({ what = "page" }: { what?: CreatorMissing }) {
  const t = creatorTargets[what];
  return (
    <MissingScreen
      kind={what}
      actions={<>
        {what !== "page" && <Button asChild variant="outline"><Link to="/creator/dashboard">Go to overview</Link></Button>}
        {what === "page" && <Button asChild variant="outline"><Link to="/creator/help">Visit Help</Link></Button>}
        <Button asChild><Link to={t.to}>{t.label}</Link></Button>
      </>}
    />
  );
}
