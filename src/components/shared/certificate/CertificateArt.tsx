import { useHydrated } from "@tanstack/react-router";
import { useId, type ReactNode, type Ref } from "react";
import { EmblemSvg } from "@/components/shared/badges/BadgeEmblem";
import { findPlatformBadge, type BadgeDefinition } from "@/lib/shared/badges";
import { qrPath } from "@/lib/shared/qr";
import logoColor from "@/assets/dashboard/brand/enski-logo.webp";
import logoWhite from "@/assets/dashboard/brand/enski-logo-white.webp";
import mark from "@/assets/dashboard/brand/enski-mark.webp";
import {
  accentFor, CERT_COLORS as C, certDate, certSize, completionLine, fitFontSize, fitName, fontInfo, initials, issuerDisplay, signerRoleDisplay, wrapLines,
  type CertificateDesign,
} from "@/lib/shared/certificate";

export type CertificateContent = {
  learnerName: string;
  courseTitle: string;
  /** Heading such as "Certificate of completion". */
  title: string;
  issuedAt: string;
  code: string;
  creatorName: string;
  signer: string;
  /** Public verification link for the QR code. Defaults to this site's /verify page for `code`. */
  verifyUrl?: string;
  /** A custom badge to show in the emblem spot (platform badges are looked up by `design.badgeId`). */
  badge?: Pick<BadgeDefinition, "name" | "category" | "icon" | "artwork">;
};

/** Published address used for QR codes before the page knows its own origin (keeps server and browser output identical). */
const SITE_ORIGIN = "https://ensk.lovable.app";

const W = 1414;
const H = 1000;

const SIG = "'Mrs Saint Delafield', 'Brush Script MT', cursive";
const LOGO_RATIO = 480 / 176;
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const clip = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

type Ctx = { id: string; d: CertificateDesign; c: CertificateContent; issuer: string; role: string; name: string; titleLines: string[]; titleSize: number; body: string[]; qr: string };

/** Coursera-style Enski certificate drawn as SVG so the preview and the download are identical. */
export function CertificateArt({ content, design, className, svgRef, decorative }: { content: CertificateContent; design: CertificateDesign; className?: string; svgRef?: Ref<SVGSVGElement>; decorative?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hydrated = useHydrated();
  const origin = hydrated && typeof window !== "undefined" ? window.location.origin : SITE_ORIGIN;
  const qr = content.verifyUrl ?? `${origin}/verify?id=${encodeURIComponent(content.code)}`;
  const { w: VW, h: VH } = certSize(design);
  const issuer = issuerDisplay(design, content.creatorName);
  const name = content.learnerName.trim() || "Your name";
  const portrait = design.template === "portrait";
  const titleLines = wrapLines(content.courseTitle || "Course title", design.template === "classic" ? 40 : portrait ? 34 : 46, 2);
  const ctx: Ctx = {
    id, d: design, c: content, issuer, name, titleLines, qr,
    titleSize: portrait ? (titleLines.length > 1 ? 34 : 38) : titleLines.length > 1 ? 36 : 42,
    role: clip(sameName(issuer, content.signer || content.creatorName) ? signerRoleDisplay(design) : `${signerRoleDisplay(design)} · ${issuer}`, 46),
    body: wrapLines(completionLine(design.issuerType, issuer), design.template === "classic" ? 64 : portrait ? 58 : 76, 2),
  };
  const label = `${content.title} awarded to ${name} for ${content.courseTitle}, issued by ${issuer} on Enski, ${certDate(content.issuedAt)}`;
  const Template = { classic: Classic, midnight: Midnight, horizon: Horizon, minimal: Minimal, portrait: Portrait }[design.template];
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VW} ${VH}`}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      fontFamily={fontInfo[design.font].family}
    >
      {!decorative && <title>{label}</title>}
      <Template {...ctx} />
      <Overlays d={design} w={VW} h={VH} id={id} />
    </svg>
  );
}

function Seal({ cx, cy, r, d, dark, id }: { cx: number; cy: number; r: number; d: CertificateDesign; dark?: boolean | undefined; id: string }) {
  const a = accentFor(d, dark);
  const tr = r * 0.775;
  const circ = 2 * Math.PI * tr;
  return (
    <g>
      <path d={`M${cx - r * 0.52} ${cy + r * 0.45} L${cx - r * 0.12} ${cy + r * 0.62} L${cx - r * 0.26} ${cy + r * 1.62} L${cx - r * 0.42} ${cy + r * 1.38} L${cx - r * 0.66} ${cy + r * 1.5} Z`} fill={a} />
      <path d={`M${cx + r * 0.52} ${cy + r * 0.45} L${cx + r * 0.12} ${cy + r * 0.62} L${cx + r * 0.26} ${cy + r * 1.62} L${cx + r * 0.42} ${cy + r * 1.38} L${cx + r * 0.66} ${cy + r * 1.5} Z`} fill={a} />
      <path d={`M${cx - r * 0.52} ${cy + r * 0.45} L${cx - r * 0.12} ${cy + r * 0.62} L${cx - r * 0.2} ${cy + r * 1.1} Z`} fill={C.midnight} opacity={0.18} />
      <circle cx={cx} cy={cy} r={r} fill={dark ? C.midnight : C.white} stroke={a} strokeWidth={r * 0.055} />
      <circle cx={cx} cy={cy} r={r * 0.88} fill="none" stroke={dark ? C.cobalt300 : C.cobalt100} strokeWidth={1.5} strokeDasharray="3 5" />
      <path id={`ring${id}`} d={`M ${cx} ${cy - tr} a ${tr} ${tr} 0 1 1 -0.01 0`} fill="none" />
      <text fontSize={r * 0.105} fontWeight={800} fill={dark ? C.white : C.midnight} letterSpacing={r * 0.02}>
        <textPath href={`#ring${id}`} textLength={circ * 0.985} lengthAdjust="spacing">CERTIFICATE OF COMPLETION • ENSKI • COURSE CERTIFICATE • ENSKI •</textPath>
      </text>
      <circle cx={cx} cy={cy} r={r * 0.66} fill={C.ice} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke={a} strokeWidth={r * 0.03} />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="none" stroke={C.cobalt100} strokeWidth={1} />
      <image href={mark} x={cx - r * 0.42} y={cy - r * 0.42} width={r * 0.84} height={r * 0.84} preserveAspectRatio="xMidYMid meet" />
    </g>
  );
}

