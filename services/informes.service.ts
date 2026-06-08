import { supabase } from "./supabaseClient";

export type TarjetasGenerales = {
  total_decomisos: number;
  activos: number;
  liberados: number;
  total_recaudado: number;
};

export type TarjetaPorTipo = {
  tipo_vehiculo: string;
  total: number;
  activos: number;
  liberados: number;
  recaudado: number;
};

export type InformeDecomiso = {
  decomiso_id: string | null;
  placa: string;
  propietario: string;
  identidad: string;
  tipo_vehiculo: string;
  fecha_ingreso: string | null;
  fecha_liberacion: string | null;
  estado: string;
  dias: number;
  tarifa_dia: number;
  monto: number;
};

export async function obtenerTarjetasGenerales(): Promise<TarjetasGenerales> {
  const { data, error } = await supabase.rpc("informe_tarjetas_generales");

  if (error) {
    throw new Error(error.message);
  }

  const fila = data?.[0];

  return {
    total_decomisos: Number(fila?.total_decomisos ?? 0),
    activos: Number(fila?.activos ?? 0),
    liberados: Number(fila?.liberados ?? 0),
    total_recaudado: Number(fila?.total_recaudado ?? 0),
  };
}

export async function obtenerTarjetasPorTipo(): Promise<TarjetaPorTipo[]> {
  const { data, error } = await supabase.rpc("informe_tarjetas_por_tipo");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: TarjetaPorTipo) => ({
    tipo_vehiculo: item.tipo_vehiculo,
    total: Number(item.total ?? 0),
    activos: Number(item.activos ?? 0),
    liberados: Number(item.liberados ?? 0),
    recaudado: Number(item.recaudado ?? 0),
  }));
}

export async function obtenerInformeDecomisos(): Promise<InformeDecomiso[]> {
  const { data, error } = await supabase.rpc("informe_decomisos");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: InformeDecomiso) => ({
    decomiso_id: item.decomiso_id,
    placa: item.placa,
    propietario: item.propietario,
    identidad: item.identidad,
    tipo_vehiculo: item.tipo_vehiculo,
    fecha_ingreso: item.fecha_ingreso,
    fecha_liberacion: item.fecha_liberacion,
    estado: item.estado,
    dias: Number(item.dias ?? 0),
    tarifa_dia: Number(item.tarifa_dia ?? 0),
    monto: Number(item.monto ?? 0),
  }));
}