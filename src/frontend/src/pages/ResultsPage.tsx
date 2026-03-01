import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  ClipboardList,
  Clock,
  LayoutList,
  Loader2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ContentRenderer } from "../components/ContentRenderer";
import { PlannerRenderer } from "../components/PlannerRenderer";
import { QuizRenderer } from "../components/QuizRenderer";
import {
  formatDate,
  nsToDate,
  useDeleteSession,
  useGetSession,
} from "../hooks/useQueries";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400 border-green-500/25",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Advanced: "bg-red-500/15 text-red-400 border-red-500/25",
};

export function ResultsPage() {
  const { id } = useParams({ from: "/session/$id" });
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sessionId = BigInt(id);
  const { data: session, isLoading, error } = useGetSession(sessionId);
  const { mutateAsync: deleteSession, isPending: isDeleting } =
    useDeleteSession();

  const handleDelete = async () => {
    try {
      await deleteSession(sessionId);
      toast.success("Session deleted");
      setDeleteOpen(false);
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete session");
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-28 mb-4 bg-secondary/60" />
          <Skeleton className="h-9 w-64 mb-2 bg-secondary/60" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-secondary/60" />
            <Skeleton className="h-6 w-16 rounded-full bg-secondary/60" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-6 bg-secondary/60 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-16 w-full bg-secondary/60 rounded-xl"
            />
          ))}
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive/60" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Session Not Found
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          This study session may have been deleted or doesn't exist.
        </p>
        <Link to="/">
          <Button variant="outline" className="border-border/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </main>
    );
  }

  const date = nsToDate(session.timestamp);
  const diffClass =
    difficultyColors[session.difficulty] ??
    "bg-secondary text-muted-foreground border-border/50";

  return (
    <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl truncate mb-2">
              {session.topic}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffClass}`}
              >
                {session.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {session.days.toString()}-day plan
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(date)}
              </span>
            </div>
          </div>

          {/* Delete */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50 max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">
                  Delete Session?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  This will permanently delete your study session for{" "}
                  <span className="font-medium text-foreground">
                    "{session.topic}"
                  </span>
                  . This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
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
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="concepts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/40 border border-border/40 h-11 mb-6 p-1 rounded-xl">
            <TabsTrigger
              value="concepts"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Brain className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Concepts</span>
              <span className="sm:hidden">Ideas</span>
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Quiz</span>
            </TabsTrigger>
            <TabsTrigger
              value="planner"
              className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <LayoutList className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Planner</span>
            </TabsTrigger>
          </TabsList>

          {/* Concepts tab */}
          <TabsContent value="concepts" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="concepts"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/40 bg-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                  <Brain className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    Deep Concept Explanation
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">
                    Beginner → Advanced
                  </span>
                </div>
                <ContentRenderer text={session.concepts} variant="concepts" />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border/40 bg-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/30">
                  <ClipboardList className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    Key Notes
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">
                    Formulas &amp; Definitions
                  </span>
                </div>
                <ContentRenderer text={session.notes} variant="notes" />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Quiz tab */}
          <TabsContent value="quiz" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4 rounded-xl border border-border/40 bg-card px-5 py-4">
                  <BookOpen className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    Interactive Quiz
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">
                    Click to reveal answers
                  </span>
                </div>
                <QuizRenderer quizText={session.quiz} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Planner tab */}
          <TabsContent value="planner" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="planner"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4 rounded-xl border border-border/40 bg-card px-5 py-4">
                  <LayoutList className="h-4 w-4 text-purple-400 flex-shrink-0" />
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    Personalised Study Planner
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5">
                    {session.days.toString()}-day schedule
                  </span>
                </div>
                <PlannerRenderer studyPlanText={session.studyPlan} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
