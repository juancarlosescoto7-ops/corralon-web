import { supabase } from "./supabaseClient";

export type VehiculoOperacion = {
  vehiculo_id: string;
  placa: string;
  marca: string;
  tipo_vehiculo: string;
  propietario: string;
  identidad: string;
  estado_operativo: "LIBRE" | "ACTIVO";
  decomiso_id: string | null;
  fecha_ingreso: string | null;
  tarifa: number;
  dias: number;
  monto_estimado: number;
};

export async function listarOperacionVehiculos(): Promise<VehiculoOperacion[]> {
  const { data, error } = await supabase.rpc("operacion_vehiculos");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: VehiculoOperacion) => ({
    vehiculo_id: item.vehiculo_id,
    placa: item.placa,
    marca: item.marca,
    tipo_vehiculo: item.tipo_vehiculo,
    propietario: item.propietario,
    identidad: item.identidad,
    estado_operativo: item.estado_operativo,
    decomiso_id: item.decomiso_id,
    fecha_ingreso: item.fecha_ingreso,
    tarifa: Number(item.tarifa ?? 0),
    dias: Number(item.dias ?? 0),
    monto_estimado: Number(item.monto_estimado ?? 0),
  }));
}