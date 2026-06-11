"use client";

import { useEffect, useMemo, useState } from "react";
import {
  obtenerInformeDecomisos,
  obtenerTarjetasGenerales,
  obtenerTarjetasPorTipo,
  InformeDecomiso,
  TarjetasGenerales,
  TarjetaPorTipo,
} from "@/services/informes.service";

function formatoMoneda(valor: number) {
  return `L ${Number(valor ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatoNumero(valor: number) {
  return Number(valor ?? 0).toLocaleString("es-HN");
}

function formatoFecha(fecha: string | null) {
  if (!fecha) return "—";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString("es-HN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function estadoClase(estado: string) {
  if (estado === "ACTIVO") {
    return "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]";
  }

  if (estado === "LIBERADO") {
    return "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]";
  }

  return "bg-[#f3f4f6] text-[#4b5563] border-[#d9dde3]";
}

export default function InformesView() {
  const [montado, setMontado] = useState(false);

  const [tarjetasGenerales, setTarjetasGenerales] =
    useState<TarjetasGenerales>({
      total_decomisos: 0,
      activos: 0,
      liberados: 0,
      total_recaudado: 0,
    });

  const [tarjetasPorTipo, setTarjetasPorTipo] = useState<TarjetaPorTipo[]>([]);
  const [decomisos, setDecomisos] = useState<InformeDecomiso[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setMontado(true);
  }, []);

  async function cargarInformes() {
    try {
      setCargando(true);
      setMensaje("");

      const [generales, porTipo, informe] = await Promise.all([
        obtenerTarjetasGenerales(),
        obtenerTarjetasPorTipo(),
        obtenerInformeDecomisos(),
      ]);

      setTarjetasGenerales(generales);
      setTarjetasPorTipo(porTipo);
      setDecomisos(informe);
    } catch (error) {
      setMensaje(
        error instanceof Error ? error.message : "Error al cargar informes"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (montado) {
      cargarInformes();
    }
  }, [montado]);

  const decomisosFiltrados = useMemo(() => {
    const filtro = busqueda.toLowerCase();

    return decomisos.filter((item) => {
      const coincideEstado =
        estadoFiltro === "TODOS" || item.estado === estadoFiltro;

      const texto = `${item.placa} ${item.propietario} ${item.identidad} ${item.tipo_vehiculo} ${item.estado}`.toLowerCase();

      return coincideEstado && texto.includes(filtro);
    });
  }, [decomisos, busqueda, estadoFiltro]);

  if (!montado) {
    return (
      <section className="border border-[#d9dde3] bg-white px-4 py-6">
        <p className="text-[12px] text-[#6b7280]">
          Cargando módulo de informes...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* INDICADORES GENERALES */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="border border-[#d9dde3] bg-white px-3 py-3 sm:px-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6b7280] sm:text-[11px]">
            Total decomisos
          </p>
          <p className="mt-1 text-[18px] font-semibold tracking-tight text-[#111827] sm:text-[22px]">
            {formatoNumero(tarjetasGenerales.total_decomisos)}
          </p>
        </div>

        <div className="border border-[#d9dde3] bg-white px-3 py-3 sm:px-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6b7280] sm:text-[11px]">
            Activos
          </p>
          <p className="mt-1 text-[18px] font-semibold tracking-tight text-[#9a3412] sm:text-[22px]">
            {formatoNumero(tarjetasGenerales.activos)}
          </p>
        </div>

        <div className="border border-[#d9dde3] bg-white px-3 py-3 sm:px-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6b7280] sm:text-[11px]">
            Liberados
          </p>
          <p className="mt-1 text-[18px] font-semibold tracking-tight text-[#047857] sm:text-[22px]">
            {formatoNumero(tarjetasGenerales.liberados)}
          </p>
        </div>

        <div className="border border-[#d9dde3] bg-white px-3 py-3 sm:px-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6b7280] sm:text-[11px]">
            Recaudado
          </p>
          <p className="mt-1 text-[16px] font-semibold tracking-tight text-[#111827] sm:text-[22px]">
            {formatoMoneda(tarjetasGenerales.total_recaudado)}
          </p>
        </div>
      </div>

      {/* RESUMEN POR TIPO */}
      <div className="border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-3 py-3 sm:px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Resumen por tipo de vehículo
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Distribución operativa y recaudación por categoría.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarInformes}
            disabled={cargando}
            className="h-8 w-full border border-[#cfd4dc] bg-white px-3 text-[12px] text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {/* RESUMEN POR TIPO - MÓVIL */}
        <div className="divide-y divide-[#edf0f3] md:hidden">
          {tarjetasPorTipo.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#6b7280]">
              Sin datos
            </div>
          ) : (
            tarjetasPorTipo.map((item) => (
              <div key={item.tipo_vehiculo} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {item.tipo_vehiculo}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6b7280]">
                      Total: {formatoNumero(item.total)}
                    </p>
                  </div>

                  <p className="text-right text-[13px] font-semibold text-[#111827]">
                    {formatoMoneda(item.recaudado)}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-[#fed7aa] bg-[#fff7ed] px-2 py-2">
                    <p className="text-[10px] uppercase text-[#9a3412]">
                      Activos
                    </p>
                    <p className="font-semibold text-[#9a3412]">
                      {formatoNumero(item.activos)}
                    </p>
                  </div>

                  <div className="border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-2">
                    <p className="text-[10px] uppercase text-[#047857]">
                      Liberados
                    </p>
                    <p className="font-semibold text-[#047857]">
                      {formatoNumero(item.liberados)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RESUMEN POR TIPO - ESCRITORIO */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
            <thead className="bg-[#f3f4f6] text-[12px] text-[#4b5563]">
              <tr>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Tipo
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Total
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Activos
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Liberados
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Recaudado
                </th>
              </tr>
            </thead>

            <tbody>
              {tarjetasPorTipo.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                tarjetasPorTipo.map((item) => (
                  <tr
                    key={item.tipo_vehiculo}
                    className="border-b border-[#edf0f3] hover:bg-[#f9fafb]"
                  >
                    <td className="px-3 py-2 font-semibold text-[#111827]">
                      {item.tipo_vehiculo}
                    </td>

                    <td className="px-3 py-2 text-right text-[#4b5563]">
                      {formatoNumero(item.total)}
                    </td>

                    <td className="px-3 py-2 text-right font-medium text-[#9a3412]">
                      {formatoNumero(item.activos)}
                    </td>

                    <td className="px-3 py-2 text-right font-medium text-[#047857]">
                      {formatoNumero(item.liberados)}
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-[#111827]">
                      {formatoMoneda(item.recaudado)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {mensaje && (
          <div className="border-t border-[#d9dde3] bg-[#f9fafb] px-4 py-2 text-[12px] text-[#4b5563]">
            {mensaje}
          </div>
        )}
      </div>

      {/* INFORME GENERAL */}
      <div className="border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Informe general de decomisos
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Registros activos y liberados.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="h-8 w-full border border-[#cfd4dc] bg-white px-2.5 text-[12px] text-[#111827] outline-none focus:border-[#6b7280] sm:w-40"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="LIBERADO">Liberados</option>
            </select>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-8 w-full border border-[#cfd4dc] bg-white px-2.5 text-[12px] text-[#111827] outline-none focus:border-[#6b7280] sm:w-72"
              placeholder="Buscar placa, propietario..."
            />
          </div>
        </div>

        {/* INFORME GENERAL - MÓVIL */}
        <div className="divide-y divide-[#edf0f3] lg:hidden">
          {cargando ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#6b7280]">
              Cargando informe...
            </div>
          ) : decomisosFiltrados.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#6b7280]">
              Sin datos
            </div>
          ) : (
            decomisosFiltrados.map((item, index) => (
              <div key={item.decomiso_id ?? index} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {item.placa}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#6b7280]">
                      {item.propietario}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 border px-2 py-0.5 text-[11px] font-medium ${estadoClase(
                      item.estado
                    )}`}
                  >
                    {item.estado}
                  </span>
                </div>

                <div className="mt-3 grid gap-1 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Identidad</span>
                    <span className="text-right font-medium text-[#111827]">
                      {item.identidad}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Tipo</span>
                    <span className="text-right font-medium text-[#111827]">
                      {item.tipo_vehiculo}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Ingreso</span>
                    <span className="text-right text-[#111827]">
                      {formatoFecha(item.fecha_ingreso)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Liberación</span>
                    <span className="text-right text-[#111827]">
                      {formatoFecha(item.fecha_liberacion)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Tiempo</span>
                    <span className="text-right text-[#111827]">
                      {Number(item.dias ?? 0).toFixed(6)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Tarifa</span>
                    <span className="text-right text-[#111827]">
                      {formatoMoneda(item.tarifa_dia)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-[#d9dde3] pt-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-[13px] font-semibold text-[#374151]">
                      Monto
                    </span>
                    <span className="text-[16px] font-semibold text-[#111827]">
                      {formatoMoneda(item.monto)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* INFORME GENERAL - ESCRITORIO */}
        <div className="hidden max-w-full overflow-x-auto lg:block">
          <table className="min-w-[1250px] border-collapse text-left text-[12px]">
            <thead className="bg-[#f3f4f6] text-[#4b5563]">
              <tr>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Placa
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Propietario
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Identidad
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Tipo
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Ingreso
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Liberación
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Estado
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Tiempo
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Tarifa
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Monto
                </th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando informe...
                  </td>
                </tr>
              ) : decomisosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                decomisosFiltrados.map((item, index) => (
                  <tr
                    key={item.decomiso_id ?? index}
                    className="border-b border-[#edf0f3] hover:bg-[#f9fafb]"
                  >
                    <td className="px-3 py-2 font-semibold text-[#111827]">
                      {item.placa}
                    </td>

                    <td className="px-3 py-2 text-[#4b5563]">
                      {item.propietario}
                    </td>

                    <td className="px-3 py-2 text-[#4b5563]">
                      {item.identidad}
                    </td>

                    <td className="px-3 py-2 text-[#4b5563]">
                      {item.tipo_vehiculo}
                    </td>

                    <td className="px-3 py-2 text-[#4b5563]">
                      {formatoFecha(item.fecha_ingreso)}
                    </td>

                    <td className="px-3 py-2 text-[#4b5563]">
                      {formatoFecha(item.fecha_liberacion)}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex border px-2 py-0.5 text-[11px] font-medium ${estadoClase(
                          item.estado
                        )}`}
                      >
                        {item.estado}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-right text-[#4b5563]">
                      {Number(item.dias ?? 0).toFixed(6)}
                    </td>

                    <td className="px-3 py-2 text-right text-[#4b5563]">
                      {formatoMoneda(item.tarifa_dia)}
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-[#111827]">
                      {formatoMoneda(item.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="hidden border-t border-[#d9dde3] bg-[#f9fafb] px-4 py-2 text-[11px] text-[#6b7280] lg:block">
          Deslice horizontalmente dentro de la tabla para consultar todas las
          columnas.
        </div>
      </div>
    </section>
  );
}