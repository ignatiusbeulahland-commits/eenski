import { heroSlides } from "./hero-images";
import { PeopleSlides } from "./PeopleSlides";

export function HeroSlides({ className }: { className?: string }) {
  return <PeopleSlides slides={heroSlides} label="Enski dreamers" hero className={className} />;
}
