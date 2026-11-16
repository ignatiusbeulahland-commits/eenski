import {
  Banknote,
  ChartPie,
  CirclePlay,
  Compass,
  FileDown,
  Globe,
  Handshake,
  MonitorPlay,
  ShoppingCart,
  Store,
  Target,
  TicketPercent,
  UsersRound,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import type { IconType } from "react-icons";
import { Container, SectionHeading } from "./primitives";
import { DuoIcon } from "./DuoIcon";

type Chip = { t: string; icon?: LucideIcon; brand?: IconType };

const rowA: Chip[] = [
  { icon: MonitorPlay, t: "Video courses" },
  { icon: FileDown, t: "Digital downloads" },
  { icon: Video, t: "Live sessions" },
  { icon: Store, t: "Branded storefront" },
  { icon: Wallet, t: "Split payments" },
  { icon: Globe, t: "20+ currencies" },
  { icon: Handshake, t: "Affiliate engine" },
  { icon: ShoppingCart, t: "Custom checkout" },
  { brand: SiTelegram, t: "Telegram groups" },
];
const rowB: Chip[] = [
  { icon: ChartPie, t: "Analytics" },
  { brand: SiWhatsapp, t: "WhatsApp communities" },
  { icon: UsersRound, t: "Learner management" },
  { icon: TicketPercent, t: "Upsells" },
  { icon: Banknote, t: "Automatic payouts" },
  { icon: CirclePlay, t: "Smooth playback" },
  { icon: Target, t: "Progress tracking" },
  { icon: Compass, t: "Dreamverse marketplace" },
];

export function AllInOne() {
  return (
    <section className="relative overflow-hidden bg-midnight py-20 md:py-28">
      <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-60" />
      <Container className="relative">
        <SectionHeading
          onBlue
          eyebrow="All in one"
          title="Everything you need,"
          highlight="in one place."
          subtitle="No more juggling different tools. Enski brings creating, selling and teaching together."
        />
      </Container>
      <div className="relative mt-14 space-y-4 mask-fade-x">
        <Marquee items={rowA} />
        <Marquee items={rowB} reverse />
      </div>
    </section>
  );
}

function Marquee({ items, reverse = false }: { items: Chip[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 gap-4 pr-4 animate-marquee hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {doubled.map((it, idx) => (
          <span
            key={idx}
            aria-hidden={idx >= items.length}
            className="glass-on-blue inline-flex items-center gap-3 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-6 fs-15 font-extrabold text-on-blue"
          >
            <DuoIcon icon={it.icon} brand={it.brand} tone="blue" size="sm" className="rounded-full" />
            {it.t}
          </span>
        ))}
      </div>
    </div>
  );
}
