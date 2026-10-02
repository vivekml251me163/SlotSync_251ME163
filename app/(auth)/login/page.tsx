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
    defaultValues: {
      email: "",
      password: "",
    },
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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background font-sans">
      {/* Left Panel (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        {/* Radial dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            SlotSync
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Campus infrastructure, simplified.
          </p>
        </div>

        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Real-time availability
              </p>
              <p className="text-xs text-muted-foreground">
                Instant slot discovery & collision detection across facilities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Role-based access
              </p>
              <p className="text-xs text-muted-foreground">
                Strict permission guards for Admin, Faculty, Convenor, and Students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Instant notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Automated email reminders and waitlist promotion alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} SlotSync Platform. NITK Surathkal.
        </div>
      </div>

      {/* Right Panel (Form Card) */}
      <div className="flex items-center justify-center h-full p-6 sm:p-12">
        <div className="max-w-sm w-full mx-auto bg-card border border-border rounded-2xl p-8 shadow-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your SlotSync account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nitk.edu.in"
                tabIndex={1}
                className="bg-background border-border focus-visible:ring-primary/50"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              id="password"
              label="Password"
              tabIndex={2}
              error={errors.password?.message}
              {...register("password")}
            />

            {errorMsg && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              tabIndex={3}
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
