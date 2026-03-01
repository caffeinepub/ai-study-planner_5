import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SessionCard } from "../components/SessionCard";
import {
  useGenerateStudyContent,
  useGetAllSessions,
} from "../hooks/useQueries";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const TOPIC_SUGGESTIONS = [
  "Linear Regression",
  "Operating Systems",
  "AWS EC2",
  "Quantum Computing",
  "React Hooks",
  "Neural Networks",
  "Docker & Kubernetes",
  "SQL Joins",
];

const FEATURE_CARDS = [
  {
    icon: Brain,
    label: "Deep Concepts",
    desc: "Beginner to advanced explanation",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: ClipboardList,
    label: "Key Notes",
    desc: "Bullet points & definitions",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: BookOpen,
    label: "Quiz",
    desc: "MCQs with explanations",
    color: "from-green-500/20 to-green-600/5",
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Calendar,
    label: "Study Planner",
    desc: "1–7 day personalised plan",
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [days, setDays] = useState(3);
  const [showAll, setShowAll] = useState(false);

  const { mutateAsync: generateStudyContent, isPending } =
    useGenerateStudyContent();
  const { data: sessions = [], isLoading: sessionsLoading } =
    useGetAllSessions();

  const recentSessions = showAll ? sessions : sessions.slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      toast.error("Please enter a topic to study");
      return;
    }
    try {
      const id = await generateStudyContent({
        topic: trimmed,
        difficulty,
        days,
      });
      toast.success("Study plan generated!");
      navigate({ to: "/session/$id", params: { id: id.toString() } });
    } catch (err) {
      toast.error("Failed to generate study plan. Please try again.");
      console.error(err);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
  };

  return (
    <main className="flex-1 relative">
      {/* Loading overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-5 max-w-sm text-center px-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-primary/20 animate-pulse-amber" />
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Generating Your Study Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI is building your personalised content for{" "}
                  <span className="text-primary font-medium">"{topic}"</span>…
                </p>
              </div>
              <div className="w-full space-y-1.5">
                {[
                  "Deep concepts",
                  "Key notes",
                  "Quiz questions",
                  "Study planner",
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-2.5 rounded-lg bg-secondary/40 px-3 py-2"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero section */}
      <section className="container mx-auto max-w-3xl px-4 pt-14 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              AI-Powered Learning
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-4">
            <span className="gradient-text">Master Any Topic</span>
            <br />
            <span className="text-foreground/80 text-3xl sm:text-4xl md:text-5xl">
              with AI-powered learning
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground leading-relaxed">
            Enter any topic and get deep concept explanations, key notes, quiz
            questions, and a personalised study plan — all generated in seconds.
          </p>
        </motion.div>

        {/* Feature mini-cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border ${card.border} bg-gradient-to-b ${card.color} p-3 text-center`}
            >
              <card.icon
                className={`mx-auto mb-1.5 h-5 w-5 ${card.iconColor}`}
              />
              <p className="text-xs font-semibold text-foreground">
                {card.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Topic form */}
      <section className="container mx-auto max-w-2xl px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic input */}
            <div className="space-y-2">
              <Label
                htmlFor="topic"
                className="text-sm font-medium text-foreground/80"
              >
                Study Topic
              </Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Linear Regression, AWS EC2, Quantum Computing…"
                className="h-12 bg-secondary/40 border-border/60 text-base placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/50"
                disabled={isPending}
                autoFocus
              />
              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPIC_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full border border-border/40 bg-secondary/30 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/80">
                Difficulty Level
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-all ${
                      difficulty === d
                        ? "border-primary/50 bg-primary/15 text-primary shadow-glow-amber-sm"
                        : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {d === "Beginner" && "🌱 "}
                    {d === "Intermediate" && "⚡ "}
                    {d === "Advanced" && "🔥 "}
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Days slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground/80">
                  Study Plan Duration
                </Label>
                <span className="text-sm font-semibold text-primary">
                  {days} {days === 1 ? "day" : "days"}
                </span>
              </div>
              <Slider
                value={[days]}
                onValueChange={([v]) => setDays(v)}
                min={1}
                max={7}
                step={1}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary/50 [&_[role=slider]]:shadow-glow-amber-sm"
                disabled={isPending}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending || !topic.trim()}
              className="w-full h-12 bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 shadow-glow-amber transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Study Plan
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </section>

      {/* Recent sessions */}
      <section className="container mx-auto max-w-2xl px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recent Sessions
            </h2>
            {sessions.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAll ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    View all ({sessions.length}){" "}
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-xl bg-secondary/30 animate-pulse border border-border/20"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-secondary/20 p-10 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                No sessions yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Generate your first study plan above
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map((session, i) => (
                <SessionCard
                  key={session.id.toString()}
                  session={session}
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}
