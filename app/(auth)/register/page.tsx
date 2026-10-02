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

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-background font-sans">
      {/* Left Panel (Desktop only - Identical to Login) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
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

      {/* Right Panel (Form / Success Card) */}
      <div className="flex items-center justify-center h-full p-6 sm:p-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto bg-card border border-border rounded-2xl p-8 shadow-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500 my-auto">
          {isSuccess ? (
            /* Success Panel */
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Account created!
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Your account is ready. Sign in to continue.
              </p>
              <Link
                href="/login"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            /* Form Panel */
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Create your account
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Join SlotSync at NITK
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Rajesh Kumar"
                    tabIndex={1}
                    className="bg-background border-border focus-visible:ring-primary/50"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@nitk.edu.in"
                    tabIndex={2}
                    className="bg-background border-border focus-visible:ring-primary/50"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Computer Science & Engineering"
                    tabIndex={3}
                    className="bg-background border-border focus-visible:ring-primary/50"
                    {...register("department")}
                  />
                  {errors.department && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Role Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="role"
                          tabIndex={4}
                          className="w-full bg-background border-border focus:ring-primary/50"
                        >
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
                  {errors.role && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password (2-column on sm:) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordInput
                    id="password"
                    label="Password"
                    tabIndex={5}
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  <PasswordInput
                    id="confirmPassword"
                    label="Confirm Password"
                    tabIndex={6}
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  tabIndex={7}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline transition-all"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
