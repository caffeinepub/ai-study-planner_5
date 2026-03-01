import { motion } from "motion/react";

interface PlannerRendererProps {
  studyPlanText: string;
}

interface DayPlan {
  dayNumber: number;
  title: string;
  slots: TimeSlot[];
  tips: string[];
}

interface TimeSlot {
  label: string;
  icon: string;
  content: string;
}

function parseStudyPlan(text: string): {
  days: DayPlan[];
  generalTips: string[];
} {
  if (!text) return { days: [], generalTips: [] };

  const lines = text.split("\n").map((l) => l.trim());
  const days: DayPlan[] = [];
  const generalTips: string[] = [];
  let currentDay: DayPlan | null = null;
  let currentSlot: TimeSlot | null = null;

  for (const line of lines) {
    if (!line) continue;

    // Day header: "## Day 1:", "Day 1:", "**Day 1**"
    const dayMatch = line.match(
      /^(?:##\s*)?(?:\*\*)?Day\s+(\d+)(?:[:\-–]?\s*(.*))?(?:\*\*)?$/i,
    );
    if (dayMatch) {
      if (currentSlot && currentDay) currentDay.slots.push(currentSlot);
      currentSlot = null;
      if (currentDay) days.push(currentDay);
      currentDay = {
        dayNumber: Number.parseInt(dayMatch[1]),
        title: dayMatch[2]?.replace(/\*\*/g, "").trim() || `Day ${dayMatch[1]}`,
        slots: [],
        tips: [],
      };
      continue;
    }

    // Time slot: "Morning:", "Afternoon:", "Evening:", "**Morning (9:00 - 11:00)**", etc.
    const slotMatch = line.match(
      /^(?:[-*]\s*)?(?:\*\*)?(Morning|Afternoon|Evening|Night|Early Morning|Late Evening|Lunch|Break|Review)[\s:(*]/i,
    );
    if (slotMatch && currentDay) {
      if (currentSlot) currentDay.slots.push(currentSlot);
      const slotLabel = slotMatch[1];
      const icon = slotLabel.match(/Morning/i)
        ? "🌅"
        : slotLabel.match(/Afternoon|Lunch/i)
          ? "☀️"
          : slotLabel.match(/Evening/i)
            ? "🌆"
            : slotLabel.match(/Night/i)
              ? "🌙"
              : slotLabel.match(/Break/i)
                ? "☕"
                : slotLabel.match(/Review/i)
                  ? "📝"
                  : "⏰";
      currentSlot = {
        label: slotLabel,
        icon,
        content: line.replace(/^(?:[-*]\s*)?/, "").replace(/\*\*/g, ""),
      };
      continue;
    }

    // Tip / note lines
    if (
      line.match(/^(?:##?\s*)?(?:Tip|Note|Important|Pro Tip|Reminder|💡)/i) ||
      line.match(/^💡/)
    ) {
      const content = line
        .replace(
          /^(?:##?\s*)?(?:Tip|Note|Important|Pro Tip|Reminder|💡)[:\s]*/i,
          "",
        )
        .trim();
      if (content) {
        if (currentDay) currentDay.tips.push(content);
        else generalTips.push(content);
      }
      continue;
    }

    // Bullet continuation under current slot
    if (line.match(/^[-*•]\s/) && currentSlot) {
      currentSlot.content += ` • ${line.slice(2)}`;
      continue;
    }

    // General content
    if (line.match(/^[-*•]\s/) && currentDay && !currentSlot) {
      currentDay.tips.push(line.slice(2));
      continue;
    }

    // Regular paragraph — add to current slot or tip
    if (currentSlot) {
      currentSlot.content += ` ${line}`;
    } else if (currentDay) {
      // Could be a sub-item
      if (line.startsWith("##") || line.startsWith("#")) {
        // section header within a day
      } else {
        currentDay.tips.push(line);
      }
    }
  }

  // Flush remaining
  if (currentSlot && currentDay) currentDay.slots.push(currentSlot);
  if (currentDay) days.push(currentDay);

  return { days, generalTips };
}

export function PlannerRenderer({ studyPlanText }: PlannerRendererProps) {
  const { days, generalTips } = parseStudyPlan(studyPlanText);

  if (!days.length) {
    // Fallback: render raw text with ContentRenderer
    const lines = studyPlanText.split("\n");
    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (!line.trim()) return null;
          const lineKey = `fb-${i}-${line.slice(0, 20)}`;
          if (line.startsWith("## ")) {
            return (
              <h2
                key={lineKey}
                className="mt-5 mb-2 font-display text-lg font-semibold text-primary"
              >
                {line.slice(3)}
              </h2>
            );
          }
          if (line.match(/^[-*•]\s/)) {
            return (
              <p
                key={lineKey}
                className="flex items-start gap-2 text-sm text-foreground/80"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {line.slice(2)}
              </p>
            );
          }
          return (
            <p
              key={lineKey}
              className="text-sm text-foreground/80 leading-relaxed"
            >
              {line}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((day, dayIdx) => (
        <motion.div
          key={day.dayNumber}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIdx * 0.07, duration: 0.4 }}
          className="rounded-xl border border-border/40 bg-card overflow-hidden"
        >
          {/* Day header */}
          <div className="flex items-center gap-3 border-b border-border/30 bg-secondary/20 px-5 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/30 flex-shrink-0">
              <span className="font-display text-sm font-bold text-primary">
                {day.dayNumber}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Day {day.dayNumber}
              </p>
              {day.title && day.title !== `Day ${day.dayNumber}` && (
                <p className="text-sm font-semibold text-foreground">
                  {day.title}
                </p>
              )}
            </div>
          </div>

          {/* Time slots */}
          {day.slots.length > 0 && (
            <div className="p-4 space-y-2">
              {day.slots.map((slot) => (
                <div
                  key={`slot-${day.dayNumber}-${slot.label}`}
                  className="flex items-start gap-3 rounded-lg bg-secondary/30 px-4 py-3 border border-border/20"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {slot.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary mb-0.5">
                      {slot.label}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {slot.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips for this day */}
          {day.tips.length > 0 && (
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <span>💡</span> Tips
                </p>
                {day.tips.map((tip) => (
                  <p
                    key={`tip-${day.dayNumber}-${tip.slice(0, 30)}`}
                    className="text-xs text-foreground/70 leading-relaxed"
                  >
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* General tips */}
      {generalTips.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-display text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <span>💡</span> Study Tips
          </h3>
          <ul className="space-y-2">
            {generalTips.map((tip) => (
              <li
                key={`gtip-${tip.slice(0, 30)}`}
                className="flex items-start gap-2 text-sm text-foreground/75"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
