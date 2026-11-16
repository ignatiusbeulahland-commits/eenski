import { useRef, useState } from "react";
import { undoToast } from "@/lib/shared/undo";
import { Eye, FileText, History, RefreshCw, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Field } from "@/components/affiliate/Field";
import { EmptyState, FilterSelect, Panel } from "@/components/affiliate/ui";
import { LICENSES, downloadAccess, downloadOf, newId, replaceFile, type DownloadConfig, type ProductFile } from "@/lib/creator/products";
import { fileSize } from "../Media";
import { shortDate } from "../shared";
import { Metric, MetricGrid, Pill, ToggleRow, useProduct, type ProductProps } from "./common";

export const MAX_FILE = 500 * 1024 * 1024;
/** Files picked this visit can be previewed; only their details are kept afterwards. */
export const sessionPreviews = new Map<string, string>();
export const previewable = (mime: string) => mime === "application/pdf" || mime.startsWith("image/");
const licenseLabel = { personal: "Personal use", commercial: "Commercial use", extended: "Extended (resell in products)" };

export function DownloadOverview({ item, orders }: ProductProps) {
  const d = downloadOf(item);
  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  const blocked = paid.filter((o) => !downloadAccess(o, d, now).ok).length;
  return (
    <MetricGrid>
      <Metric label="Buyers" value={String(paid.length)} />
      <Metric label="Downloads" value={String(paid.reduce((n, o) => n + (o.downloads ?? 0), 0))} />
      <Metric label="Files" value={String(d.files.length)} hint={d.files.length ? `${fileSize(d.files.reduce((n, f) => n + f.size, 0))} total` : "None yet"} />
      <Metric label="Access issues" value={String(blocked)} hint="Expired, revoked or limit reached" />
    </MetricGrid>
  );
}
export const downloadChecklist = (item: ProductProps["item"]) => {
  const d = downloadOf(item);
  return [
    { label: "Upload the files buyers receive", done: d.files.length > 0, tab: "files" },
    { label: "Set download limits and expiry", done: d.limit > 0 || d.expiryDays > 0, tab: "delivery" },
    { label: "Choose a licence", done: true, tab: "delivery" },
  ];
};

