import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AppShell from "../components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get ALL of this user's org memberships, not just one
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("role, organization_id, organizations(name, plan)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!memberships || memberships.length === 0) {
    redirect("/org/new");
  }

  const activeOrgIdCookie = cookieStore.get("active_org_id")?.value;
  const activeMembership =
    memberships.find((m) => m.organization_id === activeOrgIdCookie) ?? memberships[0];

  const org = activeMembership.organizations as unknown as { name: string; plan: string };
  const orgList = memberships.map((m) => ({
    id: m.organization_id,
    name: (m.organizations as unknown as { name: string }).name,
  }));

  return (
    <AppShell
      userEmail={user.email ?? ""}
      userRole={activeMembership.role}
      orgId={activeMembership.organization_id}
      orgName={org.name}
      orgPlan={org.plan}
      orgList={orgList}
    >
      {children}
    </AppShell>
  );
}