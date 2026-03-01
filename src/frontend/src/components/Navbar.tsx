import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, History, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function Navbar() {
  const location = useLocation();
  const isHistory = location.pathname === "/history";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <img
                src="/assets/generated/study-planner-logo-transparent.dim_80x80.png"
                alt="AI Study Planner"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-semibold leading-none text-foreground">
                AI Study
              </span>
              <span className="font-display text-xs leading-none text-primary font-medium">
                Planner
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Generate</span>
              </motion.div>
            </Link>
            <Link to="/history">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isHistory
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>History</span>
              </motion.div>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
