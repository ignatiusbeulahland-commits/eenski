import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/components/affiliate/MarketPage";
import { meta } from "@/lib/affiliate/meta";
export const Route = createFileRoute("/affiliate/market")({ head: () => meta("Market", "Discover Enski courses and ebooks to promote to your audience."), component: MarketPage });
