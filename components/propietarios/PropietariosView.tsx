"use client";

import { useEffect, useMemo, useState } from "react";
import {
  crearPropietario,
  listarPropietarios,
  Propietario,
} from "@/services/propietarios.service";

export default function PropietariosView() {
  const [nombre, setNombre] = useState("");
  const [identidad, setIdentidad] = useState("");
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarPropietarios() {
    try {
      setCargando(true);
      setMensaje("");

      const data = await listarPropietarios();
      setPropietarios(data);
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al cargar propietarios"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPropietarios();
  }, []);

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim() || !identidad.trim()) {
      setMensaje("Debe completar nombre e identidad.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      await crearPropietario(nombre.trim(), identidad.trim());

      setNombre("");
      setIdentidad("");

      await cargarPropietarios();

      setMensaje("Propietario registrado correctamente.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al registrar propietario"
      );
    } finally {
      setGuardando(false);
    }
  }

  const propietariosFiltrados = useMemo(() => {
    const filtro = busqueda.toLowerCase();

    return propietarios.filter((p) => {
      const texto = `${p.nombre} ${p.identidad}`.toLowerCase();
      return texto.includes(filtro);
    });
  }, [propietarios, busqueda]);

  return (
    <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
      {/* PANEL DE REGISTRO */}
      <form
        onSubmit={handleGuardar}
        className="border border-[#d9dde3] bg-white"
      >
        <div className="border-b border-[#d9dde3] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Nuevo propietario
          </h2>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Registro base para vincular vehículos.
          </p>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Nombre completo
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
              placeholder="Nombre del propietario"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
              Identidad
            </label>
            <input
              value={identidad}
              onChange={(e) => setIdentidad(e.target.value)}
              className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
              placeholder="Número de identidad"
            />
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
        <div className="flex flex-col gap-3 border-b border-[#d9dde3] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827]">
              Propietarios registrados
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6b7280]">
              {propietarios.length} registros en base de datos
            </p>
          </div>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280] md:w-72"
            placeholder="Buscar..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-[13px]">
            <thead className="bg-[#f3f4f6] text-[12px] text-[#4b5563]">
              <tr>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Nombre
                </th>
                <th className="border-b border-[#d9dde3] px-3 py-2 font-semibold">
                  Identidad
                </th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Cargando propietarios...
                  </td>
                </tr>
              ) : propietariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 text-center text-[12px] text-[#6b7280]"
                  >
                    Sin datos
                  </td>
                </tr>
              ) : (
                propietariosFiltrados.map((propietario) => (
                  <tr
                    key={propietario.id}
                    className="border-b border-[#edf0f3] hover:bg-[#f9fafb]"
                  >
                    <td className="px-3 py-2 font-medium text-[#111827]">
                      {propietario.nombre}
                    </td>
                    <td className="px-3 py-2 text-[#4b5563]">
                      {propietario.identidad}
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