export function Files({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const d = downloadOf(item);
  const add = useRef<HTMLInputElement>(null);
  const swap = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProductFile | null>(null);
  const [history, setHistory] = useState<string | null>(null);
  const save = (files: ProductFile[], log?: string) => patchItem({ download: { ...d, files } }, log);
  const accept = (f: File) => {
    if (f.size > MAX_FILE) { toast.error(`${f.name} is over 500 MB. Choose a smaller file.`); return false; }
    if (!f.size) { toast.error(`${f.name} is empty. Choose another file.`); return false; }
    return true;
  };
  const onAdd = (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter(accept);
    if (!picked.length) return;
    const at = new Date().toISOString();
    const next = picked.map((f) => {
      const id = newId();
      if (previewable(f.type)) sessionPreviews.set(id, URL.createObjectURL(f));
      return { id, name: f.name, size: f.size, mime: f.type || "application/octet-stream", version: 1, uploadedAt: at, history: [] };
    });
    save([...d.files, ...next], "Files added");
    toast.success(`${next.length} file${next.length === 1 ? "" : "s"} added`);
    if (add.current) add.current.value = "";
  };
  const onReplace = (list: FileList | null) => {
    const f = list?.[0];
    const old = d.files.find((x) => x.id === target);
    if (!f || !old || !accept(f)) return;
    const prev = sessionPreviews.get(old.id);
    if (prev) URL.revokeObjectURL(prev);
    sessionPreviews.delete(old.id);
    if (previewable(f.type)) sessionPreviews.set(old.id, URL.createObjectURL(f));
    save(d.files.map((x) => (x.id === old.id ? replaceFile(x, { name: f.name, size: f.size, mime: f.type || x.mime }, new Date().toISOString()) : x)), "File replaced");
    toast.success(`Replaced with version ${old.version + 1}`, { description: "Buyers get the new version on their next download." });
    if (swap.current) swap.current.value = "";
  };
  const url = preview ? sessionPreviews.get(preview.id) : undefined;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel
        title="Files buyers receive"
        description="PDFs, ebooks, templates, audio or zipped bundles, up to 500 MB each."
        actions={<Button size="sm" onClick={() => add.current?.click()}><Upload />Upload files</Button>}
        bodyClassName="p-0"
      >
        <input ref={add} type="file" multiple tabIndex={-1} className="sr-only" aria-label="Upload files" onChange={(e) => onAdd(e.target.files)} />
        <input ref={swap} type="file" tabIndex={-1} className="sr-only" aria-label="Replacement file" onChange={(e) => onReplace(e.target.files)} />
        {d.files.length ? (
          <ul className="divide-y">
            {d.files.map((f) => (
              <li key={f.id} className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-cobalt" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{f.name}</p>
                    <p className="text-xs text-muted-foreground">v{f.version} · {fileSize(f.size)} · Updated {shortDate(f.uploadedAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="soft" disabled={!previewable(f.mime)} onClick={() => setPreview(f)}><Eye />Preview</Button>
                  <Button size="sm" variant="outline" onClick={() => { setTarget(f.id); swap.current?.click(); }}><RefreshCw />Replace</Button>
                  {f.history.length > 0 && (
                    <Button size="sm" variant="outline" aria-expanded={history === f.id} onClick={() => setHistory(history === f.id ? null : f.id)}><History />Versions ({f.history.length + 1})</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { const before = d.files; save(d.files.filter((x) => x.id !== f.id), "File removed"); if (preview?.id === f.id) setPreview(null); undoToast(`"${f.name}" removed`, () => save(before, "File restored")); }}><Trash2 />Remove</Button>
                </div>
                {history === f.id && (
                  <ol className="mt-3 space-y-1 rounded-[14px] bg-soft p-3 text-xs">
                    <li className="font-bold">v{f.version} · {f.name} · current</li>
                    {f.history.map((h) => <li key={h.version} className="text-muted-foreground">v{h.version} · {h.name} · {fileSize(h.size)} · {shortDate(h.uploadedAt)}</li>)}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact icon={Upload} title="No files yet" description="Upload the files buyers will download after paying." action={<Button onClick={() => add.current?.click()}><Upload />Upload files</Button>} />
        )}
      </Panel>
      <Panel title="Preview" description={preview ? preview.name : "Choose Preview on a PDF or image."}>
        {preview && url ? (
          preview.mime === "application/pdf" ? (
            <iframe title={`Preview of ${preview.name}`} src={url} className="h-[28rem] w-full rounded-[14px] border" />
          ) : (
            <img src={url} alt={`Preview of ${preview.name}`} className="w-full rounded-[14px] border object-contain" />
          )
        ) : preview ? (
          <p className="text-sm text-muted-foreground">Preview is available right after you upload or replace this file. Replace it to preview again.</p>
        ) : (
          <div className="grid h-48 place-items-center rounded-[14px] border border-dashed text-muted-foreground"><Eye className="h-6 w-6" /></div>
        )}
      </Panel>
    </div>
  );
}

export function Delivery({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const d = downloadOf(item);
  const [limit, setLimit] = useState(String(d.limit));
  const [expiry, setExpiry] = useState(String(d.expiryDays));
  const set = (patch: Partial<DownloadConfig>) => patchItem({ download: { ...d, ...patch } });
  const whole = (v: string) => v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel title="Download permissions">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!whole(limit) || !whole(expiry)) { toast.error("Use whole numbers, 0 or more."); return; }
            set({ limit: Number(limit), expiryDays: Number(expiry) });
            toast.success("Download permissions saved");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="dl-limit" label="Downloads per buyer" hint="0 means unlimited">
              <Input id="dl-limit" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
            </Field>
            <Field id="dl-expiry" label="Link expires after (days)" hint="0 means never">
              <Input id="dl-expiry" type="number" min="0" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </Field>
          </div>
          <Button type="submit">Save permissions</Button>
        </form>
        <p className="mt-4 rounded-[14px] bg-ice p-3 text-sm text-cobalt">
          Buyers can download {d.limit ? `${d.limit} time${d.limit === 1 ? "" : "s"}` : "as often as they like"}
          {d.expiryDays ? ` within ${d.expiryDays} day${d.expiryDays === 1 ? "" : "s"} of buying` : ", with no expiry"}.
        </p>
      </Panel>
      <Panel title="Digital delivery">
        <ToggleRow id="dl-email" label="Email download link instantly" description="Send the link as soon as payment succeeds." checked={d.instantEmail} onChange={(instantEmail) => set({ instantEmail })} />
        <ToggleRow id="dl-mark" label="Stamp buyer email on PDFs" description="Discourages sharing by adding the buyer's email to each page." checked={d.watermark} onChange={(watermark) => set({ watermark })} />
        <div className="mt-3 space-y-1.5">
          <Label className="text-[13px] font-bold">Licence</Label>
          <FilterSelect label="Licence" className="w-full sm:w-full" value={d.license} onChange={(v) => set({ license: v as DownloadConfig["license"] })} options={LICENSES.map((l) => [l, licenseLabel[l]] as [string, string])} />
        </div>
      </Panel>
    </div>
  );
}

export function Buyers({ item, orders }: ProductProps) {
  const { patchOrder, customer } = useProduct(item);
  const d = downloadOf(item);
  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  if (!paid.length)
    return <Panel><EmptyState icon={Users} title="No buyers yet" description="Buyers and their download activity appear here after a purchase." /></Panel>;
  return (
    <Panel title="Buyers and download access" bodyClassName="p-0">
      <ul className="divide-y">
        {paid.map((o) => {
          const a = downloadAccess(o, d, now);
          const c = customer(o.customerId);
          return (
            <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c?.name ?? "Buyer"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c?.email} · Bought {shortDate(o.date)} · {o.downloads ?? 0}{d.limit ? `/${d.limit}` : ""} downloads
                  {a.expiresAt ? ` · Expires ${shortDate(a.expiresAt.toISOString())}` : ""}
                </p>
              </div>
              <Pill tone={a.ok ? "success" : "warn"}>{a.ok ? "Active" : a.reason}</Pill>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="soft" disabled={!a.ok || !d.files.length} onClick={() => { patchOrder(o.id, { downloads: (o.downloads ?? 0) + 1 }); toast.success("Download added to the count"); window.__lovableEvents?.track?.("project.download_accessed", { surface: "creator", file_count: d.files.length }); }}>Record a download</Button>
                <Button size="sm" variant="outline" disabled={!o.downloads} onClick={() => { patchOrder(o.id, { downloads: 0 }); toast.success("Download count reset"); }}>Reset count</Button>
                <Button size="sm" variant="ghost" onClick={() => { patchOrder(o.id, { revoked: !o.revoked }); toast.success(o.revoked ? "Access restored" : "Access revoked"); }}>{o.revoked ? "Restore access" : "Revoke access"}</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
