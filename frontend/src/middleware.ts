import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || "";

  const url = req.nextUrl;

  if (token && (url.pathname.startsWith("/SignIn") || url.pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/SignIn", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/", "/SignIn", "/dashboard"],
};
