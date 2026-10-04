"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, type RegisterFormInput } from "@/lib/validations";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  ShieldCheck,
  BellRing,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function RegisterPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      role: "STUDENT",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          department: data.department,
          role: data.role,
          password: data.password,
        }),
      });
      const resData = await res.json();
      if (res.status === 409) {
        setErrorMsg("An account with this email already exists.");
      } else if (!res.ok) {
        setErrorMsg(resData.error || "Something went wrong. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  const features = [
    { icon: CalendarCheck, title: "Real-time availability", desc: "Instant slot discovery & collision detection across all campus facilities." },
    { icon: ShieldCheck, title: "Role-based access", desc: "Strict permission guards for Admin, Faculty, Convenor, and Students." },
    { icon: BellRing, title: "Instant notifications", desc: "Automated email reminders and waitlist promotion alerts." },
  ];

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-[#0F1121]">
      {/* ── Left Panel (Desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top left, #0D0F24 0%, #0F1121 60%, #0B0C1A 100%)" }}
        />
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="blob-primary top-[-100px] left-[-200px] opacity-60" />
        <div className="blob-secondary bottom-[10%] right-[-100px]" />
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">SlotSync</span>
        </div>

        <div className="relative z-10 space-y-4 my-auto max-w-sm">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">What you get</p>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
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

        <div className="relative z-10 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SlotSync &middot; NITK Surathkal
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        className="flex items-center justify-center min-h-screen p-6 sm:p-12 overflow-y-auto relative"
        style={{ background: "radial-gradient(ellipse at bottom right, #0d0d1f 0%, #0F1121 60%)" }}
      >
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
        />

        <div className="relative z-10 max-w-md w-full mx-auto py-8 animate-fade-up">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">SlotSync</span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.4)]">
            {isSuccess ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">Account created!</h2>
                  <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                    Your account is ready. Sign in to access the platform.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="w-full bg-[#8B5CF6] hover:bg-[#9D72F8] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 glow-accent"
                >
                  Go to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="mb-7">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
                  <p className="text-muted-foreground text-sm mt-1.5">Join SlotSync at NITK Surathkal</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</Label>
                    <Input id="name" type="text" placeholder="Dr. Rajesh Kumar" tabIndex={1} {...register("name")} />
                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
                    <Input id="email" type="email" placeholder="you@nitk.edu.in" tabIndex={2} {...register("email")} />
                    {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</Label>
                    <Input id="department" type="text" placeholder="Computer Science & Engineering" tabIndex={3} {...register("department")} />
                    {errors.department && <p className="text-xs font-medium text-destructive">{errors.department.message}</p>}
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="role" tabIndex={4} className="w-full">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="FACULTY">Faculty</SelectItem>
                            <SelectItem value="CONVENOR">Convenor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && <p className="text-xs font-medium text-destructive">{errors.role.message}</p>}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PasswordInput id="password" label="Password" tabIndex={5} error={errors.password?.message} {...register("password")} />
                    <PasswordInput id="confirmPassword" label="Confirm Password" tabIndex={6} error={errors.confirmPassword?.message} {...register("confirmPassword")} />
                  </div>

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
                    tabIndex={7}
                    disabled={isSubmitting}
                    className="w-full bg-[#8B5CF6] hover:bg-[#9D72F8] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 glow-accent"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Creating account...</span></>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