function IssuerMark({ x: x0, y: y0, size: s0, d, issuer, dark }: { x: number; y: number; size: number; d: CertificateDesign; issuer: string; dark?: boolean }) {
  const size = s0 * d.logoScale;
  const x = x0 + (s0 - size) / 2;
  const y = y0 + (s0 - size) / 2;
  if (d.issuerLogo)
    return (
      <g>
        <rect x={x} y={y} width={size} height={size} rx={size * 0.22} fill={C.white} stroke={dark ? "none" : C.line} />
        <image href={d.issuerLogo} x={x + size * 0.1} y={y + size * 0.1} width={size * 0.8} height={size * 0.8} preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  return (
    <g>
      <circle cx={x + size / 2} cy={y + size / 2} r={size / 2} fill={dark ? C.white : C.midnight} />
      <text x={x + size / 2} y={y + size / 2 + size * 0.15} textAnchor="middle" fontSize={size * 0.4} fontWeight={800} fill={dark ? C.midnight : C.white}>{initials(issuer)}</text>
    </g>
  );
}

function Signature({ x, y, anchor = "start", c, d, role, dark, width = 330, second }: { x: number; y: number; anchor?: "start" | "middle"; c: CertificateContent; d: CertificateDesign; role: string; dark?: boolean; width?: number; second?: boolean }) {
  const signer = second ? d.cosignName.trim() : c.signer.trim() || c.creatorName.trim() || "Signature";
  const image = second ? d.cosignImage : d.signatureImage;
  const scale = second ? d.cosignScale : d.signatureScale;
  const offset = second ? d.cosignOffset : d.signatureOffset;
  const title = second ? [d.cosignTitle.trim(), d.cosignOrg.trim()].filter(Boolean).join(" · ") : role;
  const x1 = anchor === "middle" ? x - width / 2 : x;
  // Uploaded signatures keep their own proportions (meet), sit on the line and can be nudged and resized.
  const ih = 92 * scale;
  const iw = Math.min(width * 1.1, width * 0.9 * scale);
  const free = width - iw;
  const ix = x1 + free / 2 + (offset * Math.max(free, 0)) / 2;
  return (
    <g>
      {image ? (
        <image href={image} x={ix} y={y + 18 - ih} width={iw} height={ih} preserveAspectRatio="xMidYMax meet" />
      ) : (
        (second || d.showSignature) && <text x={x} y={y} textAnchor={anchor} fontFamily={SIG} fontSize={fitFontSize(signer, 58, width * 1.15, 34)} fill={dark ? C.white : C.midnight}>{signer}</text>
      )}
      <line x1={x1} x2={x1 + width} y1={y + 22} y2={y + 22} stroke={dark ? C.onDarkMuted : C.midnight} strokeWidth={1.5} opacity={dark ? 0.6 : 0.85} />
      <text x={x} y={y + 54} textAnchor={anchor} fontSize={20} fontWeight={800} fill={dark ? C.white : C.midnight}>{clip(signer, Math.round(width / 10))}</text>
      <text x={x} y={y + 80} textAnchor={anchor} fontSize={16} fontWeight={500} fill={dark ? C.onDarkMuted : C.muted}>{clip(title, Math.round(width / 7.4))}</text>
    </g>
  );
}

/** Recipient name that always fits: one line, or two smaller lines for very long names. */
function NameText({ name, x, y, base, maxWidth, anchor = "start", fill }: { name: string; x: number; y: number; base: number; maxWidth: number; anchor?: "start" | "middle"; fill: string }) {
  const { lines, size } = fitName(name, base, maxWidth);
  if (lines.length === 1) return <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={800} fill={fill}>{lines[0]}</text>;
  const lh = size * 1.1;
  return (
    <text x={x} y={y - lh * 0.55} textAnchor={anchor} fontSize={size} fontWeight={800} fill={fill}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i ? lh : 0}>{l}</tspan>)}
    </text>
  );
}

