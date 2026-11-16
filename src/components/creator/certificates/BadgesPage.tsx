import { Award, Check, Copy, FileBadge2, Medal, PenLine, Plus, Trash2, Undo2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, phoneSheetClass } from "@/components/dashboard-ui/dialog";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/affiliate/ui";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { useCreator } from "@/lib/creator/store";
import { BADGE_CATEGORIES, BADGE_ICONS, PLATFORM_BADGES, awardedByLabel, categoryInfo, type BadgeCategory, type BadgeDefinition, type BadgeIcon } from "@/lib/shared/badges";
import { brandFileProblem, readBrandImage } from "@/lib/shared/brandImage";
import { decideCorrection, pendingRegistryCorrection, customBadgeDefinition, readCredentials, removeCustomBadge, revokeBadgeAward, revokeCertificate, saveCustomBadge, useCredentials, type CustomBadge } from "@/lib/shared/credentials";
import { certDate } from "@/lib/shared/certificate";
import { cn } from "@/lib/utils";
import { IssueCertificateDialog, copyVerifyLink } from "./IssueDialogs";
import { UploadTile } from "./CertificateBranding";

type Tab = "library" | "badges" | "certificates";

function BadgeCard({ badge, onAward, onEdit, onDelete }: { badge: BadgeDefinition; onAward?: (() => void) | undefined; onEdit?: (() => void) | undefined; onDelete?: (() => void) | undefined }) {
  return (
    <li className="surface flex min-w-0 flex-col p-4">
      <div className="flex items-start gap-3">
        <BadgeEmblem badge={badge} size={64} />
        <div className="min-w-0">
          <p className="text-sm font-extrabold">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      </div>
      <p className="mt-3 text-xs"><b>Criteria:</b> {badge.criteria}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{badge.owner ? "Your custom badge" : awardedByLabel[badge.awardedBy]}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        {badge.awardedBy === "issuer" ? <Button size="sm" onClick={onAward}><Award aria-hidden="true" />Award</Button> : <StatusBadge tone="neutral">{badge.awardedBy === "auto" ? "Automatic" : "Enski only"}</StatusBadge>}
        {onEdit && <Button size="sm" variant="outline" onClick={onEdit}><PenLine aria-hidden="true" />Edit</Button>}
        {onDelete && <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 aria-hidden="true" />Delete</Button>}
      </div>
    </li>
  );
}

type Draft = { id?: string | undefined; name: string; description: string; criteria: string; category: BadgeCategory; icon: BadgeIcon; artwork: string };
const blank: Draft = { name: "", description: "", criteria: "", category: "skills", icon: "target", artwork: "" };

