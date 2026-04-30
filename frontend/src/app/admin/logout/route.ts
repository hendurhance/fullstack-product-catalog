import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  response.cookies.set("admin_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
