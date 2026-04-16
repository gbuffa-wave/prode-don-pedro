import { createServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const supabase = await createServerSupabase();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return <Navbar user={null} />;
  }

  const { data: appUser } = await getAdminClient()
    .from("app_users")
    .select("role, display_name, avatar_url")
    .eq("id", authUser.id)
    .single();

  const navUser = {
    name: authUser.user_metadata?.full_name || appUser?.display_name || null,
    avatar: authUser.user_metadata?.avatar_url || appUser?.avatar_url || null,
    isAdmin: appUser?.role === "admin",
  };

  return <Navbar user={navUser} />;
}
