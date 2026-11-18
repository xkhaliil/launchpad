import type { ReactNode } from "react";

/*
 * A small, safe Markdown viewer for generated READMEs: headings, paragraphs,
 * lists, code blocks, inline code, bold and links. It builds React elements
 * and never injects HTML. A `<!-- TODO: … -->` note, which GitHub hides, is
 * shown as a visible chip so nobody approves a README without seeing it.
 */

const TODO = /<!--\s*TODO:?\s*([\s\S]*?)\s*-->/;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern =
    /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|<!--[\s\S]*?-->)/g;
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const [token] = match;
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const id = `${key}-${index++}`;
    if (token.startsWith("`")) {
      out.push(
        <code
          key={id}
          className="rounded bg-ink/6 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      out.push(<strong key={id}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("<!--")) {
      const todo = TODO.exec(token);
      out.push(
        <span
          key={id}
          className="mx-0.5 inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-strong"
        >
          TODO{todo?.[1] ? `: ${todo[1]}` : ""}
        </span>,
      );
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? [];
      const safe = /^https?:\/\//.test(href ?? "");
      out.push(
        safe ? (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent-strong underline underline-offset-2"
          >
            {label}
          </a>
        ) : (
          <span key={id}>{label}</span>
        ),
      );
    }
    last = at + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    const key = `b${blocks.length}`;
    if (paragraph.length) {
      blocks.push(
        <p key={key} className="leading-7">
          {inline(paragraph.join(" "), key)}
        </p>,
      );
      paragraph = [];
    }
    if (list.length) {
      blocks.push(
        <ul key={`${key}l`} className="list-disc space-y-1 pl-5 leading-7">
          {list.map((item, i) => (
            <li key={i}>{inline(item, `${key}l${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
      }
      blocks.push(
        <pre
          key={`c${blocks.length}`}
          className="overflow-x-auto rounded-xl bg-ink/5 px-4 py-3 font-mono text-[13px] leading-6"
        >
          {code.join("\n")}
        </pre>,
      );
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const level = heading[1].length;
      const key = `h${blocks.length}`;
      blocks.push(
        level === 1 ? (
          <h1 key={key} className="text-2xl font-medium tracking-tight">
            {inline(heading[2], key)}
          </h1>
        ) : level === 2 ? (
          <h2 key={key} className="pt-2 text-lg font-medium tracking-tight">
            {inline(heading[2], key)}
          </h2>
        ) : (
          <h3 key={key} className="font-medium">
            {inline(heading[2], key)}
          </h3>
        ),
      );
      continue;
    }
    const item = /^\s*[-*]\s+(.*)$/.exec(line);
    if (item) {
      if (paragraph.length) flush();
      list.push(item[1]);
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (list.length) flush();
    paragraph.push(line.trim());
  }
  flush();

  return <div className="space-y-3 text-[15px] text-ink">{blocks}</div>;
}
