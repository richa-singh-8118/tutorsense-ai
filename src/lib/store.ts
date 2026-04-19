// In-memory store simulating a database (replace with Supabase in production)
import type { EvaluationReport, Candidate } from "@/types";

// Demo data for the recruiter dashboard
const DEMO_REPORTS: EvaluationReport[] = [
  {
    id: "rpt-001",
    candidateId: "cnd-001",
    candidateName: "Priya Sharma",
    candidateEmail: "priya.sharma@example.com",
    interviewDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 540,
    scores: {
      communicationClarity: 9.2,
      patience: 8.8,
      warmthEmpathy: 9.5,
      abilityToSimplify: 9.0,
      englishFluency: 8.5,
      confidence: 8.7,
      teachingSuitability: 9.3,
    },
    overallScore: 9.0,
    recommendation: "Strong Yes",
    strengths: [
      "Exceptional warmth — used child-centric language naturally",
      "Creative analogies for simplifying fractions (pizza, sharing toys)",
      "Showed genuine empathy for struggling students",
      "Confident and fluent in English with clear articulation",
    ],
    concerns: [
      "Could elaborate more on handling advanced students",
    ],
    supportingQuotes: [
      {
        quote: "When a child says they can't do it, I always say — let's find out what PART of it feels hard, because usually it's just one small piece.",
        context: "Response to handling frustrated students",
      },
      {
        quote: "I'd use a pizza to explain fractions. If we cut it into 4 slices and you eat one, you ate one-fourth. That's it!",
        context: "Explaining fractions to a 9-year-old",
      },
    ],
    interviewerSummary:
      "Priya demonstrated outstanding teaching temperament throughout the interview. Her responses were warm, specific, and child-centred. She has a natural ability to break down complex ideas using everyday objects and shows genuine empathy for learners at all levels. Strongly recommended for Cuemath tutor role.",
    transcript: [],
  },
  {
    id: "rpt-002",
    candidateId: "cnd-002",
    candidateName: "Rahul Verma",
    candidateEmail: "rahul.verma@example.com",
    interviewDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    duration: 480,
    scores: {
      communicationClarity: 7.5,
      patience: 7.0,
      warmthEmpathy: 6.8,
      abilityToSimplify: 7.2,
      englishFluency: 8.0,
      confidence: 8.5,
      teachingSuitability: 7.0,
    },
    overallScore: 7.4,
    recommendation: "Yes",
    strengths: [
      "Strong subject knowledge and logical approach",
      "Good English fluency and confident delivery",
      "Shows growth mindset and willingness to learn",
    ],
    concerns: [
      "Explanations tend to be technical — needs more child-friendly language",
      "Limited empathy responses to frustrated students",
    ],
    supportingQuotes: [
      {
        quote: "I would break the problem into smaller steps and make sure they understand each step before moving on.",
        context: "Handling a student who doesn't understand",
      },
    ],
    interviewerSummary:
      "Rahul is a knowledgeable and confident candidate with solid communication skills. His main growth area is developing more warmth and child-friendly language. With some coaching, he could become a good tutor. Recommended with minor reservations.",
    transcript: [],
  },
  {
    id: "rpt-003",
    candidateId: "cnd-003",
    candidateName: "Anjali Nair",
    candidateEmail: "anjali.nair@example.com",
    interviewDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    duration: 420,
    scores: {
      communicationClarity: 5.5,
      patience: 6.0,
      warmthEmpathy: 6.5,
      abilityToSimplify: 5.0,
      englishFluency: 6.0,
      confidence: 5.5,
      teachingSuitability: 5.5,
    },
    overallScore: 5.7,
    recommendation: "Maybe",
    strengths: [
      "Shows genuine care for children",
      "Willing to try different teaching methods",
    ],
    concerns: [
      "Explanations were vague and hard to follow",
      "Struggled to provide concrete examples",
      "English fluency needs improvement",
      "Confidence could be stronger",
    ],
    supportingQuotes: [
      {
        quote: "I would try to make it fun and... you know... use different things to help them understand.",
        context: "Explaining fractions to a 9-year-old",
      },
    ],
    interviewerSummary:
      "Anjali shows potential but needs significant development in communication clarity and teaching methodology. Her warmth is genuine but not yet translated into effective teaching behaviors. Consider for a conditional acceptance with mandatory training.",
    transcript: [],
  },
  {
    id: "rpt-004",
    candidateId: "cnd-004",
    candidateName: "Karthik Menon",
    candidateEmail: "karthik.menon@example.com",
    interviewDate: new Date().toISOString(),
    duration: 520,
    scores: {
      communicationClarity: 8.8,
      patience: 9.0,
      warmthEmpathy: 8.5,
      abilityToSimplify: 8.9,
      englishFluency: 9.2,
      confidence: 8.6,
      teachingSuitability: 9.1,
    },
    overallScore: 8.9,
    recommendation: "Strong Yes",
    strengths: [
      "Exceptional patience — gave three different explanations without frustration",
      "Very high English fluency and vocabulary",
      "Strong child psychology understanding",
      "Excellent use of Socratic questioning with children",
    ],
    concerns: [],
    supportingQuotes: [
      {
        quote: "I always tell my students — there's no such thing as a wrong answer, only an incomplete one. Let's complete it together.",
        context: "Handling frustrated and low-confidence students",
      },
    ],
    interviewerSummary:
      "Karthik is an exceptional candidate with a natural gift for teaching. His patience, communication clarity, and child-centric approach are all outstanding. He demonstrated sophisticated understanding of how children learn and feel. Highest recommendation.",
    transcript: [],
  },
];

// Global store (in production, use Redis/Supabase)
const reportStore = new Map<string, EvaluationReport>();
const candidateStore = new Map<string, Candidate>();

// Initialize with demo data
DEMO_REPORTS.forEach((r) => reportStore.set(r.id, r));

export function getAllReports(): EvaluationReport[] {
  return Array.from(reportStore.values()).sort(
    (a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime()
  );
}

export function getReportById(id: string): EvaluationReport | null {
  return reportStore.get(id) || null;
}

export function saveReport(report: EvaluationReport): void {
  reportStore.set(report.id, report);
}

export function getAllCandidates(): Candidate[] {
  return Array.from(candidateStore.values());
}

export function saveCandidate(candidate: Candidate): void {
  candidateStore.set(candidate.id, candidate);
}
