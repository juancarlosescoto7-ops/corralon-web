import { supabase } from "./supabaseClient";

export type Propietario = {
  id: string;
  nombre: string;
  identidad: string;
};

export async function crearPropietario(
  nombre: string,
  identidad: string
): Promise<string> {
  const { data, error } = await supabase.rpc("crear_propietario", {
    p_nombre: nombre,
    p_identidad: identidad,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function listarPropietarios(): Promise<Propietario[]> {
  const { data, error } = await supabase.rpc("listar_propietarios");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Propietario[];
}