"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  crearVehiculo,
  listarVehiculos,
  Vehiculo,
} from "@/services/vehiculos.service";
import {
  listarPropietarios,
  Propietario,
} from "@/services/propietarios.service";

const TIPOS_VEHICULO = ["MOTOCICLETA", "AUTOMOVIL", "CAMION"] as const;

export default function VehiculosView() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  const [propietarioId, setPropietarioId] = useState("");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarDatos() {
    try {
      setCargando(true);
      setMensaje("");

      const [propietariosData, vehiculosData] = await Promise.all([
        listarPropietarios(),
        listarVehiculos(),
      ]);

      setPropietarios(propietariosData);
      setVehiculos(vehiculosData);
    } catch (error) {
      setMensaje(
        error instanceof Error ? error.message : "Error al cargar datos"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleGuardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!propietarioId || !placa.trim() || !marca.trim() || !tipoVehiculo) {
      setMensaje("Debe completar propietario, placa, marca y tipo.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      await crearVehiculo(
        propietarioId,
        placa.trim().toUpperCase(),
        marca.trim(),
        tipoVehiculo
      );

      setPlaca("");
      setMarca("");
      setTipoVehiculo("");

      await cargarDatos();

      setMensaje("Vehículo registrado correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al registrar vehículo"
      );
    } finally {
      setGuardando(false);
    }
  }

  const vehiculosFiltrados = useMemo(() => {
    const filtro = busqueda.toLowerCase();

    return vehiculos.filter((vehiculo) => {
      const texto = `${vehiculo.placa} ${vehiculo.marca} ${
        vehiculo.tipo_vehiculo
      } ${vehiculo.propietario ?? ""}`.toLowerCase();

      return texto.includes(filtro);
    });
  }, [vehiculos, busqueda]);

  return (
    <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
      {/* PANEL DE REGISTRO */}
      <form
        onSubmit={handleGuardar}
        className="border border-[#d9dde3] bg-white"
      >
        <div className="border-b border-[#d9dde3] px-3 py-3 sm:px-4">
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Nuevo vehículo
          </h2>

          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Vincule un vehículo a un propietario.
          </p>
        </div>

        <div className="space-y-3 px-3 py-4 sm:px-4">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Propietario
            </label>

            <select
              value={propietarioId}
              onChange={(e) => setPropietarioId(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
            >
              <option value="">Seleccione propietario</option>

              {propietarios.map((propietario) => (
                <option key={propietario.id} value={propietario.id}>
                  {propietario.nombre} — {propietario.identidad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Placa
            </label>

            <input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] uppercase text-[#111827] outline-none focus:border-[#6b7280]"
              placeholder="Ej. HAA1234"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Marca
            </label>

            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
              placeholder="Ej. Toyota"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Tipo
            </label>

            <select
              value={tipoVehiculo}
              onChange={(e) => setTipoVehiculo(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
            >
              <option value="">Seleccione tipo</option>

              {TIPOS_VEHICULO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="h-9 w-full bg-[#1f2933] text-[13px] font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>

          {mensaje && (
            <div className="border border-[#d9dde3] bg-[#f9fafb] px-3 py-2 text-[12px] text-[#4b5563]">
              {mensaje}
            </div>
          )}
        </div>
      </form>

      {/* LISTADO */}
      <div className="min-w-0 border border-[#d9dde3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-3 py-3 sm:px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Vehículos registrados
            </h2>

            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              {vehiculos.length} registros en base de datos
            </p>
          </div>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280] md:w-80"
            placeholder="Buscar por placa, marca o propietario..."
          />
        </div>

        {/* VISTA MÓVIL */}
        <div className="divide-y divide-[#edf0f3] md:hidden">
          {cargando ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#6b7280]">
              Cargando vehículos...
            </div>
          ) : vehiculosFiltrados.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-[#6b7280]">
              Sin datos
            </div>
          ) : (
            vehiculosFiltrados.map((vehiculo) => (
              <div key={vehiculo.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {vehiculo.placa}
                    </p>

                    <p className="mt-0.5 text-[12px] text-[#6b7280]">
                      {vehiculo.marca} · {vehiculo.tipo_vehiculo}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-1 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280]">Propietario</span>

                    <span className="text-right font-medium text-[#111827]">
                      {vehiculo.propietario ?? "Sin propietario"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VISTA ESCRITORIO */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[780px] border-collapse text-left text-[13px]">
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
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando vehículos...
                  </td>
                </tr>
              ) : vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                vehiculosFiltrados.map((vehiculo) => (
                  <tr
                    key={vehiculo.id}
                    className="border-b border-[#edf0f3] hover:bg-[#f9fafb]"
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}