function CustomBadgeDialog({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (v: boolean) => void; initial?: CustomBadge | undefined }) {
  const { state } = useCreator();
  const [d, setD] = useState<Draft>(blank);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  /** After saving: the saved badge, shown as a confirmation with its next steps. */
  const [saved, setSaved] = useState<{ id: string; draft: Draft; updated: boolean; awarded: number } | null>(null);
  useEffect(() => {
    if (!open) return;
    setSaved(null);
    setD(initial ? { id: initial.id, name: initial.name, description: initial.description, criteria: initial.criteria, category: initial.category, icon: initial.icon, artwork: initial.artwork } : blank); setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);
  const reset = (v: boolean) => onOpenChange(v);
  const pick = async (f: File) => {
    const p = brandFileProblem(f);
    if (p) { setErrors((e) => ({ ...e, artwork: p })); return; }
    setBusy(true);
    try { const artwork = await readBrandImage(f, { max: 320, trim: true }); setD((v) => ({ ...v, artwork })); setErrors((e) => ({ ...e, artwork: undefined })); }
    catch (e) { setErrors((x) => ({ ...x, artwork: e instanceof Error ? e.message : "We couldn't read that image." })); }
    finally { setBusy(false); }
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      name: d.name.trim().length >= 3 ? undefined : "Give the badge a name (3+ characters)",
      description: d.description.trim().length >= 10 ? undefined : "Describe what it recognises (10+ characters)",
      criteria: d.criteria.trim().length >= 15 ? undefined : "Write clear criteria learners must meet (15+ characters)",
    };
    setErrors(next);
    if (next.name || next.description || next.criteria) return;
    const ok = saveCustomBadge({ id: d.id, name: d.name.trim().slice(0, 40), description: d.description.trim().slice(0, 160), criteria: d.criteria.trim().slice(0, 240), category: d.category, icon: d.icon, artwork: d.artwork, owner: state.profile.email.toLowerCase(), issuer: `${state.profile.firstName} ${state.profile.lastName}`.trim() || "Enski creator" });
    if (!ok) { toast.error("This device is out of space. Try a smaller image."); return; }
    const creds = readCredentials();
    const id = d.id ?? creds.customBadges[0]?.id ?? "";
    setSaved({ id, draft: { ...d, name: d.name.trim().slice(0, 40), description: d.description.trim().slice(0, 160), criteria: d.criteria.trim().slice(0, 240) }, updated: !!initial, awarded: creds.badgeAwards.filter((a) => a.badgeId === id).length });
  };
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className={cn("max-h-[92dvh] overflow-y-auto sm:max-w-xl", phoneSheetClass)}>
        {saved ? (
          <div className="grid gap-5 text-center">
            <DialogHeader className="items-center text-center">
              <div className="outcome-emblem outcome-pop relative mx-auto">
                <span className="outcome-burst" aria-hidden="true" />
                <BadgeEmblem badge={{ ...saved.draft, name: saved.draft.name }} size={132} label={`${saved.draft.name} badge`} />
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 self-center rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-midnight"><Check className="h-3.5 w-3.5" aria-hidden="true" />{saved.updated ? "Badge updated" : "Badge created"}</p>
              <DialogTitle className="mt-2 text-xl">{saved.draft.name}</DialogTitle>
              <DialogDescription>{categoryInfo[saved.draft.category].label} · in your badge library</DialogDescription>
            </DialogHeader>
            <dl className="grid gap-2 rounded-2xl border bg-soft p-4 text-left text-sm">
              <div><dt className="text-xs font-semibold text-muted-foreground">What it recognises</dt><dd className="font-semibold">{saved.draft.description}</dd></div>
              <div><dt className="text-xs font-semibold text-muted-foreground">Criteria</dt><dd className="font-semibold">{saved.draft.criteria}</dd></div>
            </dl>
            <p className="text-xs text-muted-foreground">
              {saved.updated
                ? saved.awarded ? `The ${saved.awarded} already awarded keep${saved.awarded === 1 ? "s" : ""} the version learners received. New awards use this one.` : "New awards use this version."
                : "Award it when a learner meets the criteria. It appears in their badge collection with your name as issuer."}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
              <Button asChild><Link to="/creator/badges/award" search={{ badge: saved.id }} onClick={() => onOpenChange(false)}><Award aria-hidden="true" />Award this badge</Link></Button>
            </div>
          </div>
        ) : (
        <form onSubmit={save} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit badge" : "Create a custom badge"}</DialogTitle>
            <DialogDescription>Your badge uses Enski's premium design for its category, with your icon or artwork in the centre.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 rounded-2xl border bg-soft p-4">
            <BadgeEmblem badge={{ ...d, name: d.name || "Badge" }} size={96} />
            <div className="min-w-0"><p className="truncate font-extrabold">{d.name || "Badge name"}</p><p className="text-xs font-semibold text-cobalt">{categoryInfo[d.category].label}</p></div>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="cb-name">Badge name</Label><Input id="cb-name" value={d.name} maxLength={40} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!errors["name"]} />{errors["name"] && <p className="text-xs font-semibold text-destructive">{errors["name"]}</p>}</div>
          <div className="grid gap-1.5"><Label htmlFor="cb-desc">Description</Label><Textarea id="cb-desc" rows={2} maxLength={160} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} aria-invalid={!!errors["description"]} />{errors["description"] && <p className="text-xs font-semibold text-destructive">{errors["description"]}</p>}</div>
          <div className="grid gap-1.5"><Label htmlFor="cb-crit">Achievement criteria</Label><Textarea id="cb-crit" rows={2} maxLength={240} value={d.criteria} placeholder="e.g. Built and presented a working landing page that converts at 3% or more." onChange={(e) => setD({ ...d, criteria: e.target.value })} aria-invalid={!!errors["criteria"]} />{errors["criteria"] && <p className="text-xs font-semibold text-destructive">{errors["criteria"]}</p>}</div>
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold">Category and shape</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BADGE_CATEGORIES.map((c) => (
                <button key={c} type="button" aria-pressed={d.category === c} onClick={() => setD({ ...d, category: c })} className={cn("flex items-center gap-2 rounded-xl border bg-card p-2 text-left text-xs font-bold", d.category === c ? "border-cobalt text-cobalt" : "hover:border-cobalt-300")}>
                  <BadgeEmblem badge={{ ...d, category: c, name: "" }} size={32} />{categoryInfo[c].label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold">Icon</legend>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
              {BADGE_ICONS.map((i) => (
                <button key={i} type="button" aria-label={i} aria-pressed={d.icon === i && !d.artwork} onClick={() => setD({ ...d, icon: i, artwork: "" })} className={cn("grid aspect-square place-items-center rounded-lg border bg-card", d.icon === i && !d.artwork ? "border-cobalt" : "hover:border-cobalt-300")}>
                  <BadgeEmblem badge={{ category: d.category, icon: i, name: "" }} size={34} />
                </button>
              ))}
            </div>
          </fieldset>
          <UploadTile id="cb-art" label="Custom artwork (optional)" hint="Replaces the icon. Square images work best; it's cropped to a circle." value={d.artwork} busy={busy} error={errors["artwork"] ?? null} onPick={pick} onRemove={() => setD({ ...d, artwork: "" })} />
          <DialogActions><Button type="submit">{initial ? "Save badge" : "Create badge"}</Button></DialogActions>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RevokeDialog({ target, onClose }: { target: { kind: "badge" | "certificate"; id: string; label: string } | null; onClose: () => void }) {
  const { state } = useCreator();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [review, setReview] = useState(false);
  const what = target?.kind === "badge" ? "badge" : "certificate";
  const reset = () => { setReason(""); setErr(""); setReview(false); };
  return (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}
      art={brandArtwork.shield}
      eyebrow={review ? "Review and confirm" : target?.kind === "badge" ? "Revoke badge · step 1 of 2" : "Revoke certificate · step 1 of 2"}
      title={review ? `Revoke ${target?.label ?? ""} now?` : `Why revoke ${target?.label ?? ""}?`}
      description={review ? `The ${what} stays on record. The holder and the verification page will show it as revoked with the reason below. This can't be undone.` : `Tell the holder why. The reason appears on the ${what} and on its verification page.`}
      confirmLabel={review ? "Confirm revocation" : "Review"}
      onConfirm={() => {
        if (!target) return false;
        if (!review) {
          if (reason.trim().length < 5) { setErr("Give a reason (5+ characters)"); return false; }
          setReview(true);
          return false;
        }
        const ok = target.kind === "badge" ? revokeBadgeAward(target.id, reason, state.profile.email) : revokeCertificate(target.id, reason, state.profile.email);
        if (!ok) { setErr("Couldn't save. Free up some space on this device and try again."); return false; }
        reset(); onClose();
        if (target.kind === "badge") void navigate({ to: "/creator/badges/awards/$awardId", params: { awardId: target.id } });
        else void navigate({ to: "/creator/badges/certificates/$code", params: { code: target.id } });
        return true;
      }}
    >
      {review ? (
        <dl className="grid gap-2 rounded-2xl bg-soft p-4 text-left text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{what === "badge" ? "Badge" : "Certificate"}</dt><dd className="text-right font-bold">{target?.label}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">ID</dt><dd className="font-mono text-xs font-bold">{target?.id}</dd></div>
          <div className="grid gap-1"><dt className="text-muted-foreground">Reason</dt><dd className="font-semibold">{reason.trim()}</dd></div>
          <button type="button" onClick={() => setReview(false)} className="justify-self-start text-xs font-bold text-cobalt hover:underline">Edit reason</button>
          {err && <p className="text-xs font-semibold text-destructive">{err}</p>}
        </dl>
      ) : (
        <div className="grid gap-1.5 text-left">
          <Label htmlFor="revoke-reason">Reason</Label>
          <Textarea id="revoke-reason" rows={2} maxLength={200} value={reason} onChange={(e) => { setReason(e.target.value); setErr(""); }} placeholder="e.g. Awarded in error" />
          {err && <p className="text-xs font-semibold text-destructive">{err}</p>}
        </div>
      )}
    </ConfirmDialog>
  );
}

export function BadgesPage({ tab }: { tab: Tab }) {
  const { state } = useCreator();
  const creds = useCredentials();
  const me = state.profile.email.toLowerCase();
  const [current, setCurrent] = useState<Tab>(tab);
  const navigate = useNavigate();
  const [issueOpen, setIssueOpen] = useState(false);
  const [editing, setEditing] = useState<CustomBadge | null | "new">(null);
  const [deleting, setDeleting] = useState<CustomBadge | null>(null);
  const [revoking, setRevoking] = useState<{ kind: "badge" | "certificate"; id: string; label: string } | null>(null);
  const mine = creds.customBadges.filter((b) => b.owner === me && !b.archived);
  const myAwards = creds.badgeAwards.filter((a) => a.issuerEmail === me);
  const myCerts = creds.certificates.filter((c) => c.issuerEmail === me);
  const openAward = (id?: string) => void navigate({ to: "/creator/badges/award", search: id ? { badge: id } : {} });
  return (
    <div>
      <PageHeader eyebrow="Credentials" title="Badges & certificates" description="Award badges for real achievements, issue certificates, and manage what you've issued." actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIssueOpen(true)}><FileBadge2 aria-hidden="true" />Issue certificate</Button>
          <Button onClick={() => openAward()}><Award aria-hidden="true" />Award badge</Button>
        </div>
      } />
      <Tabs value={current} onValueChange={(v) => setCurrent(v as Tab)}>
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="library">Badge library</TabsTrigger>
          <TabsTrigger value="badges">Issued badges ({myAwards.length})</TabsTrigger>
          <TabsTrigger value="certificates">Issued certificates ({myCerts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="space-y-8">
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />Your custom badges</h2>
              <Button size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden="true" />Create badge</Button>
            </div>
            {mine.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{mine.map((b) => <BadgeCard key={b.id} badge={customBadgeDefinition(b)} onAward={() => openAward(b.id)} onEdit={() => setEditing(b)} onDelete={() => setDeleting(b)} />)}</ul>
            ) : (
              <div className="surface"><EmptyState icon={Medal} title="No custom badges yet" description="Create one for a skill or achievement specific to your course, with your own criteria." action={<Button onClick={() => setEditing("new")}><Plus aria-hidden="true" />Create badge</Button>} /></div>
            )}
          </section>
          {BADGE_CATEGORIES.map((c) => (
            <section key={c}>
              <h2 className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />{categoryInfo[c].label}</h2>
              <p className="mb-3 text-sm text-muted-foreground">{categoryInfo[c].blurb}</p>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{PLATFORM_BADGES.filter((b) => b.category === c).map((b) => <BadgeCard key={b.id} badge={b} onAward={() => openAward(b.id)} />)}</ul>
            </section>
          ))}
        </TabsContent>
        <TabsContent value="badges">
          {myAwards.length ? (
            <Panel bodyClassName="p-0">
              <ul className="divide-y">
                {myAwards.map((a) => (
                  <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <BadgeEmblem badge={a.badge} size={48} locked={a.status === "revoked"} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold">{a.badge.name} <span className="font-semibold text-muted-foreground">· {a.recipientName}</span></p>
                      <p className="truncate text-xs text-muted-foreground">{a.recipientEmail} · {certDate(a.issuedAt)} · ID {a.id}{a.courseTitle ? ` · ${a.courseTitle}` : ""}</p>
                      {a.status === "revoked" && <p className="text-xs text-destructive">Revoked: {a.revokeReason}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge tone={a.status === "active" ? "success" : "pending"}>{a.status === "active" ? "Active" : "Revoked"}</StatusBadge>
                      <Button size="sm" variant="outline" onClick={() => void copyVerifyLink(a.id)}><Copy aria-hidden="true" />Link</Button>
                      {a.status === "active" && <Button size="sm" variant="ghost" onClick={() => setRevoking({ kind: "badge", id: a.id, label: `${a.badge.name} for ${a.recipientName}` })}><Undo2 aria-hidden="true" />Revoke</Button>}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : <div className="surface"><EmptyState icon={Award} title="No badges awarded yet" description="Award one from the library when a learner meets its criteria." action={<Button onClick={() => openAward()}>Award badge</Button>} /></div>}
        </TabsContent>
        <TabsContent value="certificates">
          <p className="mb-3 text-sm text-muted-foreground">Certificates you issued by hand. Certificates earned automatically by finishing a course are listed in each course's Certificate tab.</p>
          {myCerts.length ? (
            <Panel bodyClassName="p-0">
              <ul className="divide-y">
                {myCerts.map((c) => { const req = pendingRegistryCorrection(creds, c.code); return (
                  <li key={c.code} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ice text-cobalt"><FileBadge2 className="h-5 w-5" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold">{c.recipientName} <span className="font-semibold text-muted-foreground">· {c.courseTitle}</span></p>
                      <p className="truncate text-xs text-muted-foreground">{c.recipientEmail} · {certDate(c.issuedAt)} · ID {c.code}</p>
                      {c.status === "revoked" && <p className="text-xs text-destructive">Revoked: {c.revokeReason}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge tone={c.status === "active" ? "success" : "pending"}>{c.status === "active" ? "Valid" : "Revoked"}</StatusBadge>
                      <Button size="sm" variant="outline" onClick={() => void copyVerifyLink(c.code)}><Copy aria-hidden="true" />Link</Button>
                      {c.status === "active" && <Button size="sm" variant="ghost" onClick={() => setRevoking({ kind: "certificate", id: c.code, label: `the certificate for ${c.recipientName}` })}><Undo2 aria-hidden="true" />Revoke</Button>}
                    </div></div>
                    {c.previousNames.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Earlier name{c.previousNames.length > 1 ? "s" : ""}: {c.previousNames.map((p) => p.name).join(", ")}</p>}
                    {req && (
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-warning bg-warning-soft p-3 sm:flex-row sm:items-center">
                        <p className="min-w-0 flex-1 text-xs"><b>Name correction requested:</b> "{req.currentName}" → "{req.requestedName}". <span className="text-muted-foreground">{req.reason}</span></p>
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" variant="outline" onClick={() => { decideCorrection(req.id, false, me); toast("Correction declined"); }}>Decline</Button>
                          <Button size="sm" onClick={() => { decideCorrection(req.id, true, me); toast.success("Name corrected", { description: `Same ID ${c.code}. The earlier name is kept on record.` }); }}>Approve</Button>
                        </div>
                      </div>
                    )}
                  </li>
                ); })}
              </ul>
            </Panel>
          ) : <div className="surface"><EmptyState icon={FileBadge2} title="No certificates issued by hand" description="Issue one to a student who completed your course." action={<Button onClick={() => setIssueOpen(true)}>Issue certificate</Button>} /></div>}
        </TabsContent>
      </Tabs>
      <IssueCertificateDialog open={issueOpen} onOpenChange={setIssueOpen} />
      <CustomBadgeDialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)} initial={editing && editing !== "new" ? editing : undefined} />
      <RevokeDialog target={revoking} onClose={() => setRevoking(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        art={brandArtwork.bin}
        eyebrow="Delete badge"
        title={`Delete ${deleting?.name ?? "this badge"}?`}
        description={deleting && creds.badgeAwards.some((a) => a.badgeId === deleting.id) ? "It's already been awarded, so it's archived instead: learners keep theirs and verification still works." : "It hasn't been awarded to anyone, so it's removed."}
        confirmLabel="Delete"
        onConfirm={() => { if (deleting) { removeCustomBadge(deleting.id); toast("Badge removed"); } setDeleting(null); }}
      />
    </div>
  );
}
