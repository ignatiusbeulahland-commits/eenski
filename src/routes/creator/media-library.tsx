import { createFileRoute } from "@tanstack/react-router";
import { MediaLibrary } from "@/components/creator/Media";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/media-library")({
  head: () => creatorMeta("Media Library", "Keep your product images, videos, audio and documents in one place."),
  component: () => <MediaLibrary />,
});
