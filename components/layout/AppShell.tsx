"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Operación", href: "/operacion" },
  { label: "Propietarios", href: "/propietarios" },
  { label: "Vehículos", href: "/vehiculos" },
  { label: "Decomisos", href: "/decomisos" },
  { label: "Liberación", href: "/liberacion" },
  { label: "Informes", href: "/informes" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  // Login sin encabezado ni panel lateral
  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  function esActivo(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function cerrarSidebarMovil() {
    setSidebarAbierta(false);
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1f2933]">
      {/* ENCABEZADO COMO IMAGEN COMPLETA */}
      <header className="w-full border-b border-[#d9dde3] bg-white">
        <img
          src="/logo2.svg"
          alt="Encabezado institucional"
          className="block h-auto w-full"
        />
      </header>

      {/* BOTÓN FLOTANTE MÓVIL */}
      <button
        type="button"
        onClick={() => setSidebarAbierta(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2933] text-[18px] font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#111827] lg:hidden"
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* SIDEBAR MÓVIL */}
      {sidebarAbierta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* FONDO OSCURO */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={cerrarSidebarMovil}
            className="absolute inset-0 bg-black/30"
          />

          {/* PANEL */}
          <aside className="relative z-10 flex h-full w-64 flex-col border-r border-[#d9dde3] bg-[#fafafa]">
            <div className="flex items-center justify-between border-b border-[#d9dde3] px-3 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[#111827]">
                  Navegación
                </p>
                <p className="text-[11px] text-[#6b7280]">
                  Corralón municipal
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarSidebarMovil}
                className="border border-[#cfd4dc] bg-white px-2 py-1 text-[12px] text-[#374151]"
              >
                Cerrar
              </button>
            </div>

            <nav className="flex-1 p-2">
              {menuItems.map((item) => {
                const activo = esActivo(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={cerrarSidebarMovil}
                    className={`mb-1 block rounded-md px-3 py-2 text-[13px] transition ${
                      activo
                        ? "bg-[#1f2933] text-white"
                        : "text-[#4b5563] hover:bg-[#eceff3] hover:text-[#111827]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#d9dde3] p-3">
              <LogoutButton />
            </div>

            <div className="border-t border-[#d9dde3] bg-[#fafafa] p-3 text-[11px] leading-5 text-[#6b7280]">
              <p className="font-medium text-[#374151]">Corralón</p>
              <p>Operación municipal</p>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* PANEL LATERAL DESKTOP */}
        <aside className="hidden w-44 shrink-0 border-r border-[#d9dde3] bg-[#fafafa] lg:block">
          <nav className="p-2">
            {menuItems.map((item) => {
              const activo = esActivo(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-1 block rounded-md px-3 py-2 text-[13px] transition ${
                    activo
                      ? "bg-[#1f2933] text-white"
                      : "text-[#4b5563] hover:bg-[#eceff3] hover:text-[#111827]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#d9dde3] p-3">
            <LogoutButton />
          </div>

          <div className="border-t border-[#d9dde3] bg-[#fafafa] p-3 text-[11px] leading-5 text-[#6b7280]">
            <p className="font-medium text-[#374151]">Corralón</p>
            <p>Operación municipal</p>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="min-w-0 flex-1 px-4 py-4">{children}</main>
      </div>
    </div>
  );
}