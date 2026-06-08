import OperacionView from "@/components/operacion/OperacionView";

export default function OperacionPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-3 flex items-end justify-between border-b border-[#d9dde3] pb-2">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-[#111827]">
            Operación
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Consola central para registrar decomisos y liberar vehículos.
          </p>
        </div>
      </div>

      <OperacionView />
    </div>
  );
}