/** The seal spot: Enski seal, the issuer's uploaded seal, or an achievement badge. */
function Emblem({ cx, cy, r, d, c, dark, id }: { cx: number; cy: number; r: number; d: CertificateDesign; c: CertificateContent; dark?: boolean; id: string }) {
  if (!d.showSeal) return null;
  if (d.emblem === "custom" && d.sealImage) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r * 1.02} fill={dark ? C.white : C.white} opacity={dark ? 0.96 : 1} />
        <image href={d.sealImage} x={cx - r} y={cy - r} width={r * 2} height={r * 2} preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  }
  const badge = d.emblem === "badge" ? c.badge ?? findPlatformBadge(d.badgeId) : undefined;
  if (badge) {
    const size = r * 2.3;
    return (
      <g>
        <EmblemSvg badge={badge} x={cx - size / 2} y={cy - size * 0.47} size={size} uid={`b${id}`} />
        <text x={cx} y={cy + size * 0.6} textAnchor="middle" fontSize={Math.max(12, r * 0.17)} fontWeight={800} letterSpacing={1.5} fill={dark ? C.white : C.midnight}>{clip(badge.name.toUpperCase(), 26)}</text>
      </g>
    );
  }
  return <Seal cx={cx} cy={cy} r={r} d={d} dark={dark} id={id} />;
}

/** Personal/creator logo and secondary organisation logo, side by side in a header strip. */
function ExtraLogos({ x, y, h, anchor = "start", d, dark }: { x: number; y: number; h: number; anchor?: "start" | "middle" | "end"; d: CertificateDesign; dark?: boolean }) {
  const logos = [d.creatorLogo, d.secondaryLogo].filter(Boolean);
  if (!logos.length) return null;
  const w = h * 2.2;
  const gap = 18;
  const total = logos.length * w + (logos.length - 1) * gap;
  const x0 = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
  return (
    <g>
      {logos.map((src, i) => (
        <g key={i}>
          {dark && <rect x={x0 + i * (w + gap) - 6} y={y - 6} width={w + 12} height={h + 12} rx={10} fill={C.white} opacity={0.96} />}
          <image href={src} x={x0 + i * (w + gap)} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
        </g>
      ))}
    </g>
  );
}

/** Verification QR code on a white tile with a caption. */
function Qr({ x, y, size, url, dark, show }: { x: number; y: number; size: number; url: string; dark?: boolean; show: boolean }) {
  if (!show) return null;
  const { path, size: n } = qrPath(url);
  const pad = size * 0.08;
  return (
    <g>
      <rect x={x - pad} y={y - pad} width={size + pad * 2} height={size + pad * 2} rx={8} fill={C.white} stroke={dark ? "none" : C.line} />
      <svg x={x} y={y} width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges"><path d={path} fill={C.midnight} /></svg>
      <text x={x + size / 2} y={y + size + pad + 20} textAnchor="middle" fontSize={12} fontWeight={700} letterSpacing={1.5} fill={dark ? C.onDarkMuted : C.muted}>SCAN TO VERIFY</text>
    </g>
  );
}

