import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {children}
    </div>
  );
}
