"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Shield, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate auth check
    // In a real app, this would be an API call to Clerk or Supabase
    await new Promise((r) => setTimeout(r, 800));

    if (password === "admin123") { // Demo password
      localStorage.setItem("tsa_auth", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid recruiter access key");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="mesh-bg" />
      <div className="orb w-96 h-96 bg-brand-600 top-[-10%] left-[-10%]" />
      <div className="orb w-80 h-80 bg-accent-600 bottom-[-5%] right-[-5%]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-10 max-w-md w-full border-animated z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-white mb-2">Recruiter Portal</h1>
          <p className="text-white/50 text-sm">Enter your access key to view candidate evaluations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                required
              />
            </div>
            {error && <p className="text-danger-500 text-xs mt-1 ml-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-glow w-full py-4 rounded-xl bg-gradient-brand text-white font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 mb-4">
            Authorized access only. All activities are logged.
          </p>
          <div className="flex items-center justify-center gap-2 text-brand-400">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-medium">Powered by TutorSense AI</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
