"use client";

import { useEffect, useMemo, useState } from "react";
import { listarVehiculos, Vehiculo } from "@/services/vehiculos.service";
import {
  crearDecomiso,
  listarDecomisosActivos,
  DecomisoActivo,
} from "@/services/decomisos.service";

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

export default function DecomisosView() {
  const [montado, setMontado] = useState(false);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [decomisos, setDecomisos] = useState<DecomisoActivo[]>([]);

  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [busquedaDecomiso, setBusquedaDecomiso] = useState("");

  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<Vehiculo | null>(null);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setMensaje("");

      const [vehiculosData, decomisosData] = await Promise.all([
        listarVehiculos(),
        listarDecomisosActivos(),
      ]);

      setVehiculos(vehiculosData);
      setDecomisos(decomisosData);
    } catch (error) {
      setMensaje(
        error instanceof Error ? error.message : "Error al cargar datos"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (montado) {
      cargarDatos();
    }
  }, [montado]);

  const vehiculosFiltrados = useMemo(() => {
    const filtro = busquedaVehiculo.toLowerCase();

    return vehiculos.filter((vehiculo) => {
      const texto = `${vehiculo.placa} ${vehiculo.marca} ${
        vehiculo.tipo_vehiculo
      } ${vehiculo.propietario ?? ""}`.toLowerCase();

      return texto.includes(filtro);
    });
  }, [vehiculos, busquedaVehiculo]);

  const decomisosFiltrados = useMemo(() => {
    const filtro = busquedaDecomiso.toLowerCase();

    return decomisos.filter((decomiso) => {
      const texto = `${decomiso.placa} ${decomiso.fecha_ingreso}`.toLowerCase();
      return texto.includes(filtro);
    });
  }, [decomisos, busquedaDecomiso]);

  async function handleCrearDecomiso() {
    if (!vehiculoSeleccionado) {
      setMensaje("Debe seleccionar un vehículo.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      await crearDecomiso(vehiculoSeleccionado.id);

      setVehiculoSeleccionado(null);
      setBusquedaVehiculo("");

      await cargarDatos();

      setMensaje("Decomiso registrado correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error ? error.message : "Error al registrar decomiso"
      );
    } finally {
      setGuardando(false);
    }
  }

  const puedeRegistrarDecomiso = Boolean(vehiculoSeleccionado) && !guardando;

  if (!montado) {
    return (
      <section className="border border-[#d9dde3] bg-white px-4 py-6">
        <p className="text-[12px] text-[#6b7280]">
          Cargando módulo de decomisos...
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      {/* LISTA DE VEHÍCULOS */}
      <div className="min-w-0 border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Vehículos disponibles
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Seleccione un vehículo para registrar su ingreso.
            </p>
          </div>

          <input
            value={busquedaVehiculo}
            onChange={(e) => setBusquedaVehiculo(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280] md:w-80"
            placeholder="Buscar por placa, marca o propietario..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
            <thead className="bg-[#f3f4f6] text-[12px] text-[#4b5563]">
              <tr>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Placa
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Marca
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Tipo
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Propietario
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
                    colSpan={5}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando vehículos...
                  </td>
                </tr>
              ) : vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                vehiculosFiltrados.map((vehiculo) => {
                  const seleccionado =
                    vehiculoSeleccionado?.id === vehiculo.id;

                  return (
                    <tr
                      key={vehiculo.id}
                      className={`border-b border-[#edf0f3] ${
                        seleccionado ? "bg-[#eef2f7]" : "hover:bg-[#f9fafb]"
                      }`}
                    >
                      <td className="px-3 py-2 font-semibold text-[#111827]">
                        {vehiculo.placa}
                      </td>
                      <td className="px-3 py-2 text-[#4b5563]">
                        {vehiculo.marca}
                      </td>
                      <td className="px-3 py-2 text-[#4b5563]">
                        {vehiculo.tipo_vehiculo}
                      </td>
                      <td className="px-3 py-2 text-[#4b5563]">
                        {vehiculo.propietario ?? "Sin propietario"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setVehiculoSeleccionado(vehiculo)}
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

      {/* PANEL DE ACCIÓN */}
      <aside className="space-y-4">
        <div className="border border-[#d9dde3] bg-white">
          <div className="border-b border-[#d9dde3] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Registro de decomiso
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              Confirmación del ingreso al corralón.
            </p>
          </div>

          <div className="px-4 py-4">
            {vehiculoSeleccionado ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Placa</span>
                  <span className="font-semibold text-[#111827]">
                    {vehiculoSeleccionado.placa}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Marca</span>
                  <span className="text-[#111827]">
                    {vehiculoSeleccionado.marca}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Tipo</span>
                  <span className="text-[#111827]">
                    {vehiculoSeleccionado.tipo_vehiculo}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#6b7280]">Propietario</span>
                  <span className="text-right text-[#111827]">
                    {vehiculoSeleccionado.propietario ?? "Sin propietario"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#6b7280]">
                Ningún vehículo seleccionado.
              </p>
            )}

            <button
              type="button"
              onClick={handleCrearDecomiso}
              disabled={!puedeRegistrarDecomiso}
              className="mt-4 h-9 w-full bg-[#1f2933] text-[13px] font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Registrando..." : "Registrar decomiso"}
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
              Decomisos activos
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              {decomisos.length} registros activos
            </p>
          </div>

          <div className="border-b border-[#d9dde3] px-4 py-3">
            <input
              value={busquedaDecomiso}
              onChange={(e) => setBusquedaDecomiso(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
              placeholder="Buscar decomiso..."
            />
          </div>

          <div className="max-h-[360px] overflow-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="sticky top-0 bg-[#f3f4f6] text-[12px] text-[#4b5563]">
                <tr>
                  <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                    Placa
                  </th>
                  <th className="border-b border-[#d9dde3] px-3 py-2 text-right font-semibold">
                    Tarifa
                  </th>
                </tr>
              </thead>

              <tbody>
                {decomisosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                    >
                      Sin datos
                    </td>
                  </tr>
                ) : (
                  decomisosFiltrados.map((decomiso) => (
                    <tr
                      key={decomiso.id}
                      className="border-b border-[#edf0f3] hover:bg-[#f9fafb]"
                    >
                      <td className="px-3 py-2">
                        <p className="font-semibold text-[#111827]">
                          {decomiso.placa}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#6b7280]">
                          {formatearFecha(decomiso.fecha_ingreso)}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-[#111827]">
                        {formatoMoneda(Number(decomiso.tarifa ?? 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </section>
  );
}