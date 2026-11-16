# Creator Universe
Applies to `src/lib/creator/universe/` and `src/components/creator/universe/`.
- Universe state is nested in the Creator store with backward-compatible schema defaults; character selection never reads identity data. Why: existing local records migrate safely and presentation remains self-selected.
- Milestones use an independent configurable demo eligible-earnings USD metric, not naira gross orders or invented FX. Why: official eligibility accounting is unconfirmed.
- Unlock history is recorded once per level; celebration acknowledgments persist and sharing requires both threshold eligibility and an achieved record. Why: no repeated or false achievement claims.
- Original transparent character artwork has six consistent presentation families and nine separately optimised evolution renders per family. Why: meaningful visual upgrades without loading entire artwork sheets on mobile.
- Verification confirmation follows profile completion and submission; no documents are collected. Why: the prototype must not retain identity documents.
- The 3D showroom is client-only (lazy-loaded react-three-fiber) on CC0 Kenney rigged bodies with code-built Enski accessories; 2D portraits stay for cards and fallbacks. Why: real rigged motion without bundling three.js into server rendering or every page.
- Moves are data (keyframed root/bone channels, clip cues, effect and camera cues) in `cast.ts`, sampled by pure functions in `motion.ts`; the stage only plays them. Why: moves stay unique per family and testable without WebGL.
- Showroom choices (favourite, dashboard form, outfit, colourway, accessories, world) are cosmetic and re-validated against earned levels on read in `showroom.ts`. Why: saved picks can never outrank real achievements.
- The character showcase card is drawn on a canvas from `showcaseCardDetails` (`showroom.ts`), which reuses the showroom subject; before Spark it is labelled a starter preview. Why: the downloaded image matches the showroom and never claims an unearned milestone.
