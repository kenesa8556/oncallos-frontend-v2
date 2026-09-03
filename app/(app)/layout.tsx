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

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organization_id, organizations(name, plan)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    // Real state: a signed-in user with no org yet — Day 9 will build org/new.
    // For now, this is an honest, non-crashing fallback rather than a hardcoded org.
    redirect("/org/new");
  }

  const org = membership.organizations as unknown as { name: string; plan: string };

  return (
    <AppShell
      userEmail={user.email ?? ""}
      userRole={membership.role}
      orgId={membership.organization_id}
      orgName={org.name}
      orgPlan={org.plan}
    >
      {children}
    </AppShell>
  );
}