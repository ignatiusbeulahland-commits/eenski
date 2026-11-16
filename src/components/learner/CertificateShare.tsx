import { Check, Copy, ExternalLink, Linkedin, Mail, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { encodeShareToken, linkedInAddUrl } from "@/lib/learner/certificateShare";
import type { CertificateDesign } from "@/lib/shared/certificate";

type Method = "copy" | "native" | "linkedin" | "email";
const track = (method: Method) => window.__lovableEvents?.track?.("project.certificate_shared", { method });

/** Share a public certificate link with employers or add it to LinkedIn. */
export function CertificateSharePanel({ resourceId, holder, title, issuer, issuedAt, code, design }: {
  resourceId: string; holder: string; title: string; issuer: string; issuedAt: string; code: string; design: CertificateDesign;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); setCanShare(typeof navigator.share === "function"); }, []);

  const path = `/certificate/${encodeShareToken({ resourceId, holder, issuedAt, design })}`;
  const url = origin ? `${origin}${path}` : path;
  const message = `I earned a certificate of completion for “${title}” from ${issuer} on Enski. View it here: ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Certificate link copied");
      track("copy");
    } catch {
      toast.error("Couldn't copy the link. Select it and copy it instead.");
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title: `${title} — Enski certificate`, text: message, url });
      track("native");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Sharing didn't work. Copy the link instead.");
    }
  };

  return (
    <Panel title="Share your certificate" description="Send it to employers or add it to your profile.">
      <label htmlFor="cert-share-link" className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Public link</label>
      <div className="mt-2 flex gap-2">
        <Input id="cert-share-link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 text-sm" />
        <Button onClick={copy} aria-label="Copy certificate link" className="shrink-0">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}<span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Anyone with this link can see your name, the course, the issue date and certificate ID {code}.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline" disabled={!origin}>
          <a href={linkedInAddUrl({ title, issuedAt, code, url })} target="_blank" rel="noopener noreferrer" onClick={() => track("linkedin")}>
            <Linkedin aria-hidden="true" /> Add to LinkedIn
          </a>
        </Button>
        <Button asChild variant="quiet">
          <a href={`mailto:?subject=${encodeURIComponent(`My Enski certificate: ${title}`)}&body=${encodeURIComponent(message)}`} onClick={() => track("email")}>
            <Mail aria-hidden="true" /> Email
          </a>
        </Button>
        {canShare && <Button variant="quiet" onClick={share}><Share2 aria-hidden="true" /> Share…</Button>}
        <Button asChild variant="quiet">
          <a href={path} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Open public page</a>
        </Button>
      </div>
    </Panel>
  );
}
