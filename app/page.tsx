import Image from "next/image";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
        <p className="text-sm font-medium text-slate-500">
          Sistema administrativo
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Control de Corralón Municipal
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Plataforma para el registro, control, liberación e informes de
          vehículos decomisados.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Módulo
            </p>
            <h2 className="mt-2 text-lg font-medium text-slate-950">
              Propietarios
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Registro de personas vinculadas a vehículos.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Módulo
            </p>
            <h2 className="mt-2 text-lg font-medium text-slate-950">
              Decomisos
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Control operativo de ingresos al corralón.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Módulo
            </p>
            <h2 className="mt-2 text-lg font-medium text-slate-950">
              Informes
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Indicadores operativos, estados y recaudación.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}