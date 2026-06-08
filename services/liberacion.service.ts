import { supabase } from "./supabaseClient";

export async function liberarDecomiso(decomisoId: string): Promise<number> {
  const { data, error } = await supabase.rpc("liberar_decomiso", {
    p_decomiso_id: decomisoId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Number(data ?? 0);
}