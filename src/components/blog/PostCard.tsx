import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate, type Post } from "@/content/blog";
import { AuthorAvatar } from "./AuthorAvatar";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="lift group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-card"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-ice">
        <img
          src={post.image}
          alt={post.imageAlt}
          width={1536}
          height={1024}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-[12px] font-bold text-brand backdrop-blur">
          {post.category}
        </span>
        <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-lime text-midnight opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          <span>{formatDate(post.date)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {post.readMinutes} min read
          </span>
        </div>
        <h3 className="mt-3 text-xl font-extrabold leading-snug text-ink group-hover:text-brand">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <AuthorAvatar name={post.author.name} photo={post.author.photo} className="size-9 text-xs" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">{post.author.name}</span>
            <span className="block truncate text-[12px] text-muted-foreground">{post.author.role}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
