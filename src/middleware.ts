import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

// Protect all routes under /admin, /leaves, /timesheets, and the root / dashboard
const protectedRoutes = ["/", "/timesheets", "/leaves", "/admin/leaves"];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isProtectedRoute = protectedRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
    );

    if (!isLoggedIn && isProtectedRoute) {
        if (nextUrl.pathname === "/login") {
            return; // already on login page
        }
        const redirectUrl = new URL("/login", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect users who are already logged in away from the login page
    if (isLoggedIn && nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    // Optional: Role-based protection for /admin
    if (isLoggedIn && nextUrl.pathname.startsWith("/admin")) {
        const userRole = (req.auth?.user as any)?.role;
        if (userRole !== "ADMIN" && userRole !== "MANAGER") {
            // Redirect standard employees trying to access admin routes
            return NextResponse.redirect(new URL("/", nextUrl.origin));
        }
    }

    return;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
