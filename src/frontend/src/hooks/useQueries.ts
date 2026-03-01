import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StudySession } from "../backend.d";
import { useActor } from "./useActor";

// ── Get all sessions ───────────────────────────────────────────
export function useGetAllSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      const sessions = await actor.getAllSessions();
      // Sort by timestamp descending (most recent first)
      return [...sessions].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Get a single session ───────────────────────────────────────
export function useGetSession(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession | null>({
    queryKey: ["session", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const result = await actor.getSession(id);
      // ICP Candid optional values come back as arrays: [] = null, [value] = Some
      if (Array.isArray(result)) {
        return (result as StudySession[])[0] ?? null;
      }
      return result ?? null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ── Get session count ──────────────────────────────────────────
export function useGetSessionCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["sessionCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getSessionCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Generate study content (mutation) ─────────────────────────
export function useGenerateStudyContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    bigint,
    Error,
    { topic: string; difficulty: string; days: number }
  >({
    mutationFn: async ({ topic, difficulty, days }) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateStudyContent(topic, difficulty, BigInt(days));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessionCount"] });
    },
  });
}

// ── Delete session (mutation) ──────────────────────────────────
export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessionCount"] });
    },
  });
}

// ── Utility: nanoseconds bigint → Date ────────────────────────
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1_000_000);
}

// ── Utility: format date ───────────────────────────────────────
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Utility: format relative time ─────────────────────────────
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}
