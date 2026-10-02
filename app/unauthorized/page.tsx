"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <Lock className="h-8 w-8" />
      </div>

      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-3">
        Access Denied
      </h1>

      <p className="font-sans text-sm text-muted-foreground max-w-md mb-8">
        You do not have permission or role privileges to view this page. If you believe this is an error, please contact your administrator.
      </p>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Go Back
      </button>
    </div>
  );
}
