import {
  Award, BookOpen, Bolt, Box, Brush, Code2, Compass, Crown, Flag, Footprints, GraduationCap, Handshake, Heart, Layers, LayoutTemplate, MessagesSquare,
  Mic, Milestone, Rocket, Star, Target, Ticket, TrendingUp, Trophy, UserRound, Users, UsersRound, type LucideIcon,
} from "lucide-react";
import { useId } from "react";
import { categoryInfo, type BadgeDefinition, type BadgeIcon, type BadgeShape } from "@/lib/shared/badges";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeIcon, LucideIcon> = {
  book: BookOpen, cap: GraduationCap, milestone: Milestone, flag: Flag, stack: Layers, spark: Footprints, target: Target, code: Code2, cube: Box,
  brush: Brush, growth: TrendingUp, trophy: Trophy, award: Award, project: LayoutTemplate, crown: Crown, chat: MessagesSquare, heart: Heart,
  handshake: Handshake, people: Users, ticket: Ticket, compass: Compass, user: UserRound, cohort: UsersRound, bolt: Bolt, mic: Mic, star: Star, rocket: Rocket,
};

/**
 * Finishes per silhouette. Plain hex (not CSS variables) because emblems are also
 * drawn inside certificates, which export as standalone images.
 */
const FINISH: Record<BadgeShape, { rim: [string, string, string, string]; face: [string, string]; glyph: string; ribbon: [string, string]; ring: string }> = {
  medallion: { rim: ["#FFFFFF", "#AFC0E0", "#EEF3FC", "#7F95C4"], face: ["#2E62D6", "#0F2A6E"], glyph: "#FFFFFF", ribbon: ["#C2F24A", "#8FB82A"], ring: "#C2F24A" },
  shield: { rim: ["#EAF0FC", "#6A90E3", "#F4F7FC", "#3E64B8"], face: ["#163A8F", "#0A1F55"], glyph: "#7CC2F7", ribbon: ["#3D8EF0", "#1A42A6"], ring: "#7CC2F7" },
  rosette: { rim: ["#FFF4C9", "#C9A340", "#FFE9A3", "#9A7522"], face: ["#173B95", "#0A1F55"], glyph: "#FFE08A", ribbon: ["#1A42A6", "#0A1F55"], ring: "#E7C766" },
  hexagon: { rim: ["#F1FCC4", "#A8D33A", "#E6FA9E", "#7FA51F"], face: ["#3D8EF0", "#1A42A6"], glyph: "#FFFFFF", ribbon: ["#C2F24A", "#8FB82A"], ring: "#E6FA9E" },
  seal: { rim: ["#FFFFFF", "#C9D5F2", "#F4F7FC", "#8FA3CC"], face: ["#0A1F55", "#1A42A6"], glyph: "#C2F24A", ribbon: ["#C2F24A", "#8FB82A"], ring: "#C2F24A" },
};

