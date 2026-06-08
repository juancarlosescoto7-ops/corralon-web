"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMensaje("Ingrese correo y contraseña.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMensaje("Credenciales inválidas.");
        return;
      }

      router.replace("/operacion");
      router.refresh();
    } catch {
      setMensaje("No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-[360px] border border-[#d9dde3] bg-white"
    >
      <div className="border-b border-[#d9dde3] px-5 py-4">
        <h1 className="text-[17px] font-semibold tracking-tight text-[#111827]">
          Acceso al sistema
        </h1>
        <p className="mt-1 text-[12px] text-[#6b7280]">
          Ingrese sus credenciales institucionales.
        </p>
      </div>

      <div className="space-y-3 px-5 py-5">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
            placeholder="usuario@correo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#4b5563]">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full border border-[#cfd4dc] bg-white px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#6b7280]"
            placeholder="Contraseña"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="h-9 w-full bg-[#1f2933] text-[13px] font-medium text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? "Validando..." : "Ingresar"}
        </button>

        {mensaje && (
          <div className="border border-[#d9dde3] bg-[#f9fafb] px-3 py-2 text-[12px] text-[#4b5563]">
            {mensaje}
          </div>
        )}
      </div>
    </form>
  );
}