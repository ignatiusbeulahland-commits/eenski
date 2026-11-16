import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { Link, useNavigate } from "@tanstack/react-router";
import { SectionNavDropdown } from "@/components/shared/SectionDropdown";
import { PageTopRight } from "@/components/shared/BackBar";
import { useState } from "react";
import { Check, Users, UserPlus, Megaphone, ListChecks, Plus, Pencil, Trash2, Receipt, Copy } from "lucide-react";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { GlassStat } from "./products/ProductChrome";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { Label } from "@/components/dashboard-ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { isEmail, saveRule, validateRule, type CommissionRule } from "@/lib/creator/rules";
import { CreatorNotFound, ItemLink, ItemStatus, copyText, shortDate } from "./shared";
function AffiliateTabs() {
  const { state } = useCreator();
  const active = state.affiliates.filter((a) => a.status === "active").length;
  const invited = state.affiliates.length - active;
  const live = state.programs.filter((p) => p.status === "active").length;
  const def = state.rules.find((r) => r.isDefault);
  const steps = [
    { done: state.rules.length > 0, title: "Set a commission rule", text: "Decide what affiliates earn per sale.", to: "/creator/commission-rules" as const },
    { done: state.programs.length > 0, title: "Add a product to promote", text: "Choose published products for your programme.", to: "/creator/affiliations" as const },
    { done: state.affiliates.length > 0, title: "Invite affiliates", text: "People who'll share your products.", to: "/creator/affiliates" as const },
  ];
  const tabs = [
    { to: "/creator/affiliates" as const, label: "Affiliates", icon: Users, n: state.affiliates.length, exact: true },
    { to: "/creator/affiliations" as const, label: "Ongoing Promotions", icon: Megaphone, n: state.programs.length, exact: true },
    { to: "/creator/affiliations/sales" as const, label: "Affiliate Sales", icon: Receipt, n: undefined, exact: false },
    { to: "/creator/commission-rules" as const, label: "Commission Rules", icon: ListChecks, n: state.rules.length, exact: false },
  ];
  return (
    <>
      <section data-surface="dark" className="bg-brand-panel relative mb-5 overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-6" aria-label="Affiliate programme">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-4 lg:w-72">
            <BrandIcon src={brandArtwork.affiliations} className="product-hero-art h-16 w-16 shrink-0" />
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">Affiliate programme</p><p className="mt-1 text-lg font-extrabold leading-tight">{live ? `${live} product${live === 1 ? "" : "s"} being promoted` : "Grow with affiliates"}</p></div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
            <GlassStat label="Active affiliates" value={active} hint={invited ? `${invited} invited` : undefined} />
            <GlassStat label="Live promotions" value={live} hint={state.programs.length - live ? `${state.programs.length - live} paused` : undefined} />
            <GlassStat label="Affiliate sales" value={0} />
            <GlassStat label="Default commission" value={def ? `${def.rate}%` : "—"} hint={def ? def.name : "Not set"} />
          </div>
        </div>
      </section>
      {!steps.every((x) => x.done) && (
        <ol className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Set up your programme">
          {steps.map((x, i) => (
            <li key={x.title}>
              <Link to={x.to} className={cn("surface group flex h-full items-start gap-3 p-4 transition-colors hover:border-cobalt-100", x.done && "border-success/30 bg-success-soft/40")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold", x.done ? "bg-success text-primary-foreground" : "bg-ice text-cobalt")}>{x.done ? <Check className="h-4 w-4" /> : i + 1}</span>
                <span className="min-w-0"><span className="block text-sm font-extrabold group-hover:text-cobalt">{x.title}</span><span className="block text-[13px] text-muted-foreground">{x.text}</span></span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <PageTopRight><SectionNavDropdown compact heading="Affiliate section" links={tabs.map((t) => ({ to: t.to, label: t.label, icon: t.icon, count: t.n, exact: t.exact }))} className="min-w-0 max-w-full" /></PageTopRight>
      <nav aria-label="Affiliate sections" className="mb-6 hidden md:block">
        <ul className="inline-flex max-w-full flex-wrap gap-1 rounded-[22px] border bg-card p-1">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link to={t.to} activeOptions={{ exact: t.exact }} className="lime-pip group flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt data-[status=active]:bg-cobalt data-[status=active]:text-primary-foreground">
                <t.icon className="h-4 w-4" />{t.label}
                {t.n !== undefined && <span className="chip-count rounded-full bg-soft px-1.5 text-[11px] font-extrabold text-muted-foreground group-data-[status=active]:bg-on-dark/20 group-data-[status=active]:text-primary-foreground">{t.n}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
export function AffiliatesPage() {
  const { state, update } = useCreator();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [invite, setInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const list = state.affiliates.filter(
    (a) => (a.name + a.email).toLowerCase().includes(q.toLowerCase()) && (status === "all" || a.status === status),
  );
  const button = (
    <Button
      onClick={() => {
        setError("");
        setInvite(true);
      }}
    >
      <UserPlus />
      Invite affiliate
    </Button>
  );
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Affiliates" description="People who promote your products and earn a commission." actions={button} />
      <AffiliateTabs />
      {state.affiliates.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <SearchInput value={q} onChange={setQ} placeholder="Search affiliates" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={[
              ["all", "All statuses"],
              ["invited", "Invited"],
              ["active", "Active"],
            ]}
          />
        </div>
      )}
      <Panel title="Your affiliates">
        <div className="divide-y">
          {list.map((a) => (
            <Link
              key={a.id}
              to="/creator/affiliates/$affiliateId"
              params={{ affiliateId: a.id }}
              className="-mx-5 flex items-center gap-3 px-5 py-4 text-sm transition-colors hover:bg-soft/70"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ice text-sm font-extrabold text-cobalt" aria-hidden="true">{a.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{a.name}</p>
                <p className="truncate text-xs text-muted-foreground">{a.email} · Invited {shortDate(a.date)}</p>
              </div>
              <ItemStatus status={a.status} />
            </Link>
          ))}
        </div>
        {!list.length && (
          <EmptyState
            icon={Users}
            title={state.affiliates.length ? "No matching affiliates" : "No affiliates yet"}
            description={
              state.affiliates.length
                ? "Try another search or filter."
                : "Invite affiliates, or add products to Ongoing Promotions so affiliates can find them."
            }
            compact
          />
        )}
      </Panel>
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite affiliate</DialogTitle>
            <DialogDescription>They'll get an invitation to promote your products.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !isEmail(email)) return setError("Enter a name and a valid email.");
              if (state.affiliates.some((a) => a.email.toLowerCase() === email.trim().toLowerCase()))
                return setError("This person has already been invited.");
              update((s) => ({
                affiliates: [...s.affiliates, { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), status: "invited", date: new Date().toISOString() }],
                activity: [...s.activity, activityEntry(`Affiliate invited: ${name.trim()}`)],
              }));
              setInvite(false);
              setName("");
              setEmail("");
              toast.success("Invitation sent");
            }}
          >
            <Field id="aff-name" label="Name">
              <Input id="aff-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="aff-email" label="Email">
              <Input id="aff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Send invite</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function AffiliateDetails({ id }: { id: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const [remove, setRemove] = useState(false);
  const a = state.affiliates.find((x) => x.id === id);
  if (!a) return <CreatorNotFound what="affiliate" />;
  return (
    <div>
      <PageHeader eyebrow="Affiliate" title={a.name} description={a.email} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Status">
          <ItemStatus status={a.status} />
          <p className="mt-3 text-sm text-muted-foreground">Invited {shortDate(a.date)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {a.status === "invited" && (
              <Button
                variant="soft"
                onClick={() => {
                  update((s) => ({
                    affiliates: s.affiliates.map((x) => (x.id === id ? { ...x, status: "active" as const } : x)),
                    activity: [...s.activity, activityEntry(`Affiliate joined: ${a.name}`)],
                  }));
                  toast.success("Invitation accepted");
                }}
              >
                Mark as accepted
              </Button>
            )}
            <Button variant="outline" onClick={() => setRemove(true)}>
              <Trash2 />
              Remove
            </Button>
          </div>
        </Panel>
        <Panel title="Referred sales">
          <EmptyState icon={Receipt} title="No referred sales yet" description="Sales this affiliate refers will appear here." compact />
        </Panel>
      </div>
      <ConfirmDialog
        open={remove}
        onOpenChange={setRemove}
        art={brandArtwork.people}
        eyebrow="Affiliates"
        title={`Remove ${a.name}?`}
        description="They will no longer be able to promote your products."
        confirmLabel="Remove affiliate"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          update((s) => ({ affiliates: s.affiliates.filter((x) => x.id !== id) }));
          toast.success("Affiliate removed");
          navigate({ to: "/creator/affiliates" });
        }}
      />
    </div>
  );
}
export function OngoingPromotions() {
  const { state, update } = useCreator();
  const [add, setAdd] = useState(false);
  const eligible = state.items.filter((i) => i.status === "published" && !state.programs.some((p) => p.itemId === i.id));
  const [itemId, setItemId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const open = () => {
    setItemId(eligible[0]?.id ?? "");
    setRuleId(state.rules.find((r) => r.isDefault)?.id ?? state.rules[0]?.id ?? "");
    setAdd(true);
  };
  const button = (
    <Button onClick={open}>
      <Plus />
      Add product
    </Button>
  );
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Ongoing promotions" description="Products affiliates can promote, and the commission each one earns." actions={button} />
      <AffiliateTabs />
      <Panel title="Products in your affiliate programme">
        <div className="divide-y">
          {state.programs.map((p) => {
            const item = state.items.find((i) => i.id === p.itemId);
            const rule = state.rules.find((r) => r.id === p.ruleId);
            return (
              <Link
                key={p.id}
                to="/creator/affiliations/$programId"
                params={{ programId: p.id }}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:bg-soft"
              >
                <div className="min-w-0">
                  <p className="font-bold">{item?.title ?? "Unavailable product"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{rule ? `${rule.name} · ${rule.rate}% commission` : "No commission rule"}</p>
                </div>
                <ItemStatus status={p.status} />
              </Link>
            );
          })}
        </div>
        {!state.programs.length && (
          <EmptyState icon={Megaphone} title="No ongoing promotions" description="Add a published product so affiliates can start promoting it." action={button} compact />
        )}
      </Panel>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add product to affiliate programme</DialogTitle>
            <DialogDescription>Choose a published product and the commission rule affiliates earn.</DialogDescription>
          </DialogHeader>
          {!eligible.length ? (
            <p className="text-sm text-muted-foreground">
              Publish a product first. Products already in the programme aren't listed.
            </p>
          ) : !state.rules.length ? (
            <div>
              <p className="text-sm text-muted-foreground">Create a commission rule first.</p>
              <Button asChild className="mt-4" onClick={() => setAdd(false)}>
                <Link to="/creator/commission-rules">Create commission rule</Link>
              </Button>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const item = eligible.find((i) => i.id === itemId);
                if (!item || !state.rules.some((r) => r.id === ruleId)) return void toast.error("Choose a product and rule.");
                update((s) => ({
                  programs: [...s.programs, { id: crypto.randomUUID(), itemId, ruleId, status: "active", date: new Date().toISOString() }],
                  activity: [...s.activity, activityEntry(`Added to affiliate programme: ${item.title}`)],
                }));
                setAdd(false);
                toast.success("Product added to Ongoing Promotions");
              }}
            >
              <Label>Product</Label>
              <FilterSelect label="Product" value={itemId} onChange={setItemId} className="w-full sm:w-full" options={eligible.map((i) => [i.id, i.title] as [string, string])} />
              <Label>Commission rule</Label>
              <FilterSelect label="Commission rule" value={ruleId} onChange={setRuleId} className="w-full sm:w-full" options={state.rules.map((r) => [r.id, `${r.name} · ${r.rate}%`] as [string, string])} />
              <DialogActions><Button type="submit">Add product</Button></DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function ProgramDetails({ id }: { id: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const p = state.programs.find((x) => x.id === id);
  if (!p) return <CreatorNotFound what="programme" />;
  const item = state.items.find((i) => i.id === p.itemId);
  const rule = state.rules.find((r) => r.id === p.ruleId);
  const link = item && state.storefront.handle ? `https://tryenski.com/${state.storefront.handle}/${item.id}` : "";
  return (
    <div>
      <PageHeader
        eyebrow="Ongoing promotion"
        title={item?.title ?? "Unavailable product"}
        actions={
          <Button
            onClick={() => {
              const status = p.status === "active" ? "paused" : "active";
              update((s) => ({ programs: s.programs.map((x) => (x.id === id ? { ...x, status } : x)) }));
              toast.success(status === "active" ? "Promotion resumed" : "Promotion paused");
            }}
          >
            {p.status === "active" ? "Pause" : "Resume"}
          </Button>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Details">
          <ItemStatus status={p.status} />
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Commission</dt>
              <dd className="font-bold">{rule ? `${rule.rate}% · ${rule.name}` : "No rule"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Since</dt>
              <dd className="font-bold">{shortDate(p.date)}</dd>
            </div>
          </dl>
          {rule && state.rules.length > 1 && (
            <div className="mt-5 space-y-2 border-t pt-5">
              <Label>Change rule</Label>
              <FilterSelect label="Change rule"
                value={p.ruleId}
                onChange={(v) => {
                  update((s) => ({ programs: s.programs.map((x) => (x.id === id ? { ...x, ruleId: v } : x)) }));
                  toast.success("Commission rule updated");
                }}
                className="w-full sm:w-full"
                options={state.rules.map((r) => [r.id, `${r.name} · ${r.rate}%`] as [string, string])}
              />
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
            {item && (
              <Button asChild variant="outline">
                <ItemLink item={item}>View product</ItemLink>
              </Button>
            )}
            {link ? (
              <Button variant="outline" onClick={() => copyText(link)}>
                <Copy />
                Copy product link
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/creator/storefront">Set a store handle to share links</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        </Panel>
        <Panel title="Affiliate sales">
          <EmptyState icon={Receipt} title="No affiliate sales yet" description="Sales affiliates refer for this product will appear here." compact />
        </Panel>
      </div>
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        art={brandArtwork.affiliations}
        eyebrow="Affiliate programme"
        title="Remove this product from your programme?"
        description={`Affiliates will stop earning on new sales of ${item?.title ?? "this product"}.`}
        confirmLabel="Remove product"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          const { removed } = removeWhere(state.programs, (x) => x.id === id);
          update((s) => ({ programs: s.programs.filter((x) => x.id !== id) }));
          navigate({ to: "/creator/affiliations" });
          if (removed) undoToast("Removed from affiliate programme", () => update((s) => ({ programs: restoreAt(s.programs, removed, sameId) })));
        }}
      >
        <ConfirmNote>Commissions already earned stay in their history.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );
}
export function AffiliateSales() {
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Affiliate sales" description="Sales your affiliates have referred." />
      <AffiliateTabs />
      <Panel>
        <EmptyState icon={Receipt} title="No affiliate sales yet" description="When an affiliate refers a sale, it will appear here with their commission." />
      </Panel>
    </div>
  );
}
export function CommissionRules() {
  const { state, update } = useCreator();
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [error, setError] = useState("");
  const blank = (): CommissionRule => ({ id: "", name: "", rate: 10, isDefault: !state.rules.length });
  const button = (
    <Button
      onClick={() => {
        setError("");
        setEditing(blank());
      }}
    >
      <Plus />
      Create rule
    </Button>
  );
  return (
    <div>
      <PageHeader eyebrow="Affiliates" title="Commission rules" description="Decide what percentage of each sale affiliates earn." actions={button} />
      <AffiliateTabs />
      <Panel title="Rules">
        <div className="divide-y">
          {state.rules.map((r) => {
            const used = state.programs.filter((p) => p.ruleId === r.id).length;
            return (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <p className="font-bold">
                    {r.name} {r.isDefault && <span className="ml-2 rounded bg-lime px-1.5 py-0.5 text-xs font-bold text-midnight">DEFAULT</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.rate}% commission · Used by {used} product{used === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setError("");
                      setEditing(r);
                    }}
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${r.name}`}
                    onClick={() => {
                      if (used) return void toast.error("Move its products to another rule first.");
                      const { removed } = removeWhere(state.rules, (x) => x.id === r.id);
                      update((s) => ({ rules: s.rules.filter((x) => x.id !== r.id) }));
                      if (removed) undoToast(`Rule "${r.name}" deleted`, () => update((s) => ({ rules: restoreAt(s.rules, removed, sameId) })));
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {!state.rules.length && (
          <EmptyState icon={ListChecks} title="No commission rules yet" description="Create a rule to set how much affiliates earn when they refer a sale." action={button} compact />
        )}
      </Panel>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit rule" : "Create rule"}</DialogTitle>
            <DialogDescription>You choose the rate. Enski doesn't set it for you.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const rule = { ...editing, id: editing.id || crypto.randomUUID(), name: editing.name.trim() };
                const err = validateRule(rule, state.rules);
                if (err) return setError(err);
                update((s) => ({ rules: saveRule(s.rules, rule), activity: [...s.activity, activityEntry(`Commission rule saved: ${rule.name}`)] }));
                setEditing(null);
                toast.success("Rule saved");
              }}
            >
              <Field id="rule-name" label="Rule name">
                <Input id="rule-name" value={editing.name} maxLength={80} placeholder="e.g. Standard" onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field id="rule-rate" label="Commission (%)">
                <Input id="rule-rate" type="number" min="1" max="90" step="0.5" value={editing.rate} onChange={(e) => setEditing({ ...editing, rate: Number(e.target.value) })} />
              </Field>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="rule-default">Use as default rule</Label>
                <Switch id="rule-default" checked={editing.isDefault} onCheckedChange={(v) => setEditing({ ...editing, isDefault: v })} />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <DialogActions><Button type="submit">Save rule</Button></DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
