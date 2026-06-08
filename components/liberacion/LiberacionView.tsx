"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listarDecomisosActivos,
  DecomisoActivo,
} from "@/services/decomisos.service";
import { liberarDecomiso } from "@/services/liberacion.service";

function formatearFecha(fecha: string) {
  if (!fecha) return "Sin fecha";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString("es-HN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatoMoneda(valor: number) {
  return `L ${Number(valor ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcularDiasExactos(fechaIngreso: string) {
  const ingreso = new Date(fechaIngreso);
  const ahora = new Date();

  if (Number.isNaN(ingreso.getTime())) {
    return 0;
  }

  const diferenciaMs = ahora.getTime() - ingreso.getTime();
  const dias = diferenciaMs / 1000 / 60 / 60 / 24;

  return Math.max(dias, 0);
}

export default function LiberacionView() {
  const [decomisos, setDecomisos] = useState<DecomisoActivo[]>([]);
  const [decomisoSeleccionado, setDecomisoSeleccionado] =
    useState<DecomisoActivo | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [liberando, setLiberando] = useState(false);

  const [ahora, setAhora] = useState(new Date());

  async function cargarDecomisos() {
    try {
      setCargando(true);
      setMensaje("");

      const data = await listarDecomisosActivos();
      setDecomisos(data);
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al cargar decomisos activos"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDecomisos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const decomisosFiltrados = useMemo(() => {
    const filtro = busqueda.toLowerCase();

    return decomisos.filter((decomiso) => {
      const texto = `${decomiso.placa} ${decomiso.fecha_ingreso}`.toLowerCase();
      return texto.includes(filtro);
    });
  }, [decomisos, busqueda]);

  const detalle = useMemo(() => {
    if (!decomisoSeleccionado) {
      return {
        dias: 0,
        tarifa: 0,
        total: 0,
      };
    }

    const dias = calcularDiasExactos(decomisoSeleccionado.fecha_ingreso);
    const tarifa = Number(decomisoSeleccionado.tarifa ?? 0);
    const total = dias * tarifa;

    return {
      dias,
      tarifa,
      total,
    };
  }, [decomisoSeleccionado, ahora]);

  async function handleLiberar() {
    if (!decomisoSeleccionado) {
      setMensaje("Debe seleccionar un decomiso.");
      return;
    }

    try {
      setLiberando(true);
      setMensaje("");

      const totalCobrado = await liberarDecomiso(decomisoSeleccionado.id);

      setMensaje(
        `Decomiso liberado correctamente. Total cobrado: ${formatoMoneda(
          totalCobrado
        )}`
      );

      setDecomisoSeleccionado(null);

      await cargarDecomisos();
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al liberar decomiso"
      );
    } finally {
      setLiberando(false);
    }
  }

  const puedeLiberar = Boolean(decomisoSeleccionado) && !liberando;

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      {/* LISTADO DE DECOMISOS ACTIVOS */}
      <div className="min-w-0 border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Decomisos activos
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Seleccione el registro que será liberado.
            </p>
          </div>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280] md:w-80"
            placeholder="Buscar por placa..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead className="bg-[#f3f4f6] text-[12px] text-[#4b5563]">
              <tr>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Placa
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Fecha ingreso
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Tarifa diaria
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando decomisos...
                  </td>
                </tr>
              ) : decomisosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                decomisosFiltrados.map((decomiso) => {
                  const seleccionado =
                    decomisoSeleccionado?.id === decomiso.id;

                  return (
                    <tr
                      key={decomiso.id}
                      className={`border-b border-[#edf0f3] ${
                        seleccionado ? "bg-[#eef2f7]" : "hover:bg-[#f9fafb]"
                      }`}
                    >
                      <td className="px-3 py-2 font-semibold text-[#111827]">
                        {decomiso.placa}
                      </td>

                      <td className="px-3 py-2 text-[#4b5563]">
                        {formatearFecha(decomiso.fecha_ingreso)}
                      </td>

                      <td className="px-3 py-2 text-right font-medium text-[#111827]">
                        {formatoMoneda(Number(decomiso.tarifa ?? 0))}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setDecomisoSeleccionado(decomiso)}
                          className={`h-8 border px-3 text-[12px] transition ${
                            seleccionado
                              ? "border-[#1f2933] bg-[#1f2933] text-white"
                              : "border-[#cfd4dc] bg-white text-[#374151] hover:bg-[#f3f4f6]"
                          }`}
                        >
                          {seleccionado ? "Seleccionado" : "Seleccionar"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL DE COBRO */}
      <aside className="space-y-4">
        <div className="border border-[#d9dde3] bg-white">
          <div className="border-b border-[#d9dde3] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Liquidación
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Cálculo exacto por tiempo transcurrido.
            </p>
          </div>

          <div className="px-4 py-4">
            {decomisoSeleccionado ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Placa</span>
                  <span className="font-semibold text-[#111827]">
                    {decomisoSeleccionado.placa}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Ingreso</span>
                  <span className="text-right text-[#111827]">
                    {formatearFecha(decomisoSeleccionado.fecha_ingreso)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Tiempo</span>
                  <span className="font-medium text-[#111827]">
                    {detalle.dias.toFixed(6)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Tarifa diaria</span>
                  <span className="font-medium text-[#111827]">
                    {formatoMoneda(detalle.tarifa)}
                  </span>
                </div>

                <div className="mt-3 border-t border-[#d9dde3] pt-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-[13px] font-semibold text-[#374151]">
                      Total estimado
                    </span>
                    <span className="text-[18px] font-semibold tracking-tight text-[#111827]">
                      {formatoMoneda(detalle.total)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#6b7280]">
                Ningún decomiso seleccionado.
              </p>
            )}

            <button
              type="button"
              onClick={handleLiberar}
              disabled={!puedeLiberar}
              className="mt-4 h-9 w-full bg-[#1f2933] text-[13px] font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {liberando ? "Liberando..." : "Liberar y cobrar"}
            </button>

            {mensaje && (
              <div className="mt-3 border border-[#d9dde3] bg-[#f9fafb] px-3 py-2 text-[12px] text-[#4b5563]">
                {mensaje}
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#d9dde3] bg-white">
          <div className="border-b border-[#d9dde3] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Control operativo
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Resumen de registros activos.
            </p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-[#d9dde3]">
            <div className="px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">
                Activos
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#111827]">
                {decomisos.length}
              </p>
            </div>

            <div className="px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">
                Selección
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#111827]">
                {decomisoSeleccionado ? "1" : "0"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}