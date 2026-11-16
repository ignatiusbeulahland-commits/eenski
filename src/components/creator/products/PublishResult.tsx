import { Link } from "@tanstack/react-router";
import { ArrowRight, EyeOff, LayoutGrid, PenLine, Plus, Store } from "lucide-react";
import { useState } from "react";
import { OutcomeScreen, ProcessingScreen, outcomeButton, useProcessing } from "@/components/shared/outcome";
import { kindInfo } from "@/lib/creator/data";
import { useCreator } from "@/lib/creator/store";
import { formatMoney } from "@/lib/shared/finance/currencies";
import { CreatorNotFound, itemPaths } from "../shared";
import { setupTab } from "./registry";

const PUBLISH_STEPS = (noun: string) => ["Checking your details", `Preparing your ${noun} listing`, "Adding it to your storefront"];
const DRAFT_STEPS = ["Saving your answers", "Keeping your draft safe"];
const UNPUBLISH_STEPS = ["Taking it off your storefront", "Keeping buyers' access safe"];

/** What a creator sees right after creating a product: a short "working" moment, then Published or Draft saved. */
export function PublishResult({ id, fresh, unpublished = false }: { id: string; fresh: boolean; unpublished?: boolean }) {
  const { state } = useCreator();
  const item = state.items.find((i) => i.id === id);
  const [working, setWorking] = useState(fresh);
  const info = item ? kindInfo[item.kind] : null;
  const live = item?.status === "published";
  const steps = live ? PUBLISH_STEPS(info?.noun ?? "product") : unpublished ? UNPUBLISH_STEPS : DRAFT_STEPS;
  const p = useProcessing(steps.length, () => setWorking(false), 750);
  if (!item || !info) return <CreatorNotFound what="product" />;
  if (working) return <div className="py-2"><ProcessingScreen title={live ? `Publishing your ${info.noun}` : unpublished ? `Unpublishing your ${info.noun}` : "Saving your draft"} message={item.title} steps={steps} active={p.active} /></div>;
  const paths = itemPaths[item.kind];
  const details = [
    { label: info.label, value: item.title },
    { label: "Price", value: item.price > 0 ? formatMoney(item.price, "NGN") : "Free" },
    { label: "Status", value: live ? "Live on your storefront" : "Draft (only you can see it)" },
    ...(item.category ? [{ label: "Category", value: item.category }] : []),
  ];
  const sold = state.orders.some((o) => o.itemId === item.id && o.status === "paid");
  if (unpublished && !live) {
    return (
      <div className="py-2">
        <OutcomeScreen
          tone="info"
          eyebrow="Unpublished"
          title={`${info.label} unpublished`}
          message={<>Your {info.noun} is off your storefront, so nobody new can buy it.{sold ? " Everyone who already bought it keeps their access." : ""} Publish it again any time.</>}
          details={[{ label: info.label, value: item.title }, { label: "Status", value: "Draft (only you can see it)" }]}
          actions={<>
            <Link to={paths.detail} params={{ slug: item.id }} search={{ tab: "overview" }} className={outcomeButton.primary}><EyeOff aria-hidden="true" />Back to {info.noun}</Link>
            <Link to={paths.list} className={outcomeButton.secondary}><LayoutGrid aria-hidden="true" />All {info.plural.toLowerCase()}</Link>
          </>}
        />
      </div>
    );
  }
  return (
    <div className="py-2">
      <OutcomeScreen
        tone={live ? "success" : "info"}
        eyebrow={live ? "Published" : "Draft saved"}
        title={live ? `${info.label} published` : "Draft saved"}
        message={live
          ? <>Your {info.noun} is live. Learners can find it on your storefront and buy it straight away.</>
          : <>Your {info.noun} is saved. Finish the remaining details whenever you're ready, then publish it.</>}
        details={details}
        actions={live ? <>
          <Link to={paths.detail} params={{ slug: item.id }} search={{ tab: "overview" }} className={outcomeButton.primary}>Manage {info.noun}<ArrowRight aria-hidden="true" /></Link>
          <Link to="/creator/storefront" className={outcomeButton.secondary}><Store aria-hidden="true" />View it on your storefront</Link>
        </> : <>
          <Link to={paths.detail} params={{ slug: item.id }} search={{ tab: setupTab[item.kind] }} className={outcomeButton.primary}><PenLine aria-hidden="true" />Continue setting it up</Link>
          <Link to={paths.list} className={outcomeButton.secondary}><LayoutGrid aria-hidden="true" />Back to {info.plural.toLowerCase()}</Link>
        </>}
        moreActions={live && <Link to={paths.create} className={outcomeButton.quiet}><Plus aria-hidden="true" />Create another {info.noun}</Link>}
      />
    </div>
  );
}
