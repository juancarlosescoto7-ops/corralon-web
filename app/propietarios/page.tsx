import PropietariosView from "@/components/propietarios/PropietariosView";

export default function PropietariosPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-3 flex items-end justify-between border-b border-[#d9dde3] pb-2">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-[#111827]">
            Propietarios
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Registro y consulta de propietarios vinculados al sistema.
          </p>
        </div>
      </div>

      <PropietariosView />
    </div>
  );
}