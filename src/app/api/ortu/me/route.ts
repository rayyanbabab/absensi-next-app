import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAkunOrangTuaById, getSiswaList } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ortu_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null, linkedSiswa: [] });
    }

    const session = JSON.parse(sessionCookie.value);
    const freshAkun = await getAkunOrangTuaById(session.id);
    if (!freshAkun) {
      return NextResponse.json({ user: null, linkedSiswa: [] });
    }

    const allSiswa = await getSiswaList();
    const linkedSiswa = allSiswa.filter((s) => (freshAkun.idSiswaList || []).includes(s.id));

    return NextResponse.json({
      user: {
        id: freshAkun.id,
        username: freshAkun.username,
        namaOrangTua: freshAkun.namaOrangTua,
        noHp: freshAkun.noHp,
        email: freshAkun.email,
        idSiswaList: freshAkun.idSiswaList,
        role: "orang_tua",
      },
      linkedSiswa,
    });
  } catch {
    return NextResponse.json({ user: null, linkedSiswa: [] });
  }
}
