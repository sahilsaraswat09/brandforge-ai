"use client";

import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Palette,
  Target,
  Rocket,
  Search,
  Type,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [idea, setIdea] = useState(
    "An AI platform that connects students with hackathon teammates based on skill gaps and project ideas."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || loading) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to generate brand system.");
      }

      setData(result);
    } catch (err: any) {
      console.error("BrandForge execution error:", err);
      setError(
        err.message || "AI is temporarily busy. Please try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLaunchKit = () => {
    if (!data) return;

    const summaryText = `
=== BRANDFORGE AI LAUNCH KIT ===

[STAGE 1: DISCOVER]
Problem: ${data.discover?.problem || "N/A"}
Audience: ${data.discover?.audience || "N/A"}
Constraints: ${data.discover?.constraints || "N/A"}

[STAGE 2: POSITION]
Category: ${data.position?.category || "N/A"}
Value Prop: ${data.position?.valueProposition || "N/A"}
USP: ${data.position?.usp || "N/A"}

[STAGE 3: SHAPE - BRAND IDENTITY]
Brand Name: ${data.shape?.brandName || "N/A"}
Tagline: ${data.shape?.tagline || "N/A"}
Personality Traits: ${data.shape?.personalityTraits?.join(", ") || "N/A"}
Brand Voice: ${data.shape?.brandVoice || "N/A"}

[STAGE 4: VISUALIZE]
Primary Color: ${data.visualize?.primaryColorHex || "N/A"}
Secondary Color: ${data.visualize?.secondaryColorHex || "N/A"}
Typography: ${data.visualize?.typography || "N/A"}
Logo Concept: ${data.visualize?.logoConcept || "N/A"}

[STAGE 5: CHALLENGE - ANTI-GENERIC CRITIC AUDIT]
Consistency Score: ${data.critic?.consistencyScore || 0}%
Flagged Cliches: ${data.critic?.detectedCliches?.join(", ") || "None"}
Revised Tagline: ${data.critic?.revisedTagline || "N/A"}
Critic Feedback: ${data.critic?.criticFeedback || "N/A"}

[STAGE 6: DELIVER - LAUNCH COPY]
Headline: ${data.deliver?.landingPageHeadline || "N/A"}
Social Post: ${data.deliver?.socialLaunchPost || "N/A"}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="min-h-screen bg-[#070913] text-slate-100 p-4 sm:p-6 md:p-12 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
            BrandForge AI
          </h1>
        </div>
        <span className="text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-3 py-1 rounded-full font-mono">
          Pre-Hackathon Demo
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-8 px-2">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
          Turn your raw idea into a{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-400">
            launch-ready brand system
          </span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          An intelligent 6-stage brand decision pipeline powered by Gemini with Stage 5 AI Critic verification.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={loading}
            placeholder="e.g., An app for college students to find hackathon teammates."
            className="w-full h-28 bg-[#0e1327] border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running 6-Stage Pipeline...</span>
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                <span>Forge My Brand 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Friendly API Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Execution Error</p>
              <p className="text-xs text-red-300/90 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Animated 6-Step Workflow Loader */}
        {loading && (
          <div className="mt-8 bg-[#0e1327] border border-indigo-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center items-center space-x-2 text-indigo-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <h3 className="font-bold text-white text-base">Forging Brand System Across 6 AI Stages</h3>
            </div>
            <p className="text-xs text-slate-400">
              Executing full pipeline synthesis (Discover → Position → Shape → Visualize → Anti-Generic Audit → Deliver). This may take around 30 to 60 seconds.
            </p>
            
            {/* Stage Progress Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <div className="bg-indigo-950/50 border border-indigo-800/40 p-2 rounded-lg text-indigo-300 animate-pulse">
                1. Discovering Market
              </div>
              <div className="bg-indigo-950/50 border border-indigo-800/40 p-2 rounded-lg text-indigo-300 animate-pulse">
                2. Positioning Strategy
              </div>
              <div className="bg-indigo-950/50 border border-indigo-800/40 p-2 rounded-lg text-indigo-300 animate-pulse">
                3. Shaping Identity
              </div>
              <div className="bg-indigo-950/50 border border-indigo-800/40 p-2 rounded-lg text-indigo-300 animate-pulse">
                4. Visual Briefing
              </div>
              <div className="bg-amber-950/50 border border-amber-800/40 p-2 rounded-lg text-amber-300 animate-pulse">
                5. AI Critic Auditing
              </div>
              <div className="bg-indigo-950/50 border border-indigo-800/40 p-2 rounded-lg text-indigo-300 animate-pulse">
                6. Launch Copywriting
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Dashboard Output */}
      {data && !loading && (
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Generated Brand System</h2>
            <button
              onClick={handleCopyLaunchKit}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg border border-slate-700 transition flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Launch Kit Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Launch Kit</span>
                </>
              )}
            </button>
          </div>

          {/* Stage 1: Discover & Stage 2: Position */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stage 1: Discover */}
            <div className="bg-[#0e1327] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
                <Search className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Stage 1: Discover</h3>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p><strong className="text-slate-400">Target Audience:</strong> {data.discover?.audience}</p>
                <p><strong className="text-slate-400">Core Problem:</strong> {data.discover?.problem}</p>
                <p><strong className="text-slate-400">Constraints:</strong> {data.discover?.constraints}</p>
              </div>
            </div>

            {/* Stage 2: Position */}
            <div className="bg-[#0e1327] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-pink-400 border-b border-slate-800 pb-2">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Stage 2: Position</h3>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p><strong className="text-slate-400">Category:</strong> {data.position?.category}</p>
                <p><strong className="text-slate-400">Value Proposition:</strong> {data.position?.valueProposition}</p>
                <p><strong className="text-slate-400">USP:</strong> {data.position?.usp}</p>
              </div>
            </div>
          </div>

          {/* Stage 3: Shape (Brand Identity) */}
          <div className="bg-[#0e1327] border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block">
              Stage 3: Shape — Brand Identity
            </span>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white">{data.shape?.brandName}</h2>
                <p className="text-pink-400 italic text-sm mt-1">"{data.shape?.tagline}"</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.shape?.personalityTraits?.map((trait: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-indigo-950 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-800/40"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 pt-1">
              <strong className="text-slate-400">Brand Voice:</strong> {data.shape?.brandVoice}
            </p>
          </div>

          {/* Stage 4: Visualize */}
          <div className="bg-[#0e1327] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
              <Palette className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Stage 4: Visualize</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold block">Color Swatches</span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-[#070913] p-1.5 rounded-lg border border-slate-800">
                    <div
                      className="w-6 h-6 rounded-md border border-slate-700"
                      style={{ backgroundColor: data.visualize?.primaryColorHex }}
                    />
                    <span className="font-mono text-xs text-slate-200">{data.visualize?.primaryColorHex}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-[#070913] p-1.5 rounded-lg border border-slate-800">
                    <div
                      className="w-6 h-6 rounded-md border border-slate-700"
                      style={{ backgroundColor: data.visualize?.secondaryColorHex }}
                    />
                    <span className="font-mono text-xs text-slate-200">{data.visualize?.secondaryColorHex}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block flex items-center gap-1">
                  <Type className="w-4 h-4 text-slate-400" /> Typography
                </span>
                <p className="text-slate-200">{data.visualize?.typography}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">Logo Concept</span>
                <p className="text-slate-200">{data.visualize?.logoConcept}</p>
              </div>
            </div>
          </div>

          {/* Stage 5: Challenge — Anti-Generic AI Critic Audit */}
          <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-lg text-white">Stage 5: Challenge — Anti-Generic AI Critic</h3>
              </div>
              <span className="bg-amber-500/20 text-amber-300 font-mono text-sm px-3.5 py-1 rounded-full border border-amber-500/30">
                Consistency Score: {data.critic?.consistencyScore}%
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-[#090d1a] p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-400 text-xs font-bold block">Detected Cliches Flagged & Filtered</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.critic?.detectedCliches?.map((cliche: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs bg-red-950/80 text-red-300 border border-red-800/40 px-2.5 py-1 rounded-md"
                    >
                      ❌ {cliche}
                    </span>
                  ))}
                </div>
                {data.critic?.revisedTagline && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-xs font-semibold">Refined Tagline:</span>
                    <p className="text-emerald-400 text-xs italic mt-0.5">"{data.critic?.revisedTagline}"</p>
                  </div>
                )}
              </div>

              <div className="bg-[#090d1a] p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 text-xs font-bold block">Critic Feedback</span>
                <p className="text-slate-300 text-xs leading-relaxed pt-1">
                  {data.critic?.criticFeedback}
                </p>
              </div>
            </div>
          </div>

          {/* Stage 6: Deliver */}
          <div className="bg-[#0e1327] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
              <Layers className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Stage 6: Deliver (Launch Copy)</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <p>
                <strong className="text-slate-400 block mb-1">Landing Page Headline:</strong>
                <span className="text-white font-medium text-base">{data.deliver?.landingPageHeadline}</span>
              </p>
              <div>
                <strong className="text-slate-400 block mb-1">Social Launch Announcement:</strong>
                <div className="bg-[#070913] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                  {data.deliver?.socialLaunchPost}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}