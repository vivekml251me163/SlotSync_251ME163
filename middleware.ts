import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth API routes, static assets, and images
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = pathname === "/login" || pathname === "/register" || pathname === "/unauthorized";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is unauthenticated and attempting to access a protected route
  if (!token) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is authenticated and attempting to access login/register
  if (isPublicRoute && (pathname === "/login" || pathname === "/register")) {
    const role = token.role as string;
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role === "FACULTY" || role === "CONVENOR") {
      return NextResponse.redirect(new URL("/faculty", req.url));
    }
    return NextResponse.redirect(new URL("/student", req.url));
  }

  const userRole = (token.role as string) || "STUDENT";

  // Route prefix guards
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else if (pathname.startsWith("/faculty")) {
    if (userRole !== "FACULTY" && userRole !== "CONVENOR" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else if (pathname.startsWith("/student")) {
    // /student/* is accessible by any authenticated user
    if (!token) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
