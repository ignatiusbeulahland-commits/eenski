import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { completionScreenResource, pendingCelebration, pendingCertificateNotice } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { BadgeArt } from "./BadgeArt";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { accountPerson } from "@/lib/dashboard/account";
import { useCredentials } from "@/lib/shared/credentials";

/** Shows each newly unlocked badge, then each newly earned certificate, once; acknowledgement is persisted. */
export function LearnerCelebration() {
  const { state, update } = useLearner();
  const creds = useCredentials();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const finishedId = completionScreenResource(pathname);
  // The completion screen is the certificate announcement, so its pop-up is marked as seen.
  const seenHere = finishedId ? state.certificates.find((c) => c.resourceId === finishedId && !state.celebrated.includes(`cert:${c.id}`)) : undefined;
  useEffect(() => {
    if (seenHere) update((s) => (s.celebrated.includes(`cert:${seenHere.id}`) ? {} : { celebrated: [...s.celebrated, `cert:${seenHere.id}`] }));
  }, [seenHere, update]);
  const emails = [state.profile.email, accountPerson().email].map((e) => e.trim().toLowerCase()).filter(Boolean);
  const badge = pendingCelebration(state);
  const award = badge ? undefined : creds.badgeAwards.find((a) => a.status === "active" && emails.includes(a.recipientEmail) && !state.celebrated.includes(`award:${a.id}`) && Date.now() - new Date(a.issuedAt).getTime() < 14 * 86_400_000);
  const cert = badge || award ? undefined : pendingCertificateNotice(state);
  const ack = () => {
    if (badge) update((s) => ({ celebrated: [...s.celebrated, badge.id] }));
    else if (award) update((s) => ({ celebrated: [...s.celebrated, `award:${award.id}`] }));
    else if (cert) update((s) => ({ celebrated: [...s.celebrated, `cert:${cert.id}`] }));
  };
  // Badges wait until the learner leaves the completion screen, so the two celebrations don't stack.
  if (finishedId) return null;
  return (
    <Dialog open={Boolean(badge || award || cert)} onOpenChange={(v) => !v && ack()}>
      {badge && (
        <DialogContent className="max-w-sm overflow-hidden p-0">
          <div className="bg-brand-panel relative grid place-items-center px-6 pb-6 pt-10">
            <div className="universe-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }} />)}</div>
            <BadgeArt badge={badge} unlocked size={128} className="universe-reveal" />
          </div>
          <div className="p-6 pt-4 text-center">
            <DialogHeader className="items-center text-center sm:text-center">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-text">Badge unlocked</p>
              <DialogTitle className="text-xl">{badge.title}</DialogTitle>
              <DialogDescription>{badge.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={ack} asChild><Link to="/learner/badges/$badgeKey" params={{ badgeKey: badge.id }}>View badge</Link></Button>
              <Button variant="ghost" onClick={ack}>Continue</Button>
            </div>
          </div>
        </DialogContent>
      )}
      {award && (
        <DialogContent className="max-w-sm overflow-hidden p-0">
          <div className="bg-brand-panel relative grid place-items-center px-6 pb-6 pt-10">
            <div className="universe-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 5) * 0.14}s` }} />)}</div>
            <BadgeEmblem badge={award.badge} size={132} className="universe-reveal" />
          </div>
          <div className="p-6 pt-4 text-center">
            <DialogHeader className="items-center text-center sm:text-center">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-text">You received a badge</p>
              <DialogTitle className="text-xl">{award.badge.name}</DialogTitle>
              <DialogDescription>{award.issuer} awarded you this badge{award.courseTitle ? ` for ${award.courseTitle}` : ""}.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={ack} asChild><Link to="/learner/badges/$badgeKey" params={{ badgeKey: award.id }}>Open badge</Link></Button>
              <Button variant="ghost" onClick={ack}>Later</Button>
            </div>
          </div>
        </DialogContent>
      )}
      {cert && (
        <DialogContent className="max-w-sm overflow-hidden p-0">
          <div className="bg-brand-panel relative grid place-items-center px-6 pb-7 pt-10">
            <span className="outcome-emblem relative grid size-28 place-items-center" aria-hidden="true">
              <span className="outcome-burst" />
              <span className="outcome-ring outcome-ring-success absolute inset-0 rounded-full" />
              <Award className="outcome-pop relative size-12" strokeWidth={2.4} />
            </span>
          </div>
          <div className="p-6 pt-4 text-center">
            <DialogHeader className="items-center text-center sm:text-center">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-text">Course complete</p>
              <DialogTitle className="text-xl">Your certificate is available</DialogTitle>
              <DialogDescription>You finished {cert.title}. {cert.issuer} has issued your certificate of completion.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={ack} asChild><Link to="/learner/certificates/$certificateId" params={{ certificateId: cert.id }}>Open certificate</Link></Button>
              <Button variant="ghost" onClick={ack}>Later</Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
