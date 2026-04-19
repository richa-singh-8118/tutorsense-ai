"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Home, BarChart3, Sparkles } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="orb w-72 h-72 bg-success-500 top-10 right-10 opacity-10" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium p-12 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-full bg-success-500/20 border-2 border-success-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success-500" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="text-brand-300 text-sm font-medium">TutorSense AI</span>
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">
          Interview Complete!
        </h1>
        <p className="text-white/60 leading-relaxed mb-8">
          Thank you for completing your interview. Your responses have been recorded
          and our team will review your evaluation shortly. You will receive an email
          confirmation from Cuemath Hiring.
        </p>
        <div className="glass rounded-xl p-4 mb-8 text-sm text-white/50">
          <p>Expected response time: <span className="text-white/70 font-medium">1–2 business days</span></p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            id="go-home-btn"
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold flex items-center justify-center gap-2 btn-glow"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <button
            id="go-dashboard-btn"
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all font-medium flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
