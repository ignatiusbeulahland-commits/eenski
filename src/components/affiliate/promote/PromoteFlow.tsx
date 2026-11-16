import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, Eye, Link2, RefreshCw, Share2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiFacebook, SiWhatsapp, SiX } from "react-icons/si";
import { CharmFigure } from "@/components/assistant/CharmFigure";
import { lookFor } from "@/components/assistant/looks";
import { OutcomeDetails, OutcomeScreen, ProcessingScreen, outcomeButton, useProcessing } from "@/components/shared/outcome";
import { prefsStore } from "@/lib/assistant/store";
import type { Pose } from "@/lib/assistant/types";
import { estCommission, naira, rateFor, type Product } from "@/lib/affiliate/products";
import { joinProduct } from "@/lib/affiliate/rules";
import { linkFor, promotionOf, recordShare, SHARE_CHANNELS, shareCount, shareMessage, startPromotion, type ShareChannel } from "@/lib/affiliate/promotions";
import { useAffiliate } from "@/lib/affiliate/store";
import { cn } from "@/lib/utils";
import { CommissionChip, LinkBox, ProductMini, PromoteSteps, usePromoLink } from "./parts";

export type PromoteStep = "generating" | "link" | "share" | "done";

/** Steps 3–6 of promoting a product, one screen per step (?step=…). */
export function PromoteFlow({ product, step, renewed }: { product: Product; step: PromoteStep; renewed?: boolean | undefined }) {
  const { state, ready } = useAffiliate();
  const navigate = useNavigate();
  const promoting = state.joined.includes(product.id);
  // Only the generating step may start a promotion; the others need one.
  useEffect(() => {
    if (!ready) return;
    if (step === "generating" && promoting) void navigate({ to: "/affiliate/promote/$productId", params: { productId: product.id }, search: { step: "link" }, replace: true });
    if (step !== "generating" && !promoting) void navigate({ to: "/affiliate/market/$productId", params: { productId: product.id }, replace: true });
  }, [ready, step, promoting, product.id, navigate]);
  if (!ready) return <div className="mx-auto mt-6 h-96 max-w-xl animate-pulse rounded-[28px] bg-soft" />;
  if (step === "generating") return promoting ? null : <Generating product={product} />;
  if (!promoting) return null;
  if (step === "share") return <ShareStep product={product} />;
  if (step === "done") return <DoneStep product={product} />;
  return <LinkStep product={product} renewed={renewed} />;
}

const GEN_STEPS = ["Checking the product", "Creating your personal link", "Adding it to your promoted products"];

function Generating({ product }: { product: Product }) {
  const { update } = useAffiliate();
  const navigate = useNavigate();
  const { active, stop } = useProcessing(GEN_STEPS.length, () => {
    update((s) => ({ joined: joinProduct(s.joined, product.id), promotions: startPromotion(s.promotions ?? {}, product.id) }));
    void navigate({ to: "/affiliate/promote/$productId", params: { productId: product.id }, search: { step: "link" }, replace: true });
  }, 750);
  return (
    <div className="screen-in">
      <PromoteSteps current={1} />
      <ProcessingScreen
        title="Creating your link"
        message={`Setting up your personal link for ${product.title}.`}
        steps={GEN_STEPS}
        active={active}
        onCancel={() => { stop(); void navigate({ to: "/affiliate/market/$productId", params: { productId: product.id } }); }}
      />
    </div>
  );
}

/** A brand panel with Charm reacting, used as the head of the link and share screens. */
function CharmHeader({ pose, cue, eyebrow, title, children }: { pose: Pose; cue: number; eyebrow: string; title: string; children?: ReactNode }) {
  const look = lookFor(prefsStore.use().look);
  return (
    <div data-surface="dark" className="bg-brand-panel relative isolate flex items-end gap-3 overflow-hidden px-5 pt-6 sm:px-8">
      <span className="hero-dots" aria-hidden="true" />
      <div className="relative min-w-0 flex-1 pb-6">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-lime"><span className="neon-dot is-live" aria-hidden="true" />{eyebrow}</p>
        <h1 tabIndex={-1} className="mt-1.5 text-balance text-[24px] font-extrabold leading-tight text-on-dark outline-none sm:text-[30px]">{title}</h1>
        {children && <p className="mt-1.5 max-w-sm text-sm text-on-dark-muted">{children}</p>}
      </div>
      <div className="relative h-32 w-20 shrink-0 sm:h-40 sm:w-24" aria-hidden="true">
        <span className="charm-pedestal" />
        <CharmFigure key={cue} look={look} pose={pose} then={pose === "celebrate" ? "idle" : undefined} thenAfter={2200} className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 drop-shadow-[0_10px_14px_rgb(0_0_0/0.3)]" />
      </div>
    </div>
  );
}

