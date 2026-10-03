import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logout berhasil" });
  response.cookies.set("ortu_session", "", {
    path: "/",
    expires: new Date(0),
  });
  return response;
}
