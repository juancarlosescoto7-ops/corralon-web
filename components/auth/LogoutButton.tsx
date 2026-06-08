"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="h-8 border border-[#cfd4dc] bg-white px-3 text-[12px] text-[#374151] transition hover:bg-[#f3f4f6]"
    >
      Salir
    </button>
  );
}