/** Creator-chosen borders and backgrounds drawn over any template. */
function Overlays({ d, w, h, id }: { d: CertificateDesign; w: number; h: number; id: string }) {
  const a = accentFor(d);
  const parts: ReactNode[] = [];
  if (d.background === "artwork" && d.artwork) {
    parts.push(<image key="art" href={d.artwork} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid slice" opacity={d.artworkOpacity} style={{ mixBlendMode: "multiply" }} />);
  }
  if (d.background === "guilloche") {
    const rows = Array.from({ length: 16 }, (_, i) => {
      const y0 = (h / 16) * i + h / 32;
      let p = `M0 ${y0}`;
      for (let x = 0; x <= w; x += 20) p += ` L${x} ${(y0 + Math.sin((x / w) * Math.PI * 10 + i) * 14).toFixed(1)}`;
      return <path key={i} d={p} fill="none" stroke={C.cobalt300} strokeOpacity={0.14} strokeWidth={1} />;
    });
    parts.push(<g key="g" pointerEvents="none">{rows}</g>);
  }
  if (d.border === "fine") parts.push(<rect key="b" x={22} y={22} width={w - 44} height={h - 44} fill="none" stroke={a} strokeWidth={2} />);
  if (d.border === "double") {
    parts.push(<rect key="b1" x={18} y={18} width={w - 36} height={h - 36} fill="none" stroke={C.midnight} strokeWidth={4} />);
    parts.push(<rect key="b2" x={30} y={30} width={w - 60} height={h - 60} fill="none" stroke={a} strokeWidth={1.5} />);
  }
  if (d.border === "ornate") {
    parts.push(<rect key="b" x={20} y={20} width={w - 40} height={h - 40} fill="none" stroke={a} strokeWidth={2.5} />);
    for (const [x, y, sx, sy] of [[20, 20, 1, 1], [w - 20, 20, -1, 1], [20, h - 20, 1, -1], [w - 20, h - 20, -1, -1]] as const) {
      parts.push(
        <g key={`o${x}${y}`} fill="none" stroke={C.midnight} strokeWidth={2}>
          <path d={`M${x + sx * 10} ${y + sy * 70} L${x + sx * 10} ${y + sy * 10} L${x + sx * 70} ${y + sy * 10}`} />
          <path d={`M${x + sx * 18} ${y + sy * 44} Q${x + sx * 18} ${y + sy * 18} ${x + sx * 44} ${y + sy * 18}`} />
          <circle cx={x + sx * 10} cy={y + sy * 10} r={5} fill={a} stroke="none" />
        </g>,
      );
    }
  }
  return parts.length ? <g data-overlay={id}>{parts}</g> : null;
}

function Lines({ lines, x, y, size, lh, anchor = "start", fill, weight }: { lines: string[]; x: number; y: number; size: number; lh: number; anchor?: "start" | "middle"; fill: string; weight: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i ? lh : 0}>{l}</tspan>)}
    </text>
  );
}

