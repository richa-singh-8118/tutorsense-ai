// Core domain types for TutorSense AI

export interface TranscriptEntry {
  id: string;
  speaker: "ai" | "candidate";
  text: string;
  timestamp: number;
  audioUrl?: string;
}

export interface InterviewScores {
  communicationClarity: number;
  patience: number;
  warmthEmpathy: number;
  abilityToSimplify: number;
  englishFluency: number;
  confidence: number;
  teachingSuitability: number;
}

export type Recommendation = "Strong Yes" | "Yes" | "Maybe" | "No";

export interface EvaluationReport {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewDate: string;
  duration: number; // seconds
  scores: InterviewScores;
  overallScore: number;
  persona?: string;
  recommendation: Recommendation;
  strengths: string[];
  concerns: string[];
  supportingQuotes: { quote: string; context: string; insight?: string }[];
  interviewerSummary: string;
  biasCheck?: string;
  transcript: TranscriptEntry[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  appliedRole: string;
  status: "pending" | "completed" | "in_progress";
  reportId?: string;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: "warmup" | "teaching" | "patience" | "empathy" | "simplification" | "scenario";
  followUps: string[];
  evaluationFocus: string[];
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  status: "waiting" | "active" | "paused" | "completed";
  startTime: number;
  currentQuestionIndex: number;
  transcript: TranscriptEntry[];
  scores?: Partial<InterviewScores>;
}
