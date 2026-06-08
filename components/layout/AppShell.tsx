"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  // Login sin encabezado ni panel lateral
  if (pathname.startsWith("/login")) {
    return <>{children}</>;
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

      <div className="flex min-h-screen">
        {/* PANEL LATERAL */}
        <aside className="hidden w-44 shrink-0 border-r border-[#d9dde3] bg-[#fafafa] lg:block">
          <nav className="p-2">
            {menuItems.map((item) => {
              const activo =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

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