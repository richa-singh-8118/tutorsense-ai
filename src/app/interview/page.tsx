"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Clock, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { TranscriptEntry } from "@/types";

type InterviewPhase = "setup" | "active" | "thinking" | "speaking" | "complete";

// Voice bars animation component
function VoiceBars({ active }: { active: boolean }) {
  const heights = [40, 70, 55, 85, 60, 75, 45, 90, 65, 50];
  return (
    <div className="flex items-center gap-[3px] h-16 px-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${active ? "bg-gradient-to-t from-brand-500 to-accent-400 shadow-[0_0_8px_rgba(217,70,239,0.5)]" : "bg-white/10"}`}
          style={{
            height: active ? `${h}%` : "15%",
            animation: active ? `wave 1s ease-in-out ${i * 0.08}s infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
}

// Circular timer
function CircularTimer({ elapsed, total }: { elapsed: number; total: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(elapsed / total, 1);
  const offset = circ * (1 - progress);
  const pct = Math.round(progress * 100);
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={progress > 0.85 ? "#f43f5e" : "#6366f1"}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="text-center">
        <div className="font-display font-bold text-2xl text-white">{formatDuration(elapsed)}</div>
        <div className="text-xs text-white/40">{pct}%</div>
      </div>
    </div>
  );
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "Candidate";
  const email = searchParams.get("email") || "";

  const [phase, setPhase] = useState<InterviewPhase>("setup");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentAiText, setCurrentAiText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const questionIndexRef = useRef(0);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const messagesRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const TOTAL_DURATION = 600; // 10 minutes

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, liveText]);

  // Timer
  useEffect(() => {
    if (phase === "active" || phase === "thinking" || phase === "speaking") {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Auto-complete after 10 mins
  useEffect(() => {
    if (elapsed >= TOTAL_DURATION && phase !== "complete") {
      handleEndInterview();
    }
  }, [elapsed]);

  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    // Prefer a natural female voice
    const voices = synth.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Google US English") || v.name.includes("en-US")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { if (onDone) onDone(); };
    setPhase("speaking");
    synth.speak(utterance);
  }, []);

  const sendToAI = useCallback(async (userMessage: string) => {
    setPhase("thinking");
    const newMessages = [...messagesRef.current, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    messagesRef.current = newMessages;

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, questionIndex: questionIndexRef.current, candidateName: name }),
      });
      const data = await res.json();
      const aiReply = data.reply || "Could you elaborate on that a bit more?";

      const updatedMessages = [...newMessages, { role: "assistant" as const, content: aiReply }];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
      
      setCurrentAiText(aiReply);
      setTranscript((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, speaker: "ai", text: aiReply, timestamp: Date.now() },
      ]);

      if (data.questionIndex !== undefined) {
        setQuestionIndex(data.questionIndex);
        questionIndexRef.current = data.questionIndex;
      }
      
      if (data.isComplete) {
        speakText(aiReply, () => setTimeout(handleEndInterview, 1500));
      } else {
        speakText(aiReply, startListening);
      }
    } catch {
      setError("Connection issue. Please check your internet and try again.");
      setPhase("active");
    }
  }, [name, speakText]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => { setIsListening(true); setPhase("active"); setLiveText(""); };
    rec.onresult = (e) => {
      retryCountRef.current = 0; // successful speech — reset retry counter
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const newText = final || interim;
      liveTextRef.current = newText;
      setLiveText(newText);
    };
    rec.onend = () => {
      setIsListening(false);
      const spoken = liveTextRef.current.trim();
      if (spoken.length > 2) {
        setTranscript((prev) => [
          ...prev,
          { id: `cnd-${Date.now()}`, speaker: "candidate", text: spoken, timestamp: Date.now() },
        ]);
        setLiveText("");
        sendToAI(spoken);
      } else {
        setPhase("active");
      }
    };
    rec.onerror = (e) => {
      // Transient errors — silently ignore and stay in active phase
      const transient = ["aborted", "audio-capture", "no-speech"];
      if (transient.includes(e.error)) {
        setIsListening(false);
        setPhase("active");
        // Auto-retry on no-speech if we haven't exceeded limit
        if (e.error === "no-speech" && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          setTimeout(() => startListening(), 500);
        } else {
          retryCountRef.current = 0;
        }
        return;
      }
      // Genuine errors — show feedback
      setIsListening(false);
      setPhase("active");
      retryCountRef.current = 0;
      const msg =
        e.error === "not-allowed"
          ? "Microphone access was denied. Please allow microphone access in your browser settings."
          : e.error === "network"
          ? "Network error with speech service. Please check your connection."
          : "Microphone issue. Click the mic icon to try again.";
      setError(msg);
      // Auto-clear the error after 5 seconds
      setTimeout(() => setError(""), 5000);
    };
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // Already started — ignore
    }
  }, [sendToAI]);

  // Ref for latest liveText inside callback
  const liveTextRef = useRef("");
  useEffect(() => { liveTextRef.current = liveText; }, [liveText]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAllowed(true);
    } catch {
      setMicAllowed(false);
      setError("Microphone access denied. Please allow microphone access and reload.");
    }
  };

  const handleStartInterview = async () => {
    await requestMic();
    setPhase("thinking");
    const greeting = `Hi ${name}! I'm Maya, your AI interviewer today. This is a friendly conversation — there are no wrong answers, just be yourself. We'll talk for about 8 to 10 minutes about your teaching experience and approach. Ready? Let's start with a simple one — can you tell me a little about yourself and what draws you to teaching children?`;
    setCurrentAiText(greeting);
    setTranscript([{ id: "ai-0", speaker: "ai", text: greeting, timestamp: Date.now() }]);
    
    const initialMessages = [{ role: "assistant" as const, content: greeting }];
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
    
    speakText(greeting, startListening);
  };

  const handleEndInterview = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setPhase("complete");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, candidateName: name, candidateEmail: email, duration: elapsed }),
      });
      const data = await res.json();
      if (data.report) {
        setTimeout(() => router.push(`/report/${data.report.id}`), 2000);
      }
    } catch {
      setTimeout(() => router.push("/complete"), 2000);
    }
  };

  // Setup screen
  if (phase === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="mesh-bg mesh-breathe"></div>
        <div className="orb w-96 h-96 bg-brand-600/30 top-[-10%] left-[-10%]" />
        <div className="orb w-80 h-80 bg-accent-600/20 bottom-[-5%] right-[-5%]" style={{ animationDelay: "2s" }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card-premium p-10 max-w-lg w-full text-center border-animated z-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            Hi {name}! 👋
          </h1>
          <p className="text-white/60 mb-8 leading-relaxed text-sm">
            You&apos;re about to begin your AI-powered tutor interview with Maya. This conversation helps us understand your teaching style and approach.
          </p>

          <div className="space-y-4 text-left mb-8 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${micAllowed ? "bg-success-500/20 text-success-500" : "bg-white/10 text-white/30"}`}>
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Microphone Check</div>
                <div className="text-xs text-white/40">{micAllowed ? "Mic is ready" : "Permission needed to talk to Maya"}</div>
              </div>
              {!micAllowed && (
                <button 
                  onClick={requestMic}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 underline"
                >
                  Enable
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Interview Duration</div>
                <div className="text-xs text-white/40">Approximately 8 to 10 minutes</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Pro-Tips for Candidates</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Use headphones for the best audio experience",
                "Speak as if you're teaching a real student",
                "Don't worry about being perfect — be authentic",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/3 p-2.5 rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5 text-success-500 flex-shrink-0" />
                  <span className="text-xs text-white/60">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="start-voice-interview-btn"
            onClick={handleStartInterview}
            className="btn-glow w-full py-4 rounded-xl bg-gradient-brand text-white font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start My Interview
          </button>
          
          <p className="mt-4 text-[10px] text-white/20 uppercase tracking-tighter">
            Secure & Private · Evaluation for Cuemath Hiring Team
          </p>
        </motion.div>
      </div>
    );
  }

  // Complete screen
  if (phase === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-premium p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-3">Interview Complete!</h2>
          <p className="text-white/60 mb-4">
            Thank you {name}. Your responses are being analyzed. Generating your evaluation report...
          </p>
          <div className="flex items-center justify-center gap-2 text-brand-400 text-sm">
            <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
            Redirecting to your report...
          </div>
        </motion.div>
      </div>
    );
  }

  // Active interview UI
  const phaseLabel = {
    thinking: "AI is thinking...",
    speaking: "Maya is speaking",
    active: isListening ? "Listening to you..." : "Your turn to speak",
  }[phase as string] || "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="glass border-b border-white/8 px-6 py-4 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold text-white">TutorSense AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-white/60">
            <Volume2 className="w-3 h-3 text-brand-400" />
            Interview in progress
          </div>
          <button
            id="end-interview-btn"
            onClick={handleEndInterview}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            End Interview
          </button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-0 relative">
        {/* Main interview area */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 gap-8">
          {/* AI avatar + timer */}
          <div className="flex items-center gap-8">
            <CircularTimer elapsed={elapsed} total={TOTAL_DURATION} />
            {/* Maya avatar */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-gradient-to-br from-brand-500 to-accent-500 transition-all duration-500 ${phase === "speaking" ? "border-brand-400 shadow-glow" : "border-white/10"}`}>
                <span className="text-5xl">🤖</span>
              </div>
              {phase === "speaking" && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-brand-400 pulse-ring" />
                  <div className="absolute inset-0 rounded-full border-4 border-brand-400 pulse-ring" style={{ animationDelay: "0.5s" }} />
                </>
              )}
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-surface ${phase === "speaking" ? "bg-success-500" : phase === "thinking" ? "bg-warning-500" : "bg-white/30"}`} />
            </div>
            {/* Status */}
            <div className="text-center">
              <div className="font-display font-semibold text-white text-lg mb-1">Maya</div>
              <div className="text-sm text-white/50">AI Interviewer</div>
              <div className={`mt-2 text-xs font-medium px-3 py-1 rounded-full ${phase === "speaking" ? "badge-brand" : phase === "thinking" ? "bg-warning-500/10 text-warning-500 border border-warning-500/20 rounded-full px-3 py-1 text-xs font-semibold" : "badge-success"}`}>
                {phaseLabel}
              </div>
            </div>
          </div>

          {/* Current AI text */}
          <div className="h-28 flex items-center justify-center w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {currentAiText && (
                <motion.div
                  key={currentAiText}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="glass-strong rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(99,102,241,0.1)] relative"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white/10" />
                  <p className="text-white/90 leading-relaxed text-base font-medium">{currentAiText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="relative group">
              <button
                id="mic-toggle-btn"
                onClick={isListening ? stopListening : startListening}
                disabled={phase === "thinking" || phase === "speaking"}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 z-10 relative shadow-xl ${
                  isListening
                    ? "bg-gradient-to-br from-danger-500 to-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.6)] scale-110"
                    : phase === "active"
                    ? "bg-gradient-brand shadow-glow hover:scale-105"
                    : "bg-white/5 border border-white/10 cursor-not-allowed text-white/30"
                }`}
              >
                {isListening ? <MicOff className="w-10 h-10 text-white drop-shadow-md" /> : <Mic className={`w-10 h-10 ${phase === "active" ? "text-white" : "text-white/30"}`} />}
              </button>
              
              {isListening && (
                <>
                  <div className="ring-expand" />
                  <div className="ring-expand" />
                  <div className="ring-expand" />
                </>
              )}
            </div>
            <VoiceBars active={isListening} />
            {liveText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/60 italic max-w-xs text-center"
              >
                &ldquo;{liveText}&rdquo;
              </motion.div>
            )}
            <p className="text-xs text-white/30 text-center">
              {isListening ? "Click to stop when done speaking" : phase === "active" ? "Click mic to speak your answer" : "Please wait..."}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm max-w-md"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
                <button onClick={() => setError("")} className="ml-auto text-danger-500/60 hover:text-danger-500">✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transcript sidebar */}
        <div className="border-l border-white/8 flex flex-col">
          <div className="px-5 py-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium text-white/70">Live Transcript</span>
            </div>
          </div>
          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[70vh]">
            <AnimatePresence>
              {transcript.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${entry.speaker === "candidate" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${entry.speaker === "ai" ? "bg-brand-500/20 border border-brand-500/30" : "bg-accent-500/20 border border-accent-500/30"}`}>
                    {entry.speaker === "ai" ? "🤖" : "🧑"}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${entry.speaker === "ai" ? "bg-brand-500/10 text-white/80 border border-brand-500/15" : "bg-white/5 text-white/70 border border-white/10"}`}>
                    {entry.text}
                  </div>
                </motion.div>
              ))}
              {liveText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 flex-row-reverse"
                >
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm bg-accent-500/20 border border-accent-500/30">🧑</div>
                  <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-white/5 text-white/50 border border-white/10 italic">
                    {liveText}...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {transcript.length === 0 && (
              <div className="text-center text-white/25 text-sm pt-8">
                Conversation will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Loading interview...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