function Classic({ id, d, c, issuer, name, titleLines, titleSize, body, role, qr }: Ctx) {
  const a = accentFor(d);
  const bx = 1034;
  const titleEnd = 470 + (titleLines.length - 1) * titleSize * 1.2;
  return (
    <>
      <defs>
        <linearGradient id={`band${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.cobaltPress} />
          <stop offset="0.55" stopColor={C.cobalt} />
          <stop offset="1" stopColor={C.cobaltGlow} />
        </linearGradient>
        <radialGradient id={`glow${id}`} cx="0.72" cy="0.42" r="0.6">
          <stop offset="0" stopColor={C.skyLight} stopOpacity="0.55" />
          <stop offset="1" stopColor={C.sky} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.white} />
      <g fill="none" stroke={C.cobalt50} strokeWidth={1.5}>
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={0} cy={H} r={220 + i * 44} />)}
      </g>
      <rect width={bx} height={10} fill={C.midnight} />
      <rect width={190} height={10} fill={a} />
      <rect x={bx} width={W - bx} height={H} fill={`url(#band${id})`} />
      <rect x={bx} width={W - bx} height={H} fill={`url(#glow${id})`} />
      <g fill="none" stroke={C.white} strokeOpacity={0.07}>
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={1224} cy={330} r={150 + i * 46} />)}
      </g>
      {[[1080, 90], [1370, 160], [1100, 760], [1352, 820]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={3} fill={C.lime} opacity={0.75} />)}
      <Emblem cx={1224} cy={318} r={118} d={d} c={c} id={id} />
      <text x={1224} y={d.showSeal ? 600 : 420} textAnchor="middle" fontSize={30} fontWeight={800} letterSpacing={8} fill={C.white}>COURSE</text>
      <text x={1224} y={d.showSeal ? 644 : 464} textAnchor="middle" fontSize={30} fontWeight={800} letterSpacing={8} fill={C.white}>CERTIFICATE</text>
      <rect x={1194} y={d.showSeal ? 668 : 488} width={60} height={4} rx={2} fill={C.lime} />
      {d.showId && (
        <>
          <text x={1224} y={902} textAnchor="middle" fontSize={14} fontWeight={700} letterSpacing={3} fill={C.onDarkMuted}>CERTIFICATE ID</text>
          <text x={1224} y={932} textAnchor="middle" fontSize={21} fontWeight={800} letterSpacing={1.5} fill={C.white}>{c.code}</text>
        </>
      )}

      <image href={logoColor} x={96} y={84} width={54 * LOGO_RATIO} height={54} />
      <line x1={262} x2={262} y1={86} y2={136} stroke={C.line} strokeWidth={2} />
      <IssuerMark x={286} y={86} size={50} d={d} issuer={issuer} />
      <text x={350} y={118} fontSize={21} fontWeight={800} fill={C.midnight}>{clip(issuer, 34)}</text>
      <text x={96} y={210} fontSize={17} fontWeight={800} letterSpacing={4} fill={C.cobalt}>{clip(c.title.toUpperCase(), 44)}</text>
      <text x={96} y={248} fontSize={21} fontWeight={600} fill={C.muted}>{certDate(c.issuedAt)}</text>
      <NameText name={name} x={96} y={348} base={66} maxWidth={880} fill={C.midnight} />
      <text x={96} y={404} fontSize={23} fontWeight={500} fill={C.muted}>has successfully completed</text>
      <Lines lines={titleLines} x={96} y={470} size={titleSize} lh={titleSize * 1.2} fill={C.cobalt} weight={800} />
      <Lines lines={body} x={96} y={titleEnd + 52} size={19} lh={29} fill={C.muted} weight={500} />
      <Signature x={96} y={800} c={c} d={d} role={role} />
      {d.cosignName.trim() && <Signature x={500} y={800} c={c} d={d} role={role} width={300} second />}
      <ExtraLogos x={1000} y={88} h={46} anchor="end" d={d} />
      <Qr x={1164} y={712} size={120} url={qr} show={d.showQr} dark />
    </>
  );
}

function Midnight({ id, d, c, issuer, name, titleLines, titleSize, body, role, qr }: Ctx) {
  const two = !!d.cosignName.trim();
  const a = accentFor(d, true);
  const titleEnd = 568 + (titleLines.length - 1) * titleSize * 1.2;
  return (
    <>
      <defs>
        <radialGradient id={`mg${id}`} cx="0.78" cy="0.12" r="0.75">
          <stop offset="0" stopColor={C.cobaltGlow} stopOpacity="0.85" />
          <stop offset="0.6" stopColor={C.cobaltPress} stopOpacity="0.4" />
          <stop offset="1" stopColor={C.midnight} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ms${id}`} cx="0.7" cy="0.3" r="0.3">
          <stop offset="0" stopColor={C.skyLight} stopOpacity="0.22" />
          <stop offset="1" stopColor={C.skyLight} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.midnight} />
      <rect width={W} height={H} fill={`url(#mg${id})`} />
      <rect width={W} height={H} fill={`url(#ms${id})`} />
      <rect x={36} y={36} width={W - 72} height={H - 72} rx={8} fill="none" stroke={a} strokeWidth={2} />
      <rect x={52} y={52} width={W - 104} height={H - 104} rx={4} fill="none" stroke={C.cobalt300} strokeOpacity={0.35} />
      {[[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]].map(([x, y]) => <rect key={`${x}${y}`} x={x! - 7} y={y! - 7} width={14} height={14} fill={a} transform={`rotate(45 ${x} ${y})`} />)}
      {[[180, 170], [1250, 250], [240, 720], [1190, 690]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={2.5} fill={C.lime} opacity={0.7} />)}
      <image href={logoWhite} x={96} y={92} width={50 * LOGO_RATIO} height={50} />
      <IssuerMark x={1268} y={92} size={50} d={d} issuer={issuer} dark />
      <text x={1250} y={124} textAnchor="end" fontSize={20} fontWeight={800} fill={C.white}>{clip(issuer, 34)}</text>
      <text x={W / 2} y={258} textAnchor="middle" fontSize={21} fontWeight={800} letterSpacing={8} fill={a}>{clip(c.title.toUpperCase(), 40)}</text>
      <text x={W / 2} y={322} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.onDarkMuted}>This certifies that</text>
      <NameText name={name} x={W / 2} y={410} base={72} maxWidth={1100} anchor="middle" fill={C.white} />
      <rect x={W / 2 - 90} y={438} width={180} height={4} rx={2} fill={a} />
      <text x={W / 2} y={500} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.onDarkMuted}>has successfully completed</text>
      <Lines lines={titleLines} x={W / 2} y={568} size={titleSize} lh={titleSize * 1.2} anchor="middle" fill={C.white} weight={800} />
      <Lines lines={body} x={W / 2} y={titleEnd + 50} size={19} lh={29} anchor="middle" fill={C.onDarkMuted} weight={500} />
      <Signature x={two ? 110 : 140} y={806} c={c} d={d} role={role} width={two ? 240 : 330} dark />
      {two && <Signature x={380} y={806} c={c} d={d} role={role} width={220} dark second />}
      <ExtraLogos x={W / 2} y={94} h={46} anchor="middle" d={d} dark />
      <Qr x={1170} y={676} size={100} url={qr} show={d.showQr} dark />
      <Emblem cx={W / 2} cy={812} r={72} d={d} c={c} dark id={id} />
      <text x={1274} y={838} textAnchor="end" fontSize={14} fontWeight={700} letterSpacing={3} fill={C.onDarkMuted}>DATE EARNED</text>
      <text x={1274} y={870} textAnchor="end" fontSize={21} fontWeight={800} fill={C.white}>{certDate(c.issuedAt)}</text>
      {d.showId && <text x={1274} y={898} textAnchor="end" fontSize={15} fontWeight={600} letterSpacing={1} fill={C.onDarkMuted}>ID {c.code}</text>}
    </>
  );
}

