import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
  History,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudySession } from "../backend.d";
import {
  formatDate,
  formatRelativeTime,
  nsToDate,
  useDeleteSession,
  useGetAllSessions,
} from "../hooks/useQueries";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/15 text-red-400 border-red-500/20",
};

const topicEmojis = (topic: string): string => {
  const lower = topic.toLowerCase();
  if (
    lower.includes("math") ||
    lower.includes("calculus") ||
    lower.includes("algebra")
  )
    return "📐";
  if (
    lower.includes("science") ||
    lower.includes("physics") ||
    lower.includes("chemistry")
  )
    return "🔬";
  if (
    lower.includes("program") ||
    lower.includes("code") ||
    lower.includes("python") ||
    lower.includes("javascript")
  )
    return "💻";
  if (lower.includes("history") || lower.includes("ancient")) return "🏛️";
  if (
    lower.includes("ai") ||
    lower.includes("machine learning") ||
    lower.includes("neural")
  )
    return "🤖";
  if (
    lower.includes("cloud") ||
    lower.includes("aws") ||
    lower.includes("azure")
  )
    return "☁️";
  if (lower.includes("database") || lower.includes("sql")) return "🗄️";
  if (
    lower.includes("network") ||
    lower.includes("tcp") ||
    lower.includes("http")
  )
    return "🌐";
  return "📚";
};

type FilterDifficulty = "All" | "Beginner" | "Intermediate" | "Advanced";

export function HistoryPage() {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = useGetAllSessions();
  const { mutateAsync: deleteSession, isPending: isDeleting } =
    useDeleteSession();

  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] =
    useState<FilterDifficulty>("All");
  const [deleteTarget, setDeleteTarget] = useState<StudySession | null>(null);

  const filtered = sessions.filter((s) => {
    const matchSearch = s.topic.toLowerCase().includes(search.toLowerCase());
    const matchDiff =
      filterDifficulty === "All" || s.difficulty === filterDifficulty;
    return matchSearch && matchDiff;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSession(deleteTarget.id);
      toast.success(`Deleted "${deleteTarget.topic}"`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const handleRowClick = (session: StudySession) => {
    navigate({ to: "/session/$id", params: { id: session.id.toString() } });
  };

  return (
    <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-2.5">
              <History className="h-6 w-6 text-primary flex-shrink-0" />
              Study History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {sessions.length === 0
                ? "No sessions yet"
                : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          {sessions.length > 0 && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/25 flex-shrink-0">
              <span className="text-sm font-bold text-primary">
                {sessions.length}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics…"
              className="pl-8 h-9 bg-secondary/40 border-border/50 text-sm"
            />
          </div>
          <div className="flex gap-1.5 items-center">
            <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            {(
              [
                "All",
                "Beginner",
                "Intermediate",
                "Advanced",
              ] as FilterDifficulty[]
            ).map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  filterDifficulty === d
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/40 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[76px] rounded-xl bg-secondary/30 animate-pulse border border-border/20"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/30 bg-card p-16 text-center"
        >
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No sessions yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start studying to see your history here
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Generate Your First Plan
          </Button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/30 bg-secondary/20 p-12 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No sessions match your search
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {filtered.map((session, i) => {
            const date = nsToDate(session.timestamp);
            const relTime = formatRelativeTime(date);
            const diffClass =
              difficultyColors[session.difficulty] ??
              "bg-secondary text-muted-foreground border-border/50";
            const emoji = topicEmojis(session.topic);

            return (
              <motion.div
                key={session.id.toString()}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card p-4 hover:border-primary/30 hover:shadow-[0_4px_20px_oklch(0.05_0.01_255/0.5)] transition-all cursor-pointer"
                onClick={() => handleRowClick(session)}
              >
                {/* Emoji */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-xl">
                  {emoji}
                </div>

                {/* Topic + meta */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors mb-1">
                    {session.topic}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${diffClass}`}
                    >
                      {session.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {session.days.toString()}d
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {relTime}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(session);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Delete Session?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                "{deleteTarget?.topic}"
              </span>
              . This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border-border/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
