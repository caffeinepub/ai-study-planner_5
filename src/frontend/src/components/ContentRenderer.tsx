/**
 * ContentRenderer — converts markdown-like text (## h2, ### h3, - bullet)
 * into styled JSX for the Concepts, Notes, and Planner tabs.
 */

interface ContentRendererProps {
  text: string;
  variant?: "concepts" | "notes" | "planner";
}

export function ContentRenderer({
  text,
  variant = "concepts",
}: ContentRendererProps) {
  if (!text) {
    return (
      <p className="text-muted-foreground italic text-sm">
        No content available.
      </p>
    );
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  const key = () => `el-${keyCounter++}`;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      const content = line.slice(3);
      elements.push(
        <div key={key()} className="mt-6 mb-3 first:mt-0">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-px flex-1 bg-border/60 max-w-4" />
            <span className="text-primary">{content}</span>
            <span className="h-px flex-1 bg-border/60" />
          </h2>
        </div>,
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      const content = line.slice(4);
      elements.push(
        <h3
          key={key()}
          className="mt-4 mb-2 font-display text-base font-medium text-foreground/90"
        >
          {content}
        </h3>,
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      const content = line.slice(2);
      elements.push(
        <h1
          key={key()}
          className="mt-4 mb-3 font-display text-xl font-bold text-foreground"
        >
          {content}
        </h1>,
      );
      i++;
      continue;
    }

    // Markdown table (lines starting with |)
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out pure separator rows like |---|---|
      const dataLines = tableLines.filter(
        (l) =>
          !l.replace(/[|\s\-:]/g, "").length === false &&
          !/^[\|\s\-:]+$/.test(l),
      );
      if (dataLines.length > 0) {
        const parsedRows = dataLines.map((l) =>
          l
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim()),
        );
        const [headerRow, ...bodyRows] = parsedRows;
        elements.push(
          <div
            key={key()}
            className="my-3 overflow-x-auto rounded-lg border border-border/40"
          >
            <table className="w-full text-sm">
              {headerRow && (
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/40">
                    {headerRow.map((cell) => (
                      <th
                        key={`th-${cell.slice(0, 20)}`}
                        className="px-4 py-2.5 text-left font-semibold text-foreground/90 whitespace-nowrap"
                      >
                        {renderInlineFormatting(cell, variant)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr
                    key={`tr-${ri}-${row[0]?.slice(0, 15) ?? ri}`}
                    className="border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={`td-${ci}-${cell.slice(0, 15)}`}
                        className="px-4 py-2.5 text-foreground/80"
                      >
                        {renderInlineFormatting(cell, variant)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    // Bullet points
    if (line.match(/^[-*•]\s/)) {
      // Collect consecutive bullets
      const bullets: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key()} className="my-2 space-y-1.5">
          {bullets.map((bullet) => (
            <li
              key={`bullet-${bullet.slice(0, 30)}`}
              className="flex items-start gap-2 text-sm text-foreground/85"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>{renderInlineFormatting(bullet, variant)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        const numbered: Array<{ num: string; content: string }> = [];
        while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
          const m = lines[i].match(/^(\d+)\.\s(.*)$/);
          if (m) numbered.push({ num: m[1], content: m[2] });
          i++;
        }
        elements.push(
          <ol key={key()} className="my-2 space-y-1.5">
            {numbered.map((item) => (
              <li
                key={`num-${item.num}-${item.content.slice(0, 20)}`}
                className="flex items-start gap-2 text-sm text-foreground/85"
              >
                <span className="flex-shrink-0 font-mono text-xs font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 mt-0.5">
                  {item.num}
                </span>
                <span>{renderInlineFormatting(item.content, variant)}</span>
              </li>
            ))}
          </ol>,
        );
        continue;
      }
    }

    // Planner-specific: Day header
    if (variant === "planner" && line.match(/^Day\s+\d+/i)) {
      elements.push(
        <div key={key()} className="mt-6 mb-3 first:mt-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
              <span className="font-display text-sm font-bold text-primary">
                {line.match(/\d+/)?.[0] ?? "?"}
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {line}
            </h2>
          </div>
        </div>,
      );
      i++;
      continue;
    }

    // Time slot patterns (Morning, Afternoon, Evening, etc.)
    if (
      variant === "planner" &&
      line.match(/^(Morning|Afternoon|Evening|Night|AM|PM|🌅|🌞|🌙)[\s:]/i)
    ) {
      const icon = line.match(/^Morning/i)
        ? "🌅"
        : line.match(/^Afternoon/i)
          ? "☀️"
          : line.match(/^Evening|Night/i)
            ? "🌙"
            : "⏰";
      elements.push(
        <div
          key={key()}
          className="flex items-start gap-3 rounded-lg bg-secondary/40 border border-border/30 px-4 py-3 my-2"
        >
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="flex-1">
            <p className="text-sm text-foreground/90">
              {renderInlineFormatting(line, variant)}
            </p>
          </div>
        </div>,
      );
      i++;
      continue;
    }

    // Tips / Note blocks
    if (line.match(/^(Tip|Note|Important|Warning|💡|📝|⚠️)/i)) {
      elements.push(
        <div
          key={key()}
          className="my-3 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <span className="flex-shrink-0 text-primary text-lg">
            {line.startsWith("💡") || line.startsWith("Tip")
              ? "💡"
              : line.startsWith("📝") || line.startsWith("Note")
                ? "📝"
                : "⚠️"}
          </span>
          <p className="text-sm text-foreground/85">
            {renderInlineFormatting(line, variant)}
          </p>
        </div>,
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={key()}
        className="my-2 text-sm leading-relaxed text-foreground/80"
      >
        {renderInlineFormatting(line, variant)}
      </p>,
    );
    i++;
  }

  return <div className="prose-custom space-y-0">{elements}</div>;
}

/**
 * Inline formatting: **bold**, `code`, and definition highlighting for notes
 */
function renderInlineFormatting(
  text: string,
  variant: "concepts" | "notes" | "planner",
): React.ReactNode {
  if (!text) return null;

  // Split by bold (**text**), italic (*text*), and code (`text`)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    // Use position-prefixed keys — position is stable for a given text string
    const k = `p${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={k} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={k}
          className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-xs text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={k} className="italic text-foreground/70">
          {part.slice(1, -1)}
        </em>
      );
    }

    // In notes variant, highlight "Term:" patterns as definition pills
    if (variant === "notes" && part.match(/^([A-Z][^:]+):/)) {
      const colonIdx = part.indexOf(":");
      const term = part.slice(0, colonIdx);
      const rest = part.slice(colonIdx + 1);
      return (
        <span key={k}>
          <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary mr-1">
            {term}
          </span>
          {rest}
        </span>
      );
    }

    return part;
  });
}