function Horizon({ id, d, c, issuer, name, titleLines, titleSize, body, role, qr }: Ctx) {
  const two = !!d.cosignName.trim();
  const a = accentFor(d);
  const titleEnd = 552 + (titleLines.length - 1) * titleSize * 1.2;
  return (
    <>
      <defs>
        <linearGradient id={`hg${id}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor={C.cobaltPress} />
          <stop offset="0.6" stopColor={C.cobalt} />
          <stop offset="1" stopColor={C.cobaltGlow} />
        </linearGradient>
        <radialGradient id={`hs${id}`} cx="0.8" cy="0.5" r="0.45">
          <stop offset="0" stopColor={C.skyLight} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.sky} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.soft} />
      <rect width={W} height={300} fill={`url(#hg${id})`} />
      <rect width={W} height={300} fill={`url(#hs${id})`} />
      {[[520, 60], [880, 120], [1330, 70], [700, 40]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={3} fill={C.lime} opacity={0.75} />)}
      <image href={logoWhite} x={96} y={60} width={50 * LOGO_RATIO} height={50} />
      <IssuerMark x={1268} y={60} size={50} d={d} issuer={issuer} dark />
      <text x={1250} y={92} textAnchor="end" fontSize={20} fontWeight={800} fill={C.white}>{clip(issuer, 34)}</text>
      <rect x={70} y={168} width={W - 140} height={772} rx={28} fill={C.white} stroke={C.line} />
      <rect x={70} y={232} width={8} height={130} rx={4} fill={a} />
      <text x={130} y={262} fontSize={18} fontWeight={800} letterSpacing={5} fill={C.cobalt}>{clip(c.title.toUpperCase(), 40)}</text>
      <text x={130} y={300} fontSize={20} fontWeight={600} fill={C.muted}>Awarded to</text>
      <NameText name={name} x={130} y={392} base={68} maxWidth={d.showSeal ? 880 : 1100} fill={C.midnight} />
      <text x={130} y={446} fontSize={23} fontWeight={500} fill={C.muted}>for successfully completing</text>
      <Lines lines={titleLines} x={130} y={516} size={titleSize} lh={titleSize * 1.2} fill={C.cobalt} weight={800} />
      <Lines lines={body} x={130} y={titleEnd + 16} size={19} lh={29} fill={C.muted} weight={500} />
      <Emblem cx={1166} cy={340} r={104} d={d} c={c} id={id} />
      <line x1={130} x2={W - 130} y1={738} y2={738} stroke={C.line} strokeWidth={2} />
      <Signature x={130} y={806} c={c} d={d} role={role} width={two ? 260 : 300} />
      {two && <Signature x={420} y={806} c={c} d={d} role={role} width={230} second />}
      <ExtraLogos x={W / 2} y={62} h={46} anchor="middle" d={d} dark />
      <Qr x={1104} y={566} size={104} url={qr} show={d.showQr} />
      <text x={W / 2 + 60} y={840} textAnchor="middle" fontSize={14} fontWeight={700} letterSpacing={3} fill={C.muted}>DATE EARNED</text>
      <text x={W / 2 + 60} y={872} textAnchor="middle" fontSize={21} fontWeight={800} fill={C.midnight}>{certDate(c.issuedAt)}</text>
      {d.showId && (
        <>
          <text x={W - 130} y={840} textAnchor="end" fontSize={14} fontWeight={700} letterSpacing={3} fill={C.muted}>CERTIFICATE ID</text>
          <text x={W - 130} y={872} textAnchor="end" fontSize={21} fontWeight={800} fill={C.cobalt}>{c.code}</text>
        </>
      )}
    </>
  );
}

function Minimal({ id, d, c, issuer, name, titleLines, titleSize, body, role, qr }: Ctx) {
  const two = !!d.cosignName.trim();
  const a = accentFor(d);
  const titleEnd = 560 + (titleLines.length - 1) * titleSize * 1.2;
  const corner = (x: number, y: number, sx: number, sy: number) => <path key={`${x}${y}`} d={`M${x} ${y + sy * 40} L${x} ${y} L${x + sx * 40} ${y}`} fill="none" stroke={a} strokeWidth={5} />;
  return (
    <>
      <rect width={W} height={H} fill={C.white} />
      <rect x={40} y={40} width={W - 80} height={H - 80} fill="none" stroke={C.cobalt} strokeWidth={3} />
      <rect x={58} y={58} width={W - 116} height={H - 116} fill="none" stroke={C.cobalt100} strokeWidth={1.5} />
      {[corner(70, 70, 1, 1), corner(W - 70, 70, -1, 1), corner(70, H - 70, 1, -1), corner(W - 70, H - 70, -1, -1)]}
      <image href={logoColor} x={W / 2 - 24 - 46 * LOGO_RATIO} y={100} width={46 * LOGO_RATIO} height={46} />
      <line x1={W / 2} x2={W / 2} y1={100} y2={146} stroke={C.line} strokeWidth={2} />
      <IssuerMark x={W / 2 + 24} y={100} size={46} d={d} issuer={issuer} />
      <text x={W / 2} y={252} textAnchor="middle" fontSize={44} fontWeight={300} letterSpacing={12} fill={C.midnight}>{clip(c.title.toUpperCase(), 30)}</text>
      <rect x={W / 2 - 40} y={278} width={80} height={4} rx={2} fill={a} />
      <text x={W / 2} y={340} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.muted}>This certifies that</text>
      <NameText name={name} x={W / 2} y={426} base={70} maxWidth={1050} anchor="middle" fill={C.midnight} />
      <text x={W / 2} y={490} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.muted}>has successfully completed</text>
      <Lines lines={titleLines} x={W / 2} y={560} size={titleSize} lh={titleSize * 1.2} anchor="middle" fill={C.cobalt} weight={800} />
      <Lines lines={body} x={W / 2} y={titleEnd + 50} size={19} lh={29} anchor="middle" fill={C.muted} weight={500} />
      <Signature x={two ? 250 : 300} y={800} anchor="middle" c={c} d={d} role={role} width={two ? 230 : 300} />
      {two && <Signature x={500} y={800} anchor="middle" c={c} d={d} role={role} width={220} second />}
      <ExtraLogos x={800} y={100} h={46} d={d} />
      <Qr x={1236} y={92} size={86} url={qr} show={d.showQr} />
      <Emblem cx={W / 2} cy={808} r={66} d={d} c={c} id={id} />
      <text x={W - 300} y={830} textAnchor="middle" fontSize={21} fontWeight={800} fill={C.midnight}>{certDate(c.issuedAt)}</text>
      <line x1={W - 450} x2={W - 150} y1={846} y2={846} stroke={C.midnight} strokeWidth={1.5} opacity={0.85} />
      <text x={W - 300} y={878} textAnchor="middle" fontSize={16} fontWeight={500} fill={C.muted}>Date earned</text>
      {d.showId && <text x={W - 300} y={904} textAnchor="middle" fontSize={15} fontWeight={700} letterSpacing={1} fill={C.cobalt}>ID {c.code}</text>}
    </>
  );
}

