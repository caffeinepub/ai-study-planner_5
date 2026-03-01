import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, HelpCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface QuizQuestion {
  number: number;
  question: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

function parseQuiz(raw: string): QuizQuestion[] {
  if (!raw) return [];

  const questions: QuizQuestion[] = [];

  // Split by question boundaries: "Q1:", "Q2:", etc.
  const qBlocks = raw.split(/\n(?=Q\d+[:.]\s)/);

  for (const block of qBlocks) {
    if (!block.trim()) continue;

    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    // First line: "Q1: question text" or "Q1. question text"
    const firstLine = lines[0];
    const qMatch = firstLine.match(/^Q(\d+)[:.]\s*(.+)$/i);
    if (!qMatch) continue;

    const number = Number.parseInt(qMatch[1]);
    const question = qMatch[2];

    // Parse options A) B) C) D) or A. B. C. D.
    const options: { letter: string; text: string }[] = [];
    let correctAnswer = "";
    let explanation = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      const optMatch = line.match(/^([A-D])[).]\s*(.+)$/);
      if (optMatch) {
        options.push({ letter: optMatch[1], text: optMatch[2] });
        continue;
      }

      const answerMatch = line.match(/^(?:Correct\s+)?Answer[:.]\s*([A-D])/i);
      if (answerMatch) {
        correctAnswer = answerMatch[1].toUpperCase();
        continue;
      }

      const explMatch = line.match(/^Explanation[:.]\s*(.+)$/i);
      if (explMatch) {
        explanation = explMatch[1];
        continue;
      }

      // Continuation of explanation
      if (explanation && !line.match(/^[A-DQ]\d*[).]/)) {
        explanation += ` ${line}`;
      }
    }

    if (question && options.length > 0) {
      questions.push({ number, question, options, correctAnswer, explanation });
    }
  }

  return questions;
}

interface QuizRendererProps {
  quizText: string;
}

export function QuizRenderer({ quizText }: QuizRendererProps) {
  const questions = parseQuiz(quizText);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const totalAnswered = Object.keys(revealed).length;
  const totalCorrect = questions.filter(
    (q) => revealed[q.number] && selected[q.number] === q.correctAnswer,
  ).length;

  if (!questions.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-secondary/20 p-8 text-center">
        <HelpCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">
          No quiz questions available.
        </p>
      </div>
    );
  }

  const handleSelect = (qNum: number, letter: string) => {
    if (revealed[qNum]) return;
    setSelected((prev) => ({ ...prev, [qNum]: letter }));
    setRevealed((prev) => ({ ...prev, [qNum]: true }));
  };

  const handleReset = () => {
    setSelected({});
    setRevealed({});
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {questions.length} Question{questions.length !== 1 ? "s" : ""}
          </span>
          {totalAnswered > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalAnswered}/{questions.length} answered
            </span>
          )}
        </div>
        {totalAnswered === questions.length && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">
              Score: {totalCorrect}/{questions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs border-border/50"
            >
              Retry
            </Button>
          </div>
        )}
        {totalAnswered > 0 && totalAnswered < questions.length && (
          <div className="h-1.5 w-32 rounded-full bg-border/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, qIdx) => {
        const userAnswer = selected[q.number];
        const isRevealed = revealed[q.number];
        const isCorrect = userAnswer === q.correctAnswer;

        return (
          <motion.div
            key={q.number}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIdx * 0.06, duration: 0.4 }}
            className="rounded-xl border border-border/40 bg-card overflow-hidden"
          >
            {/* Question header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {q.number}
                </span>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {q.question}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="px-5 pb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((opt) => {
                const isSelected = userAnswer === opt.letter;
                const isCorrectOpt = opt.letter === q.correctAnswer;

                let optClass =
                  "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition-all cursor-pointer select-none";

                if (!isRevealed) {
                  optClass += isSelected
                    ? " border-primary/50 bg-primary/10 text-foreground"
                    : " border-border/40 bg-secondary/30 text-foreground/80 hover:border-primary/30 hover:bg-secondary/50";
                } else if (isCorrectOpt) {
                  optClass +=
                    " border-green-500/40 bg-green-500/10 text-green-400";
                } else if (isSelected && !isCorrect) {
                  optClass += " border-red-500/40 bg-red-500/10 text-red-400";
                } else {
                  optClass +=
                    " border-border/20 bg-secondary/10 text-foreground/40";
                }

                return (
                  <button
                    type="button"
                    key={opt.letter}
                    onClick={() => handleSelect(q.number, opt.letter)}
                    className={optClass}
                    disabled={isRevealed}
                  >
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        !isRevealed
                          ? isSelected
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border/60 text-muted-foreground"
                          : isCorrectOpt
                            ? "border-green-500 text-green-400"
                            : isSelected && !isCorrect
                              ? "border-red-500 text-red-400"
                              : "border-border/30 text-foreground/30"
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <span className="flex-1 text-left">{opt.text}</span>
                    {isRevealed && isCorrectOpt && (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
                    )}
                    {isRevealed &&
                      isSelected &&
                      !isCorrect &&
                      opt.letter === userAnswer && (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                      )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {isRevealed && q.explanation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`mx-5 mb-4 rounded-lg border px-4 py-3 ${
                      isCorrect
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0">
                        {isCorrect ? "✅" : "📖"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground/70 mb-0.5">
                          {isCorrect
                            ? "Correct!"
                            : `Correct answer: ${q.correctAnswer}`}
                        </p>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt to answer */}
            {!isRevealed && (
              <div className="px-5 pb-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  Click an option to reveal the answer
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
