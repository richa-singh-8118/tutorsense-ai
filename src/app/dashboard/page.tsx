"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, SortAsc, Users, TrendingUp, CheckCircle,
  Clock, Star, ChevronRight, Sparkles, BarChart3, User,
  Calendar, ArrowUpRight, RefreshCw, Lock
} from "lucide-react";
import type { EvaluationReport } from "@/types";
import { getRecommendationConfig, getScoreColor, formatDuration } from "@/lib/utils";

type SortKey = "date" | "score" | "name" | "recommendation";
type FilterRec = "all" | "Strong Yes" | "Yes" | "Maybe" | "No";

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-white/20" />
      </div>
      <div className="font-display font-bold text-3xl text-white mb-1">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </motion.div>
  );
}

function CandidateRow({ report, index }: { report: EvaluationReport; index: number }) {
  const router = useRouter();
  const recConfig = getRecommendationConfig(report.recommendation);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/report/${report.id}`)}
      className="group border-b border-white/5 hover:bg-white/3 cursor-pointer transition-all"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="font-medium text-white text-sm">{report.candidateName}</div>
            <div className="text-xs text-white/40">{report.candidateEmail}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${recConfig.bg} ${recConfig.color} ${recConfig.border}`}>
          {report.recommendation}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="font-bold text-white">{report.overallScore.toFixed(1)}</div>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden w-16">
            <div
              className={`h-full rounded-full ${report.overallScore >= 8 ? "bg-success-500" : report.overallScore >= 6 ? "bg-brand-500" : "bg-warning-500"}`}
              style={{ width: `${(report.overallScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-white/50">{formatDuration(report.duration)}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-white/50">
          {new Date(report.interviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-brand-400">View Report</span>
          <ChevronRight className="w-3 h-3 text-brand-400" />
        </div>
      </td>
    </motion.tr>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<EvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRec, setFilterRec] = useState<FilterRec>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("tsa_auth");
    if (!auth) {
      router.push("/login");
      return;
    }
    fetchReports();
  }, [router]);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.candidateName.toLowerCase().includes(q) || r.candidateEmail.toLowerCase().includes(q)
      );
    }
    if (filterRec !== "all") {
      list = list.filter((r) => r.recommendation === filterRec);
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "date") diff = new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime();
      if (sortKey === "score") diff = b.overallScore - a.overallScore;
      if (sortKey === "name") diff = a.candidateName.localeCompare(b.candidateName);
      if (sortKey === "recommendation") {
        const order = { "Strong Yes": 0, Yes: 1, Maybe: 2, No: 3 };
        diff = (order[a.recommendation] ?? 4) - (order[b.recommendation] ?? 4);
      }
      return sortAsc ? -diff : diff;
    });
    return list;
  }, [reports, search, filterRec, sortKey, sortAsc]);

  // Stats
  const totalCandidates = reports.length;
  const avgScore = reports.length ? (reports.reduce((a, b) => a + b.overallScore, 0) / reports.length).toFixed(1) : "—";
  const strongYes = reports.filter((r) => r.recommendation === "Strong Yes").length;
  const avgDuration = reports.length
    ? Math.round(reports.reduce((a, b) => a + b.duration, 0) / reports.length)
    : 0;

  return (
    <div className="min-h-screen pb-16">
      <div className="orb w-80 h-80 bg-brand-600 top-[-5%] right-[-5%] opacity-10" />

      {/* Nav */}
      <nav className="glass border-b border-white/8 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              TutorSense <span className="gradient-text">AI</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 text-xs font-medium border border-brand-500/20">
              Recruiter Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="refresh-reports-btn"
              onClick={fetchReports}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="logout-btn"
              onClick={() => {
                localStorage.removeItem("tsa_auth");
                router.push("/login");
              }}
              className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              id="new-interview-btn"
              onClick={() => router.push("/")}
              className="btn-glow px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              New Interview
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Candidate Evaluations</h1>
          <p className="text-white/50">Review AI-generated screening reports and make informed hiring decisions.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Candidates" value={totalCandidates} sub="Interviews completed" icon={Users} color="bg-brand-500/20" />
          <StatCard label="Average Score" value={avgScore} sub="Out of 10.0" icon={TrendingUp} color="bg-success-500/20" />
          <StatCard label="Strong Yes" value={strongYes} sub={`${totalCandidates ? Math.round((strongYes / totalCandidates) * 100) : 0}% of candidates`} icon={Star} color="bg-accent-500/20" />
          <StatCard label="Avg Duration" value={avgDuration ? formatDuration(avgDuration) : "—"} sub="Interview length" icon={Clock} color="bg-warning-500/20" />
        </div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/8 p-4 mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="candidate-search"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Filter recommendation */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
            <select
              id="filter-recommendation"
              value={filterRec}
              onChange={(e) => setFilterRec(e.target.value as FilterRec)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="all">All Recommendations</option>
              <option value="Strong Yes">Strong Yes</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-white/40 flex-shrink-0" />
            <select
              id="sort-candidates"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="recommendation">Sort by Recommendation</option>
            </select>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="text-sm text-white/40 mb-4">
          Showing {filtered.length} of {reports.length} candidates
        </div>

        {/* Table */}
        <div className="card-premium overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm">Loading candidates...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No candidates match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Candidate", "Recommendation", "Score", "Duration", "Date", ""].map((h, i) => (
                      <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((r, i) => (
                      <CandidateRow key={r.id} report={r} index={i} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick comparison cards */}
        {reports.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-400" />
              Top Candidates
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...reports]
                .sort((a, b) => b.overallScore - a.overallScore)
                .slice(0, 4)
                .map((r, i) => {
                  const rc = getRecommendationConfig(r.recommendation);
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => router.push(`/report/${r.id}`)}
                      className="card-premium p-5 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${rc.bg} ${rc.color} ${rc.border}`}>
                          {r.recommendation}
                        </div>
                      </div>
                      <div className="font-semibold text-white text-sm mb-1 truncate">{r.candidateName}</div>
                      <div className="flex items-center justify-between">
                        <div className={`font-display font-bold text-2xl ${getScoreColor(r.overallScore)}`}>
                          {r.overallScore.toFixed(1)}
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
