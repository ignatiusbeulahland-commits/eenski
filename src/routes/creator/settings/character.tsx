import { createFileRoute } from "@tanstack/react-router";
import { CharacterPreferences } from "@/components/creator/universe/Pages";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/character")({
  head: () =>
    creatorMeta(
      "Character Preferences",
      "Explore your original Enski character and nine Creator milestone evolutions.",
    ),
  component: CharacterPreferences,
});
