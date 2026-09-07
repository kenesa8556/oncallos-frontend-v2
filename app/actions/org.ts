"use server";

import { cookies } from "next/headers";

export async function setActiveOrg(orgId: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_org_id", orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}