"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormInput } from "@/lib/validations";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarCheck,
  ShieldCheck,
  BellRing,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormInput) => {
    setErrorMsg(null);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setErrorMsg("Invalid email or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  const features = [
    {
      icon: CalendarCheck,
      title: "Real-time availability",
      desc: "Instant slot discovery & collision detection across all campus facilities.",
    },
    {
      icon: ShieldCheck,
      title: "Role-based access",
      desc: "Strict permission guards for Admin, Faculty, Convenor, and Students.",
    },
    {
      icon: BellRing,
      title: "Instant notifications",
      desc: "Automated email reminders and waitlist promotion alerts.",
    },
  ];

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-[#0F1121]">
      {/* ── Left Panel (Desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        {/* Layered background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top left, #0D0F24 0%, #0F1121 60%, #0B0C1A 100%)",
          }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay" />
        {/* Noise */}
        <div className="absolute inset-0 noise-overlay" />
        {/* Ambient blobs */}
        <div className="blob-primary top-[-100px] left-[-200px] opacity-60" />
        <div className="blob-secondary bottom-[10%] right-[-100px]" />
        {/* Right-edge gradient separator */}
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            SlotSync
          </span>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4 my-auto max-w-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
            What you get
          </p>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SlotSync &middot; NITK Surathkal
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div
        className="flex items-center justify-center min-h-screen p-6 sm:p-12 relative"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, #0d0d1f 0%, #0F1121 60%)",
        }}
      >
        {/* Subtle blob */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div className="relative z-10 max-w-sm w-full mx-auto animate-fade-up">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">SlotSync</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="mb-7">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                Sign in to your SlotSync account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@nitk.edu.in"
                  tabIndex={1}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <PasswordInput
                id="password"
                label="Password"
                tabIndex={2}
                error={errors.password?.message}
                {...register("password")}
              />

              {/* Error */}
              {errorMsg && (
                <div className="flex items-center gap-2.5 bg-destructive/[0.08] border border-destructive/25 text-destructive/90 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                tabIndex={3}
                disabled={isSubmitting}
                className="w-full bg-[#8B5CF6] hover:bg-[#9D72F8] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 glow-accent"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