const pts = (n: number, r: number, cx: number, cy: number, rot = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
const star = (n: number, ro: number, ri: number, cx: number, cy: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = ((-90 + (180 / n) * i) * Math.PI) / 180;
    const r = i % 2 ? ri : ro;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
function scallop(n: number, r: number, bump: number, cx: number, cy: number) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) d += `M${x.toFixed(2)} ${y.toFixed(2)}`;
    else {
      const m = a - Math.PI / n;
      d += ` Q${(cx + (r + bump) * Math.cos(m)).toFixed(2)} ${(cy + (r + bump) * Math.sin(m)).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return `${d}Z`;
}

const SHIELD = "M60 8 L101 21 V56 C101 84 83 102 60 113 C37 102 19 84 19 56 V21 Z";
const SHIELD_IN = "M60 17 L93 27.5 V56 C93 79 78.5 94 60 103.5 C41.5 94 27 79 27 56 V27.5 Z";

/** The emblem as an <svg> with a 120 × 120 view box. Nest it inside another SVG with x/y/width/height. */
export function EmblemSvg({ badge, x, y, size = 120, uid }: { badge: Pick<BadgeDefinition, "category" | "icon" | "artwork">; x?: number; y?: number; size?: number; uid: string }) {
  const shape = categoryInfo[badge.category].shape;
  const f = FINISH[shape];
  const Icon = ICONS[badge.icon] ?? Award;
  const id = uid;
  const rim = `url(#rim${id})`;
  const face = `url(#face${id})`;
  const ribbons = shape !== "shield" && shape !== "hexagon";
  const faceR = shape === "rosette" ? 33 : shape === "seal" ? 34 : 35;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 120 120" overflow="visible">
      <defs>
        <linearGradient id={`rim${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={f.rim[0]} />
          <stop offset="0.38" stopColor={f.rim[1]} />
          <stop offset="0.62" stopColor={f.rim[2]} />
          <stop offset="1" stopColor={f.rim[3]} />
        </linearGradient>
        <radialGradient id={`face${id}`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor={f.face[0]} />
          <stop offset="1" stopColor={f.face[1]} />
        </radialGradient>
        <linearGradient id={`rib${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.ribbon[0]} />
          <stop offset="1" stopColor={f.ribbon[1]} />
        </linearGradient>
        <linearGradient id={`gloss${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`clip${id}`}><circle cx="60" cy="56" r={faceR - 2} /></clipPath>
      </defs>
      {/* soft cast shadow */}
      <ellipse cx="60" cy="113" rx="30" ry="4" fill="#0A1F55" opacity="0.14" />
      {ribbons && (
        <g>
          <path d="M43 80 L32 114 L42 108 L48 117 L56 86 Z" fill={`url(#rib${id})`} />
          <path d="M77 80 L88 114 L78 108 L72 117 L64 86 Z" fill={`url(#rib${id})`} />
          <path d="M43 80 L32 114 L42 108 L45 96 Z" fill="#0A1F55" opacity="0.18" />
        </g>
      )}
      {shape === "medallion" && (
        <g>
          <circle cx="60" cy="56" r="46" fill={rim} />
          <circle cx="60" cy="56" r="42.5" fill="none" stroke="#0A1F55" strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="1.2 2.6" />
          <circle cx="60" cy="56" r={faceR + 2.5} fill="#0A1F55" opacity="0.25" />
          <circle cx="60" cy="56" r={faceR} fill={face} />
          <path d="M33 70 C30 58 33 45 41 36 M87 70 C90 58 87 45 79 36" fill="none" stroke={f.ring} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 5.2" />
        </g>
      )}
      {shape === "shield" && (
        <g>
          <path d={SHIELD} fill={rim} />
          <path d={SHIELD_IN} fill={face} />
          <path d="M27 27.5 L60 17 L93 27.5 V36 L60 25.5 L27 36 Z" fill={f.ring} opacity="0.5" />
          <path d="M60 103.5 C41.5 94 27 79 27 56" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1.5" />
        </g>
      )}
      {shape === "rosette" && (
        <g>
          <polygon points={star(16, 50, 43, 60, 56)} fill={rim} />
          <circle cx="60" cy="56" r="40" fill="none" stroke="#9A7522" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="60" cy="56" r={faceR + 2.5} fill="#5C4512" opacity="0.3" />
          <circle cx="60" cy="56" r={faceR} fill={face} />
          <circle cx="60" cy="56" r={faceR - 4} fill="none" stroke={f.ring} strokeWidth="1" strokeDasharray="2 2.4" />
        </g>
      )}
      {shape === "hexagon" && (
        <g>
          <polygon points={pts(6, 51, 60, 58, -90)} fill={rim} strokeLinejoin="round" stroke={f.rim[1]} strokeWidth="4" />
          <polygon points={pts(6, 41, 60, 58, -90)} fill={face} strokeLinejoin="round" stroke="#0A1F55" strokeOpacity="0.25" strokeWidth="2" />
          <polygon points={pts(6, 36, 60, 58, -90)} fill="none" stroke={f.ring} strokeOpacity="0.55" strokeWidth="1" />
        </g>
      )}
      {shape === "seal" && (
        <g>
          <path d={scallop(24, 44, 6, 60, 56)} fill={rim} />
          <circle cx="60" cy="56" r="41" fill="none" stroke={f.ring} strokeWidth="2" />
          <circle cx="60" cy="56" r={faceR} fill={face} />
          <circle cx="60" cy="56" r={faceR - 3.5} fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="0.8" />
          <path d="M22 90 L98 90 L94 99 L98 108 L22 108 L26 99 Z" fill={`url(#rib${id})`} />
          <text x="60" y="102.6" textAnchor="middle" fontSize="8.2" fontWeight="800" letterSpacing="2.2" fill="#0A1F55" fontFamily="'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif">SPECIAL</text>
        </g>
      )}
      {badge.artwork ? (
        <image href={badge.artwork} x={60 - (faceR - 2)} y={56 - (faceR - 2)} width={(faceR - 2) * 2} height={(faceR - 2) * 2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip${id})`} />
      ) : (
        <Icon x={60 - 16} y={(shape === "hexagon" ? 58 : 56) - 16} width={32} height={32} color={f.glyph} strokeWidth={2} />
      )}
      {/* gloss */}
      {shape === "shield" ? <path d={SHIELD_IN} fill={`url(#gloss${id})`} /> : shape === "hexagon" ? <polygon points={pts(6, 41, 60, 58, -90)} fill={`url(#gloss${id})`} /> : <circle cx="60" cy="56" r={faceR} fill={`url(#gloss${id})`} />}
    </svg>
  );
}

/** A badge emblem for pages. Locked badges stay faintly tinted so each category's shape and finish still reads. */
export function BadgeEmblem({ badge, size = 88, locked, className, label }: { badge: Pick<BadgeDefinition, "category" | "icon" | "artwork" | "name">; size?: number; locked?: boolean; className?: string; label?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("shrink-0 overflow-visible", locked && "opacity-60 grayscale-[0.7]", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <EmblemSvg badge={badge} uid={uid} />
    </svg>
  );
}