/** Steps 3 and 4: the link is ready, with the tracking ID, status and a big copy button. */
function LinkStep({ product: p, renewed }: { product: Product; renewed?: boolean | undefined }) {
  const { state } = useAffiliate();
  const { url, tracking } = usePromoLink(p.id);
  const promo = promotionOf(state.promotions, p.id);
  const [reaction, setReaction] = useState<{ pose: Pose; n: number }>({ pose: "celebrate", n: 0 });
  return (
    <div className="screen-in">
      <PromoteSteps current={1} />
      <section aria-labelledby="link-title" className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
        <CharmHeader pose={reaction.pose} cue={reaction.n} eyebrow={renewed ? "New link created" : "Link ready"} title={reaction.n ? "Copied! Now share it." : "Your link is ready!"}>
          {renewed ? "Your old link no longer works. Use this one from now on." : "Copy it and share it anywhere your audience hangs out."}
        </CharmHeader>
        <span id="link-title" className="sr-only">Your referral link for {p.title}</span>
        <div className="grid gap-5 p-5 sm:p-8">
          <ProductMini product={p}><CommissionChip product={p} className="mt-1.5" /></ProductMini>
          <LinkBox productId={p.id} onCopied={() => setReaction((r) => ({ pose: r.n % 2 ? "laugh" : "wink", n: r.n + 1 }))} />
          <OutcomeDetails
            title="Link details"
            details={[
              { label: "Tracking ID", value: tracking, mono: true, copy: tracking },
              { label: "Link status", value: state.termsAccepted ? "Active" : "Ready · activates when you accept the terms" },
              { label: "Commission", value: `${rateFor(p)}% · ≈ ${naira(estCommission(p))} per sale` },
              { label: "Copied", value: promo.copies ? `${promo.copies} time${promo.copies === 1 ? "" : "s"}` : "Not yet" },
            ]}
          />
          <p className="-mt-2 text-xs text-muted-foreground">This link stays the same every time you come back. Visits through <span className="break-all font-mono">{url.replace("https://", "")}</span> are matched to tracking ID {tracking}.</p>
          <div className="grid gap-2.5 sm:flex sm:flex-row-reverse sm:justify-start">
            <Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "share" }} className={outcomeButton.primary}><Share2 aria-hidden="true" />Share your link</Link>
            <Link to="/affiliate/market/$productId" params={{ productId: p.id }} className={outcomeButton.secondary}><Eye aria-hidden="true" />View product</Link>
          </div>
          <Link to="/affiliate/my-affiliations" className={cn(outcomeButton.quiet, "mx-auto -mt-2")}><ArrowLeft aria-hidden="true" />Back to promoted products</Link>
        </div>
      </section>
    </div>
  );
}

const CHANNEL_ICON = { whatsapp: SiWhatsapp, facebook: SiFacebook, linkedin: FaLinkedinIn, twitter: SiX, copy: Link2 } as const;

