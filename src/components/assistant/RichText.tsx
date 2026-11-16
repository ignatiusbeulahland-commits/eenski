import type { ReactNode } from "react";

/** Tiny formatter for help answers: **bold**, *italic*, "- " bullets and "1. " steps. */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    out.push(
      t.startsWith("**") ? (
        <strong key={`${key}-${i++}`} className="font-extrabold text-ink">
          {t.slice(2, -2)}
        </strong>
      ) : (
        <em key={`${key}-${i++}`}>{t.slice(1, -1)}</em>
      ),
    );
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i] ?? "";
    if (/^- /.test(l) || /^\d+\. /.test(l)) {
      const ordered = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i] ?? "") : /^- /.test(lines[i] ?? ""))) {
        items.push((lines[i] ?? "").replace(ordered ? /^\d+\. / : /^- /, ""));
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={`b${i}`} className={ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `${i}-${j}`)}</li>
          ))}
        </Tag>,
      );
      continue;
    }
    if (l.trim()) blocks.push(<p key={`b${i}`}>{inline(l, `p${i}`)}</p>);
    i++;
  }
  return <div className="space-y-2">{blocks}</div>;
}
