"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listarOperacionVehiculos,
  VehiculoOperacion,
} from "@/services/operacion.service";
import { crearDecomiso } from "@/services/decomisos.service";
import { liberarDecomiso } from "@/services/liberacion.service";

function formatoMoneda(valor: number) {
  return `L ${Number(valor ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
    return "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]";
  }

  return "border-[#bbf7d0] bg-[#f0fdf4] text-[#047857]";
}

export default function OperacionView() {
  const [montado, setMontado] = useState(false);

  const [vehiculos, setVehiculos] = useState<VehiculoOperacion[]>([]);
  const [seleccionado, setSeleccionado] =
    useState<VehiculoOperacion | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setMensaje("");

      const data = await listarOperacionVehiculos();
      setVehiculos(data);

      if (seleccionado) {
        const actualizado = data.find(
          (item) => item.vehiculo_id === seleccionado.vehiculo_id
        );

        setSeleccionado(actualizado ?? null);
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al cargar operación"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (montado) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montado]);

  const vehiculosFiltrados = useMemo(() => {
    const filtro = busqueda.toLowerCase();

    return vehiculos.filter((item) => {
      const coincideEstado =
        estadoFiltro === "TODOS" || item.estado_operativo === estadoFiltro;

      const texto = `${item.placa} ${item.marca} ${item.tipo_vehiculo} ${item.propietario} ${item.identidad}`.toLowerCase();

      return coincideEstado && texto.includes(filtro);
    });
  }, [vehiculos, busqueda, estadoFiltro]);

  async function handleRegistrarDecomiso() {
    if (!seleccionado) {
      setMensaje("Debe seleccionar un vehículo.");
      return;
    }

    if (seleccionado.estado_operativo !== "LIBRE") {
      setMensaje("Este vehículo ya tiene un decomiso activo.");
      return;
    }

    try {
      setProcesando(true);
      setMensaje("");

      await crearDecomiso(seleccionado.vehiculo_id);

      await cargarDatos();

      setMensaje("Decomiso registrado correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al registrar decomiso"
      );
    } finally {
      setProcesando(false);
    }
  }

  async function handleLiberar() {
    if (!seleccionado) {
      setMensaje("Debe seleccionar un vehículo.");
      return;
    }

    if (seleccionado.estado_operativo !== "ACTIVO") {
      setMensaje("Este vehículo no tiene decomiso activo.");
      return;
    }

    if (!seleccionado.decomiso_id) {
      setMensaje("No se encontró el ID del decomiso activo.");
      return;
    }

    try {
      setProcesando(true);
      setMensaje("");

      const total = await liberarDecomiso(seleccionado.decomiso_id);

      await cargarDatos();

      setMensaje(
        `Vehículo liberado correctamente. Total cobrado: ${formatoMoneda(
          total
        )}`
      );
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al liberar decomiso"
      );
    } finally {
      setProcesando(false);
    }
  }

  const totalActivos = vehiculos.filter(
    (item) => item.estado_operativo === "ACTIVO"
  ).length;

  const totalLibres = vehiculos.filter(
    (item) => item.estado_operativo === "LIBRE"
  ).length;

  const puedeRegistrar =
    Boolean(seleccionado) &&
    seleccionado?.estado_operativo === "LIBRE" &&
    !procesando;

  const puedeLiberar =
    Boolean(seleccionado) &&
    seleccionado?.estado_operativo === "ACTIVO" &&
    !procesando;

  if (!montado) {
    return (
      <section className="border border-[#d9dde3] bg-white px-4 py-6">
        <p className="text-[12px] text-[#6b7280]">
          Cargando centro operativo...
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      {/* LISTA OPERATIVA */}
      <div className="min-w-0 border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Centro operativo
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Búsqueda, estado y acción directa por vehículo.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="h-8 border border-[#cfd4dc] bg-white px-2.5 text-[12px] text-[#111827] outline-none focus:border-[#6b7280]"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="LIBRE">Libres</option>
            </select>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-8 w-full border border-[#cfd4dc] bg-white px-2.5 text-[12px] text-[#111827] outline-none focus:border-[#6b7280] sm:w-80"
              placeholder="Buscar placa, propietario, identidad..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-[12px]">
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
                  Estado
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Tiempo
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                  Monto
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
                    colSpan={8}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando operación...
                  </td>
                </tr>
              ) : vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                vehiculosFiltrados.map((item) => {
                  const activo =
                    seleccionado?.vehiculo_id === item.vehiculo_id;

                  return (
                    <tr
                      key={item.vehiculo_id}
                      className={`border-b border-[#edf0f3] ${
                        activo ? "bg-[#eef2f7]" : "hover:bg-[#f9fafb]"
                      }`}
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

                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex border px-2 py-0.5 text-[11px] font-medium ${estadoClase(
                            item.estado_operativo
                          )}`}
                        >
                          {item.estado_operativo}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-right text-[#4b5563]">
                        {Number(item.dias ?? 0).toFixed(6)}
                      </td>

                      <td className="px-3 py-2 text-right font-semibold text-[#111827]">
                        {formatoMoneda(item.monto_estimado)}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSeleccionado(item)}
                          className={`h-7 border px-3 text-[11px] transition ${
                            activo
                              ? "border-[#1f2933] bg-[#1f2933] text-white"
                              : "border-[#cfd4dc] bg-white text-[#374151] hover:bg-[#f3f4f6]"
                          }`}
                        >
                          {activo ? "Seleccionado" : "Seleccionar"}
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

      {/* PANEL DERECHO */}
      <aside className="space-y-4">
        <div className="border border-[#d9dde3] bg-white">
          <div className="border-b border-[#d9dde3] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Acción operativa
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Registre o libere según el estado actual.
            </p>
          </div>

          <div className="px-4 py-4">
            {seleccionado ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Placa</span>
                  <span className="font-semibold text-[#111827]">
                    {seleccionado.placa}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Propietario</span>
                  <span className="text-right text-[#111827]">
                    {seleccionado.propietario}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Estado</span>
                  <span
                    className={`border px-2 py-0.5 text-[11px] font-medium ${estadoClase(
                      seleccionado.estado_operativo
                    )}`}
                  >
                    {seleccionado.estado_operativo}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Ingreso</span>
                  <span className="text-right text-[#111827]">
                    {formatoFecha(seleccionado.fecha_ingreso)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Tarifa</span>
                  <span className="font-medium text-[#111827]">
                    {formatoMoneda(seleccionado.tarifa)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Tiempo</span>
                  <span className="font-medium text-[#111827]">
                    {Number(seleccionado.dias ?? 0).toFixed(6)}
                  </span>
                </div>

                <div className="border-t border-[#d9dde3] pt-3">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-[#374151]">
                      Monto estimado
                    </span>
                    <span className="text-[18px] font-semibold text-[#111827]">
                      {formatoMoneda(seleccionado.monto_estimado)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#6b7280]">
                Ningún vehículo seleccionado.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRegistrarDecomiso}
                disabled={!puedeRegistrar}
                className="h-9 bg-[#1f2933] text-[12px] font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Registrar
              </button>

              <button
                type="button"
                onClick={handleLiberar}
                disabled={!puedeLiberar}
                className="h-9 border border-[#1f2933] bg-white text-[12px] font-medium text-[#1f2933] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Liberar
              </button>
            </div>

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
              Resumen operativo
            </h2>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#d9dde3]">
            <div className="px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">
                Total
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#111827]">
                {vehiculos.length}
              </p>
            </div>

            <div className="px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">
                Activos
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#9a3412]">
                {totalActivos}
              </p>
            </div>

            <div className="px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-[#6b7280]">
                Libres
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#047857]">
                {totalLibres}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}