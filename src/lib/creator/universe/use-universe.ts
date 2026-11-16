import { useCreator } from "@/lib/creator/store";
import { reconcileUniverse, progression, type UniverseState } from "./rules";
export function useUniverse() {
  const { state, update } = useCreator();
  const universe = state.universe;
  const change = (patch: Partial<UniverseState>) =>
    update((s) => ({ universe: reconcileUniverse(s.universe, patch, new Date().toISOString()) }));
  return {
    universe,
    change,
    progress: progression(universe.demoEligibleEarningsUsd),
    profile: state.profile,
    verification: state.verification,
  };
}
