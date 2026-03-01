import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { StudySession } from "../backend.d";
import { formatRelativeTime, nsToDate } from "../hooks/useQueries";

interface SessionCardProps {
  session: StudySession;
  index?: number;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/15 text-red-400 border-red-500/20",
};

const topicEmojis: Record<string, string> = {
  default: "📚",
  math: "📐",
  science: "🔬",
  programming: "💻",
  history: "🏛️",
  language: "🗣️",
  ai: "🤖",
  cloud: "☁️",
  database: "🗄️",
  network: "🌐",
};

function getTopicEmoji(topic: string): string {
  const lower = topic.toLowerCase();
  if (
    lower.includes("math") ||
    lower.includes("calculus") ||
    lower.includes("algebra")
  )
    return topicEmojis.math;
  if (
    lower.includes("science") ||
    lower.includes("physics") ||
    lower.includes("chemistry")
  )
    return topicEmojis.science;
  if (
    lower.includes("program") ||
    lower.includes("code") ||
    lower.includes("python") ||
    lower.includes("javascript")
  )
    return topicEmojis.programming;
  if (
    lower.includes("history") ||
    lower.includes("ancient") ||
    lower.includes("war")
  )
    return topicEmojis.history;
  if (
    lower.includes("ai") ||
    lower.includes("machine learning") ||
    lower.includes("neural")
  )
    return topicEmojis.ai;
  if (
    lower.includes("cloud") ||
    lower.includes("aws") ||
    lower.includes("azure") ||
    lower.includes("gcp")
  )
    return topicEmojis.cloud;
  if (
    lower.includes("database") ||
    lower.includes("sql") ||
    lower.includes("mysql")
  )
    return topicEmojis.database;
  if (
    lower.includes("network") ||
    lower.includes("tcp") ||
    lower.includes("http")
  )
    return topicEmojis.network;
  return topicEmojis.default;
}

export function SessionCard({ session, index = 0 }: SessionCardProps) {
  const date = nsToDate(session.timestamp);
  const relTime = formatRelativeTime(date);
  const diffClass =
    difficultyColors[session.difficulty] ??
    "bg-secondary text-muted-foreground border-border/50";
  const emoji = getTopicEmoji(session.topic);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <Link to="/session/$id" params={{ id: session.id.toString() }}>
        <div className="group relative flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_4px_20px_oklch(0.05_0.01_255/0.5)] cursor-pointer">
          {/* Topic emoji */}
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-2xl">
            {emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {session.topic}
              </h3>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-0.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${diffClass}`}
              >
                {session.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {session.days.toString()}d plan
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {relTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
