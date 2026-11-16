import { useState } from "react";
import { toast } from "sonner";
import { kbStore, saveArticle, removeArticle, restoreArticle } from "@/lib/assistant/store";
import type { KbArticle } from "@/lib/assistant/types";
import { newId } from "@/lib/assistant/persist";
import { undoToast } from "@/lib/shared/undo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading, Panel, Pick, Chip, Empty, field } from "./shared";
const audiences = [
  { value: "all", label: "Everyone" },
  { value: "public", label: "Visitor" },
  { value: "learner", label: "Learner" },
  { value: "creator", label: "Creator" },
  { value: "affiliate", label: "Affiliate" },
];
export function KnowledgeBasePage() {
  const articles = kbStore.use();
  const [q, Q] = useState(""),
    [audience, A] = useState("any"),
    [category, C] = useState("any"),
    [editing, E] = useState<KbArticle | null>(null);
  const categories = Array.from(new Set(articles.map((a) => a.category))).sort();
  const filtered = articles.filter(
    (a) =>
      `${a.title} ${a.answer} ${a.keywords.join(" ")}`.toLowerCase().includes(q.toLowerCase()) &&
      (audience === "any" || a.audience === audience) &&
      (category === "any" || a.category === category),
  );
  return (
    <>
      <Heading title="Knowledge base" description="Give Charm useful, clear answers. Only published articles are used." />
      <Button
        className="mb-5"
        onClick={() =>
          E({
            id: "",
            title: "",
            answer: "",
            audience: "all",
            category: "General",
            keywords: [],
            actions: [],
            published: true,
            updatedAt: 0,
          })
        }
      >
        New article
      </Button>
      <Panel>
        <label className="block text-sm">
          Search articles
          <input className={`${field} mt-2`} value={q} onChange={(e) => Q(e.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Pick label="Audience" value={audience} onChange={A} options={[{ value: "any", label: "All audiences" }, ...audiences]} />
          <Pick label="Category" value={category} onChange={C} options={[{ value: "any", label: "All categories" }, ...categories]} />
        </div>
        {!filtered.length && <Empty />}
        {categories.map((cat) => {
          const rows = filtered.filter((a) => a.category === cat);
          return rows.length ? (
            <section key={cat} className="space-y-3">
              <h2 className="font-semibold">{cat}</h2>
              {rows.map((a) => (
                <article key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="mt-2 flex gap-2">
                      <Chip>{audiences.find((x) => x.value === a.audience)?.label}</Chip>
                      <Chip>{a.category}</Chip>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={a.published}
                        onCheckedChange={(published) => {
                          saveArticle({ ...a, published });
                          toast.success(published ? "Article published" : "Article unpublished");
                        }}
                      />
                      Used by Charm
                    </label>
                    <Button size="sm" variant="outline" onClick={() => E(a)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        const result = removeArticle(a.id);
                        if (result) undoToast("Article removed", () => restoreArticle(result.removed, result.index));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </section>
          ) : null;
        })}
      </Panel>
      {editing && <ArticleEditor key={editing.id} article={editing} categories={categories} close={() => E(null)} />}
    </>
  );
}
function ArticleEditor({ article, categories, close }: { article: KbArticle; categories: string[]; close: () => void }) {
  const [a, A] = useState(article),
    [keywords, K] = useState(article.keywords.join(", ")),
    [links, L] = useState(
      Array.from({ length: 3 }, (_, i) => ({ label: article.actions[i]?.label ?? "", href: article.actions[i]?.href ?? "" })),
    );
  function save() {
    const words = keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!a.title.trim() || !a.answer.trim() || !words.length) {
      toast.error("Add a title, answer and at least one keyword.");
      return;
    }
    const active = links.filter((l) => l.label.trim() || l.href.trim());
    if (active.some((l) => !l.label.trim() || !/^\/(?!\/)[^\s\\]*$/.test(l.href))) {
      toast.error("Each quick link needs a label and an on-site URL starting with /.");
      return;
    }
    saveArticle({
      ...a,
      id:
        a.id ||
        `${
          a.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "article"
        }-${newId().slice(-6)}`,
      title: a.title.trim(),
      answer: a.answer.trim(),
      category: a.category.trim() || "General",
      keywords: words,
      actions: active.map((l) => ({ label: l.label.trim(), href: l.href })),
    });
    toast.success("Article saved");
    close();
  }
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{a.id ? "Edit article" : "New article"}</DialogTitle>
        </DialogHeader>
        <label className="text-sm">
          Title
          <input className={field} value={a.title} onChange={(e) => A({ ...a, title: e.target.value })} />
        </label>
        <Pick label="Audience" value={a.audience} options={audiences} onChange={(v) => A({ ...a, audience: v as KbArticle["audience"] })} />
        <label className="text-sm">
          Category
          <input
            className={field}
            list="support-article-categories"
            value={a.category}
            onChange={(e) => A({ ...a, category: e.target.value })}
          />
          <datalist id="support-article-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="text-sm">
          Keywords, comma separated
          <input className={field} value={keywords} onChange={(e) => K(e.target.value)} />
        </label>
        <label className="text-sm">
          Answer
          <textarea rows={6} className={field} value={a.answer} onChange={(e) => A({ ...a, answer: e.target.value })} />
          <span className="text-xs text-muted-foreground">
            Supports **bold**, lines starting with “- ” and numbered lists such as “1. ”.
          </span>
        </label>
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm">Quick links (optional, up to 3)</legend>
          {links.map((l, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label={`Link ${i + 1} label`}
                className={field}
                placeholder="Label"
                value={l.label}
                onChange={(e) => L(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <input
                aria-label={`Link ${i + 1} URL`}
                className={field}
                placeholder="/courses"
                value={l.href}
                onChange={(e) => L(links.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
              />
            </div>
          ))}
        </fieldset>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={a.published} onCheckedChange={(published) => A({ ...a, published })} />
          Used by Charm
        </label>
        <Button onClick={save}>Save article</Button>
      </DialogContent>
    </Dialog>
  );
}
