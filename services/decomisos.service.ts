import { supabase } from "./supabaseClient";

export type DecomisoActivo = {
  id: string;
  placa: string;
  fecha_ingreso: string;
  tarifa: number;
};

export async function crearDecomiso(
  vehiculoId: string
): Promise<string> {
  const { data, error } = await supabase.rpc("crear_decomiso", {
    p_vehiculo_id: vehiculoId,
    p_fecha_ingreso: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function listarDecomisosActivos(): Promise<DecomisoActivo[]> {
  const { data, error } = await supabase.rpc("listar_decomisos");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DecomisoActivo[];
}