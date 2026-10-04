import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

async function handler(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Inngest needs to access this endpoint without user authentication
  if (pathname.startsWith("/api/inngest")) {
    return NextResponse.next();
  }

  // Public routes (no auth needed)
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // `auth` augments the request with `req.auth`. Support both shapes
  // (user or token) for compatibility.
  const authData: any = (req as any).auth ?? null;
  const sessionOrToken = authData?.user ?? authData?.token ?? authData ?? null;

  // If no session/token exists
  if (!sessionOrToken) {
    // API routes return 401 JSON response instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // API routes: role check is deferred to requireRole() per-route
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const userRole = (sessionOrToken.role as string) || "";

  // Prefix-based role guards
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else if (pathname.startsWith("/faculty")) {
    if (!["FACULTY", "CONVENOR", "ADMIN"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else if (pathname.startsWith("/student")) {
    // Any authenticated user passes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export default auth(handler);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
