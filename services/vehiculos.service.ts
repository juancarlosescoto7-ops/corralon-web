import { supabase } from "./supabaseClient";

export type Vehiculo = {
  id: string;
  placa: string;
  marca: string;
  tipo_vehiculo: "MOTOCICLETA" | "AUTOMOVIL" | "CAMION";
  propietario?: string;
};

export async function crearVehiculo(
  propietarioId: string,
  placa: string,
  marca: string,
  tipoVehiculo: string
): Promise<string> {
  const { data, error } = await supabase.rpc("crear_vehiculo", {
    p_propietario_id: propietarioId,
    p_placa: placa,
    p_marca: marca,
    p_tipo_vehiculo: tipoVehiculo,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function listarVehiculos(): Promise<Vehiculo[]> {
  const { data, error } = await supabase.rpc("listar_vehiculos");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Vehiculo[];
}