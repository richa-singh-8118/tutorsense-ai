"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Star, TrendingUp, MessageSquare,
  CheckCircle, AlertTriangle, User, Calendar, Clock, Sparkles, Shield
} from "lucide-react";
import type { EvaluationReport } from "@/types";
import { getRecommendationConfig, getScoreColor, getScoreBg, formatDuration } from "@/lib/utils";

const SCORE_LABELS: Record<string, string> = {
  communicationClarity: "Communication Clarity",
  patience: "Patience",
  warmthEmpathy: "Warmth & Empathy",
  abilityToSimplify: "Ability to Simplify",
  englishFluency: "English Fluency",
  confidence: "Confidence",
  teachingSuitability: "Teaching Suitability",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/70">{label}</span>
        <span className={`font-bold text-sm ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${getScoreBg(score)}`}
        />
      </div>
    </div>
  );
}

function CircularScore({ score, size = 120 }: { score: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const pct = score / 10;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={score >= 8 ? "#22c55e" : score >= 6 ? "#6366f1" : score >= 4 ? "#f59e0b" : "#f43f5e"}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-bold text-3xl text-white">{score.toFixed(1)}</div>
        <div className="text-xs text-white/40">/ 10</div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "scores" | "transcript">("overview");

  useEffect(() => {
    const id = params.id as string;
    fetch(`/api/reports/${id}`)
      .then((r) => r.json())
      .then((d) => { setReport(d.report); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading evaluation report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Report not found</p>
          <button onClick={() => router.push("/dashboard")} className="text-brand-400 hover:underline">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const recConfig = getRecommendationConfig(report.recommendation);
  const scoreEntries = Object.entries(report.scores) as [string, number][];

  return (
    <div className="min-h-screen pb-20">
      <div className="orb w-64 h-64 bg-brand-600 top-0 right-0 opacity-10" />

      {/* Header */}
      <div className="glass border-b border-white/8 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-white text-sm">TutorSense AI Report</span>
          </div>
          <button
            id="download-report-btn"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-sm hover:bg-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Candidate hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-3xl text-white mb-1">{report.candidateName}</h1>
              <p className="text-white/50 mb-3">{report.candidateEmail}</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/40">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  {new Date(report.interviewDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  {formatDuration(report.duration)} interview
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  {report.transcript.filter((t) => t.speaker === "candidate").length} responses
                </div>
                {report.persona && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-400 text-xs font-bold border border-accent-500/20">
                    <Sparkles className="w-3 h-3" />
                    {report.persona}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <CircularScore score={report.overallScore} />
              <div>
                <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Recommendation</div>
                <div className={`px-4 py-2 rounded-xl border font-bold text-lg ${recConfig.bg} ${recConfig.color} ${recConfig.border}`}>
                  {report.recommendation}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-xl border border-white/8 mb-6 w-fit">
          {(["overview", "scores", "transcript"] as const).map((tab) => (
            <button
              key={tab}
              id={`report-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-brand-500 text-white shadow-glow" : "text-white/50 hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-6">
            {/* Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-brand-400" />
                  Interviewer Summary
                </h2>
                <p className="text-white/70 leading-relaxed">{report.interviewerSummary}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card-premium p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-premium p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    Areas of Concern
                  </h3>
                  {report.concerns.length === 0 ? (
                    <p className="text-sm text-white/40 italic">No significant concerns noted.</p>
                  ) : (
                    <ul className="space-y-3">
                      {report.concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning-500 mt-1.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {report.supportingQuotes.length > 0 && (
                <div className="card-premium p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-400" />
                    Critical Incident Analysis
                  </h3>
                  <div className="space-y-6">
                    {report.supportingQuotes.map((q, i) => (
                      <div key={i} className="border-l-2 border-brand-500/40 pl-4 space-y-2">
                        <p className="text-white/80 italic text-sm">&ldquo;{q.quote}&rdquo;</p>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{q.context}</p>
                          {q.insight && <p className="text-xs text-brand-300 font-medium">{q.insight}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.biasCheck && (
                <div className="px-6 py-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Fairness Review</span>
                  </div>
                  <p className="text-xs text-white/40 italic">{report.biasCheck}</p>
                </div>
              )}
            </div>

            {/* Score sidebar */}
            <div className="space-y-4">
              <div className="card-premium p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  Score Breakdown
                </h3>
                <div className="space-y-5">
                  {scoreEntries.map(([key, val]) => (
                    <ScoreBar key={key} label={SCORE_LABELS[key] || key} score={val} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scores tab */}
        {activeTab === "scores" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoreEntries.map(([key, val], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="card-premium p-6 text-center"
              >
                <CircularScore score={val} size={100} />
                <div className="mt-4 font-semibold text-white text-sm">{SCORE_LABELS[key]}</div>
                <div className={`text-xs mt-1 ${getScoreColor(val)}`}>
                  {val >= 8 ? "Excellent" : val >= 6 ? "Good" : val >= 4 ? "Average" : "Needs Work"}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Transcript tab */}
        {activeTab === "transcript" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium p-6">
            <h2 className="font-display font-bold text-lg text-white mb-6">Interview Transcript</h2>
            {report.transcript.length === 0 ? (
              <p className="text-white/40 text-center py-8">No transcript available for this interview.</p>
            ) : (
              <div className="space-y-4">
                {report.transcript.map((entry) => (
                  <div key={entry.id} className={`flex gap-4 ${entry.speaker === "candidate" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${entry.speaker === "ai" ? "bg-brand-500/20 border border-brand-500/30" : "bg-accent-500/20 border border-accent-500/30"}`}>
                      {entry.speaker === "ai" ? "🤖" : "🧑"}
                    </div>
                    <div className={`max-w-[70%] px-4 py-3 rounded-xl text-sm leading-relaxed ${entry.speaker === "ai" ? "bg-brand-500/10 text-white/80 border border-brand-500/15" : "bg-white/5 text-white/70 border border-white/10"}`}>
                      <div className="text-xs text-white/30 mb-1.5 font-medium">
                        {entry.speaker === "ai" ? "Maya (AI Interviewer)" : "Candidate"}
                      </div>
                      {entry.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
