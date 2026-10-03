import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
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

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token exists
  if (!token) {
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

  const userRole = (token.role as string) || "";

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
