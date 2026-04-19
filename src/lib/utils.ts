import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-success-500";
  if (score >= 6) return "text-brand-400";
  if (score >= 4) return "text-warning-500";
  return "text-danger-500";
}

export function getScoreBg(score: number): string {
  if (score >= 8) return "bg-success-500";
  if (score >= 6) return "bg-brand-500";
  if (score >= 4) return "bg-warning-500";
  return "bg-danger-500";
}

export function getRecommendationConfig(recommendation: string) {
  const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
    "Strong Yes": {
      label: "Strong Yes",
      color: "text-success-500",
      bg: "bg-success-500/10",
      border: "border-success-500/30",
    },
    Yes: {
      label: "Yes",
      color: "text-brand-400",
      bg: "bg-brand-500/10",
      border: "border-brand-500/30",
    },
    Maybe: {
      label: "Maybe",
      color: "text-warning-500",
      bg: "bg-warning-500/10",
      border: "border-warning-500/30",
    },
    No: {
      label: "No",
      color: "text-danger-500",
      bg: "bg-danger-500/10",
      border: "border-danger-500/30",
    },
  };
  return configs[recommendation] || configs["Maybe"];
}

export function generateCandidateId(): string {
  return `TSA-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substr(2, 4)
    .toUpperCase()}`;
}

export function calculateOverallScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
