import { CheckCircle2, FileText, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { useAffiliate } from "@/lib/affiliate/store";

const terms = [
  ["Promoting products", "Promote Enski products honestly. Don't make claims about outcomes, income or results that the product itself does not make."],
  ["Referral links", "Your referral links are unique to you. Don't use them to buy products for yourself, and don't place them on sites that hide or misrepresent the link."],
  ["Commissions", "Commission is earned only on completed, eligible purchases made through your link. Refunded or reversed purchases are not eligible."],
  ["Payouts", "Payouts require a verified account and valid bank details. Payouts are made from your available balance only."],
  ["Conduct", "Spam, misleading ads and impersonating Enski or its creators may lead to suspension of your affiliate account."],
];

export function TermsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, update } = useAffiliate();
  const [agree, setAgree] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b p-5 text-left">
          <DialogTitle>Affiliate Terms and Conditions</DialogTitle>
          <DialogDescription>A summary of the terms you agree to as an Enski affiliate.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          {terms.map(([h, p], i) => (
            <div key={h} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ice text-xs font-bold text-cobalt">{i + 1}</span>
              <div><p className="font-bold">{h}</p><p className="mt-0.5 text-muted-foreground">{p}</p></div>
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col gap-3 border-t p-5 sm:flex-col">
          {state.termsAccepted ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> You accepted these terms.</p>
          ) : (
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span>I have read and agree to the Enski Affiliate Terms and Conditions.</span>
            </label>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {!state.termsAccepted && (
              <Button disabled={!agree} onClick={() => { update({ termsAccepted: true }); onOpenChange(false); toast.success("Affiliate terms accepted", { description: "Your affiliate account is now fully active." }); }}>Accept terms</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TermsNotice() {
  const { state, update } = useAffiliate();
  const [open, setOpen] = useState(false);
  if (state.termsAccepted && state.termsBannerHidden) return null;
  if (state.termsAccepted)
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3 text-sm">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <p className="min-w-0 flex-1"><b>Terms accepted.</b> <span className="text-muted-foreground">Your affiliate account is fully active.</span></p>
        <button onClick={() => update({ termsBannerHidden: true })} className="rounded-md p-1 text-muted-foreground hover:bg-card" aria-label="Dismiss"><X className="h-4 w-4" /></button>
      </div>
    );
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-xl border border-warning/30 bg-warning-soft">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-card text-warning shadow-soft"><ShieldAlert className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-warning-foreground">Accept the Affiliate Terms to activate your account</p>
            <p className="mt-0.5 text-sm text-warning-foreground">You must accept the Affiliate Terms and Conditions before your affiliate account is fully active and can earn commission.</p>
          </div>
          <div className="grid shrink-0 gap-2 min-[400px]:grid-cols-2 sm:flex">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(true)}><FileText /> Review terms</Button>
            <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>Accept terms</Button>
          </div>
        </div>
      </div>
      <TermsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
