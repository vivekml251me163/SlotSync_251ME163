"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #0D0F24 0%, #0F1121 60%, #0B0C1A 100%)" }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay" />
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" />
      {/* Ambient blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 animate-fade-up">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-8 mx-auto shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <Lock className="h-9 w-9" />
        </div>

        {/* Text */}
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-4">
          403 – Access Denied
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground mb-4">
          Unauthorized
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-10 leading-relaxed mx-auto">
          You do not have permission to view this page. If you believe this is an error, contact your administrator.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#9D72F8] text-white font-semibold px-6 py-2.5 rounded-lg glow-accent transition-all duration-200 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}