const PW = 1000;
const PH = 1414;

/** A4 portrait: formal academic layout, everything centred. */
function Portrait({ id, d, c, issuer, name, titleLines, titleSize, body, role, qr }: Ctx) {
  const a = accentFor(d);
  const two = !!d.cosignName.trim();
  const extras = !!(d.creatorLogo || d.secondaryLogo);
  const top = extras ? 60 : 0;
  const titleEnd = 760 + top + (titleLines.length - 1) * titleSize * 1.2;
  return (
    <>
      <defs>
        <linearGradient id={`pt${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.cobaltPress} />
          <stop offset="1" stopColor={C.cobaltGlow} />
        </linearGradient>
      </defs>
      <rect width={PW} height={PH} fill={C.white} />
      <g fill="none" stroke={C.cobalt50} strokeWidth={1.5}>
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={PW / 2} cy={PH + 120} r={260 + i * 48} />)}
      </g>
      <rect width={PW} height={14} fill={`url(#pt${id})`} />
      <rect x={PW / 2 - 70} width={140} height={14} fill={a} />
      <rect x={40} y={56} width={PW - 80} height={PH - 96} fill="none" stroke={C.cobalt} strokeWidth={2.5} />
      <rect x={56} y={72} width={PW - 112} height={PH - 128} fill="none" stroke={C.cobalt100} strokeWidth={1.2} />
      <image href={logoColor} x={PW / 2 - 24 - 46 * LOGO_RATIO} y={128} width={46 * LOGO_RATIO} height={46} />
      <line x1={PW / 2} x2={PW / 2} y1={128} y2={174} stroke={C.line} strokeWidth={2} />
      <IssuerMark x={PW / 2 + 24} y={128} size={46} d={d} issuer={issuer} />
      <text x={PW / 2} y={236} textAnchor="middle" fontSize={20} fontWeight={800} fill={C.midnight}>{clip(issuer, 44)}</text>
      <ExtraLogos x={PW / 2} y={266} h={42} anchor="middle" d={d} />
      <text x={PW / 2} y={360 + top} textAnchor="middle" fontSize={38} fontWeight={300} letterSpacing={9} fill={C.midnight}>{clip(c.title.toUpperCase(), 28)}</text>
      <rect x={PW / 2 - 40} y={386 + top} width={80} height={4} rx={2} fill={a} />
      <text x={PW / 2} y={470 + top} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.muted}>This certifies that</text>
      <NameText name={name} x={PW / 2} y={570 + top} base={64} maxWidth={820} anchor="middle" fill={C.midnight} />
      <rect x={PW / 2 - 160} y={600 + top} width={320} height={1.5} fill={C.line} />
      <text x={PW / 2} y={670 + top} textAnchor="middle" fontSize={22} fontWeight={500} fill={C.muted}>has successfully completed</text>
      <Lines lines={titleLines} x={PW / 2} y={760 + top} size={titleSize} lh={titleSize * 1.2} anchor="middle" fill={C.cobalt} weight={800} />
      <Lines lines={body} x={PW / 2} y={titleEnd + 50} size={18} lh={28} anchor="middle" fill={C.muted} weight={500} />
      <Emblem cx={PW / 2} cy={1040} r={74} d={d} c={c} id={id} />
      <Qr x={790} y={988} size={104} url={qr} show={d.showQr} />
      <Signature x={two ? 280 : 290} y={1214} anchor="middle" c={c} d={d} role={role} width={300} />
      {two ? (
        <Signature x={720} y={1214} anchor="middle" c={c} d={d} role={role} width={300} second />
      ) : (
        <g>
          <text x={710} y={1222} textAnchor="middle" fontSize={21} fontWeight={800} fill={C.midnight}>{certDate(c.issuedAt)}</text>
          <line x1={560} x2={860} y1={1236} y2={1236} stroke={C.midnight} strokeWidth={1.5} opacity={0.85} />
          <text x={710} y={1268} textAnchor="middle" fontSize={16} fontWeight={500} fill={C.muted}>Date earned</text>
        </g>
      )}
      <text x={PW / 2} y={1334} textAnchor="middle" fontSize={15} fontWeight={700} letterSpacing={1} fill={C.cobalt}>
        {two ? `${certDate(c.issuedAt)}${d.showId ? `  ·  ID ${c.code}` : ""}` : d.showId ? `ID ${c.code}` : ""}
      </text>
    </>
  );
}
