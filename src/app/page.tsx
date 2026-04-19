"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Shield,
  Clock,
  Star,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Brain,
  Heart,
  MessageSquare,
} from "lucide-react";

const PROCESS_STEPS = [
  {
    icon: Mic,
    title: "Speak Naturally",
    desc: "Answer questions using your voice — just like a real phone conversation",
  },
  {
    icon: Brain,
    title: "AI Listens & Adapts",
    desc: "Our AI asks thoughtful follow-up questions based on your responses",
  },
  {
    icon: Heart,
    title: "Show Your Teaching Style",
    desc: "Express your warmth, patience, and approach to helping children learn",
  },
  {
    icon: Star,
    title: "Get Evaluated Fairly",
    desc: "Receive a structured, unbiased assessment delivered to the hiring team",
  },
];

const WHAT_WE_ASSESS = [
  "Communication clarity & English fluency",
  "Patience and emotional regulation",
  "Warmth and empathy with children",
  "Ability to simplify complex topics",
  "Teaching mindset and philosophy",
  "Confidence and professional presence",
];

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = { name: "", email: "" };
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email;
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Short delay for UX
    await new Promise((r) => setTimeout(r, 800));
    const params = new URLSearchParams({
      name: form.name.trim(),
      email: form.email.trim(),
    });
    router.push(`/interview?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-brand-600 top-[-10%] left-[-10%]" />
      <div
        className="orb w-80 h-80 bg-accent-600 bottom-[10%] right-[-5%]"
        style={{ animationDelay: "3s" }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            TutorSense <span className="gradient-text">AI</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Recruiter Login
          </button>
          <div className="flex items-center gap-2 text-sm text-white/50 border-l border-white/10 pl-6">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>Powered by Cuemath Hiring</span>
          </div>
        </motion.div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — hero content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-sm text-brand-300 font-medium">
                AI Screening Active · 2–3 min wait time
              </span>
            </div>

            <h1 className="font-display font-bold text-5xl lg:text-6xl leading-[1.1] mb-6">
              Your AI{" "}
              <span className="gradient-text">Tutor Interview</span>
              <br />
              Starts Here
            </h1>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              TutorSense AI conducts a short, friendly voice conversation to
              understand your teaching style, patience, and passion for helping
              children learn. No typing. Just talk.
            </p>

            {/* Process steps */}
            <div className="space-y-4 mb-10">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-0.5">
                      {step.title}
                    </div>
                    <div className="text-sm text-white/50">{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>8–10 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>Private & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <span>Voice only</span>
              </div>
            </div>
          </motion.div>

          {/* Right — registration form + what we assess */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            {/* Form Card */}
            <div className="card-premium p-8 border-animated">
              <h2 className="font-display font-bold text-2xl text-white mb-2">
                Begin Your Interview
              </h2>
              <p className="text-white/50 text-sm mb-7">
                Enter your details to get started. Your microphone will be
                requested on the next screen.
              </p>

              <form onSubmit={handleStart} className="space-y-5" id="start-interview-form">
                <div>
                  <label
                    htmlFor="candidate-name"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="candidate-name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm ${
                      errors.name
                        ? "border-danger-500/50 focus:ring-danger-500"
                        : "border-white/10"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-danger-500 text-xs mt-1.5"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label
                    htmlFor="candidate-email"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="candidate-email"
                    type="email"
                    placeholder="e.g. priya@gmail.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm ${
                      errors.email
                        ? "border-danger-500/50 focus:ring-danger-500"
                        : "border-white/10"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-danger-500 text-xs mt-1.5"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  id="begin-interview-btn"
                  type="submit"
                  disabled={isLoading}
                  className="btn-glow w-full py-4 rounded-xl bg-gradient-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing Interview...
                    </>
                  ) : (
                    <>
                      Start My Interview
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-white/30">
                  By continuing, you agree to our screening process. Your
                  responses are private and only shared with the hiring team.
                </p>
              </form>
            </div>

            {/* What we assess */}
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-semibold text-white/80 text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                What We Evaluate
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {WHAT_WE_ASSESS.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