/** Step 5: ready-made messages per channel. Choosing one copies it; nothing is posted for them. */
function ShareStep({ product: p }: { product: Product }) {
  const { state, update } = useAffiliate();
  const { url } = usePromoLink(p.id);
  const [picked, setPicked] = useState<{ id: ShareChannel; ok: boolean; n: number } | null>(null);
  const promo = promotionOf(state.promotions, p.id);
  const share = async (id: ShareChannel) => {
    let ok = true;
    try { await navigator.clipboard.writeText(shareMessage(id, p, url)); } catch { ok = false; }
    update((s) => ({ promotions: recordShare(s.promotions ?? {}, p.id, id), ...(id === "copy" && ok ? { linkCopied: true } : {}) }));
    setPicked((x) => ({ id, ok, n: (x?.n ?? 0) + 1 }));
  };
  const label = picked ? SHARE_CHANNELS.find((c) => c.id === picked.id)!.label : "";
  const total = shareCount(promo);
  return (
    <div className="screen-in">
      <PromoteSteps current={2} />
      <section aria-labelledby="share-title" className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
        <CharmHeader pose={picked ? "thumbsup" : "point"} cue={picked?.n ?? 0} eyebrow="Share" title="Where's your audience?">
          Pick a place. We'll copy a ready-made message with your link for you to paste and post.
        </CharmHeader>
        <span id="share-title" className="sr-only">Share your link for {p.title}</span>
        <div className="grid gap-5 p-5 sm:p-8">
          <ProductMini product={p} />
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-5" aria-label="Share options">
            {SHARE_CHANNELS.map((c) => {
              const Icon = CHANNEL_ICON[c.id];
              const n = promo.shares[c.id] ?? 0;
              const on = picked?.id === c.id;
              return (
                <li key={c.id} className={cn(c.id === "copy" && "col-span-2 sm:col-span-1")}>
                  <button
                    type="button"
                    onClick={() => void share(c.id)}
                    aria-pressed={on}
                    className={cn(
                      "flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] px-2 py-3 text-sm font-extrabold transition-[border-color,background-color,transform] duration-150 active:scale-[0.97]",
                      on ? "border-cobalt bg-ice text-cobalt" : "border-line bg-card text-ink hover:border-sky hover:bg-ice",
                    )}
                  >
                    <span className={cn("grid size-10 place-items-center rounded-full", on ? "bg-cobalt text-primary-foreground" : "bg-soft text-cobalt")}><Icon className="size-[18px]" aria-hidden="true" /></span>
                    {c.label}
                    {n > 0 && <span className="text-[11px] font-bold text-muted-foreground">{n}× so far</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {picked && (
            <div key={picked.n} role="status" className="screen-in rounded-[20px] border border-line bg-soft/70 p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <span className="grid size-6 place-items-center rounded-full bg-success text-primary-foreground"><Check className="size-3.5" strokeWidth={3} aria-hidden="true" /></span>
                {picked.ok ? (picked.id === "copy" ? "Link copied" : `Your ${label} message is copied`) : "Here's your message to copy"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {picked.id === "copy" ? "Paste it anywhere: a chat, your bio, an email." : `Open ${label}, paste it and post it when you're ready.`}
              </p>
              <p className="mt-3 select-all whitespace-pre-line break-words rounded-[14px] bg-card p-3.5 text-[13px] leading-relaxed text-ink ring-1 ring-line">{shareMessage(picked.id, p, url)}</p>
            </div>
          )}
          <div className="grid gap-2.5 sm:flex sm:flex-row-reverse sm:justify-start">
            <Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "done" }} className={outcomeButton.primary}>{total ? "I'm done sharing" : "Finish"}<ArrowRight aria-hidden="true" /></Link>
            <Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "link" }} className={outcomeButton.secondary}><Link2 aria-hidden="true" />Back to your link</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Step 6: the product is in their promoted list; what they can do next. */
function DoneStep({ product: p }: { product: Product }) {
  const { state } = useAffiliate();
  const look = lookFor(prefsStore.use().look);
  const { url, tracking } = linkFor(state.promotions, p.id);
  const promo = promotionOf(state.promotions, p.id);
  const shared = shareCount(promo);
  return (
    <div className="screen-in">
      <PromoteSteps current={3} />
      <OutcomeScreen
        tone="success"
        emblem={
          <span className="relative mx-auto block h-36 w-28 sm:h-40" aria-hidden="true">
            <span className="charm-pedestal" />
            <CharmFigure look={look} pose="celebrate" then="proud" thenAfter={1800} className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2" />
          </span>
        }
        eyebrow="Added to your promoted products"
        title="You're promoting it!"
        message={`Share your link anywhere. You earn ${rateFor(p)}% commission on qualifying purchases of ${p.title} made through it.`}
        detailsTitle="Your promotion"
        details={[
          { label: "Product", value: p.title, strong: true },
          { label: "Your link", value: url.replace("https://", ""), mono: true, copy: url },
          { label: "Tracking ID", value: tracking, mono: true },
          { label: "Commission rate", value: `${rateFor(p)}%` },
          { label: "Per sale, est.", value: `≈ ${naira(estCommission(p))}` },
          { label: "Status", value: state.termsAccepted ? "Active" : "Waiting for you to accept the terms" },
          { label: "Shared", value: shared ? `${shared} time${shared === 1 ? "" : "s"}` : "Not yet" },
        ]}
        actions={
          <>
            <Link to="/affiliate/my-affiliations" className={cn(outcomeButton.primary, "whitespace-nowrap")}><Link2 aria-hidden="true" />View promoted products</Link>
            <Link to="/affiliate/market" className={cn(outcomeButton.secondary, "whitespace-nowrap")}><Compass aria-hidden="true" />Discover more products</Link>
          </>
        }
        moreActions={
          <Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "share" }} className={outcomeButton.quiet}><RefreshCw aria-hidden="true" />Share it somewhere else</Link>
        }
        footer="Commission appears in your wallet only after a qualifying purchase through your link clears."
      />
    </div>
  );
}
