import type { CharacterStyle } from "./rules";
import queen1 from "@/assets/dashboard/universe/queen-1.webp";
import queen2 from "@/assets/dashboard/universe/queen-2.webp";
import queen3 from "@/assets/dashboard/universe/queen-3.webp";
import queen4 from "@/assets/dashboard/universe/queen-4.webp";
import queen5 from "@/assets/dashboard/universe/queen-5.webp";
import queen6 from "@/assets/dashboard/universe/queen-6.webp";
import queen7 from "@/assets/dashboard/universe/queen-7.webp";
import queen8 from "@/assets/dashboard/universe/queen-8.webp";
import queen9 from "@/assets/dashboard/universe/queen-9.webp";
import king1 from "@/assets/dashboard/universe/king-1.webp";
import king2 from "@/assets/dashboard/universe/king-2.webp";
import king3 from "@/assets/dashboard/universe/king-3.webp";
import king4 from "@/assets/dashboard/universe/king-4.webp";
import king5 from "@/assets/dashboard/universe/king-5.webp";
import king6 from "@/assets/dashboard/universe/king-6.webp";
import king7 from "@/assets/dashboard/universe/king-7.webp";
import king8 from "@/assets/dashboard/universe/king-8.webp";
import king9 from "@/assets/dashboard/universe/king-9.webp";
import masked1 from "@/assets/dashboard/universe/masked-1.webp";
import masked2 from "@/assets/dashboard/universe/masked-2.webp";
import masked3 from "@/assets/dashboard/universe/masked-3.webp";
import masked4 from "@/assets/dashboard/universe/masked-4.webp";
import masked5 from "@/assets/dashboard/universe/masked-5.webp";
import masked6 from "@/assets/dashboard/universe/masked-6.webp";
import masked7 from "@/assets/dashboard/universe/masked-7.webp";
import masked8 from "@/assets/dashboard/universe/masked-8.webp";
import masked9 from "@/assets/dashboard/universe/masked-9.webp";
import warrior1 from "@/assets/dashboard/universe/warrior-1.webp";
import warrior2 from "@/assets/dashboard/universe/warrior-2.webp";
import warrior3 from "@/assets/dashboard/universe/warrior-3.webp";
import warrior4 from "@/assets/dashboard/universe/warrior-4.webp";
import warrior5 from "@/assets/dashboard/universe/warrior-5.webp";
import warrior6 from "@/assets/dashboard/universe/warrior-6.webp";
import warrior7 from "@/assets/dashboard/universe/warrior-7.webp";
import warrior8 from "@/assets/dashboard/universe/warrior-8.webp";
import warrior9 from "@/assets/dashboard/universe/warrior-9.webp";
import futuristic1 from "@/assets/dashboard/universe/futuristic-1.webp";
import futuristic2 from "@/assets/dashboard/universe/futuristic-2.webp";
import futuristic3 from "@/assets/dashboard/universe/futuristic-3.webp";
import futuristic4 from "@/assets/dashboard/universe/futuristic-4.webp";
import futuristic5 from "@/assets/dashboard/universe/futuristic-5.webp";
import futuristic6 from "@/assets/dashboard/universe/futuristic-6.webp";
import futuristic7 from "@/assets/dashboard/universe/futuristic-7.webp";
import futuristic8 from "@/assets/dashboard/universe/futuristic-8.webp";
import futuristic9 from "@/assets/dashboard/universe/futuristic-9.webp";
import celestial1 from "@/assets/dashboard/universe/celestial-1.webp";
import celestial2 from "@/assets/dashboard/universe/celestial-2.webp";
import celestial3 from "@/assets/dashboard/universe/celestial-3.webp";
import celestial4 from "@/assets/dashboard/universe/celestial-4.webp";
import celestial5 from "@/assets/dashboard/universe/celestial-5.webp";
import celestial6 from "@/assets/dashboard/universe/celestial-6.webp";
import celestial7 from "@/assets/dashboard/universe/celestial-7.webp";
import celestial8 from "@/assets/dashboard/universe/celestial-8.webp";
import celestial9 from "@/assets/dashboard/universe/celestial-9.webp";
export const characterArt: Record<CharacterStyle, readonly string[]> = {
  queen: [queen1, queen2, queen3, queen4, queen5, queen6, queen7, queen8, queen9],
  king: [king1, king2, king3, king4, king5, king6, king7, king8, king9],
  masked: [masked1, masked2, masked3, masked4, masked5, masked6, masked7, masked8, masked9],
  warrior: [
    warrior1,
    warrior2,
    warrior3,
    warrior4,
    warrior5,
    warrior6,
    warrior7,
    warrior8,
    warrior9,
  ],
  futuristic: [
    futuristic1,
    futuristic2,
    futuristic3,
    futuristic4,
    futuristic5,
    futuristic6,
    futuristic7,
    futuristic8,
    futuristic9,
  ],
  celestial: [
    celestial1,
    celestial2,
    celestial3,
    celestial4,
    celestial5,
    celestial6,
    celestial7,
    celestial8,
    celestial9,
  ],
};
export const characterSource = (style: CharacterStyle, level: number) =>
  characterArt[style][Math.min(8, Math.max(0, level - 1))] ?? characterArt.masked[0] ?? "";
