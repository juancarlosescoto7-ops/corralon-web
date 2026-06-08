import LiberacionView from "@/components/liberacion/LiberacionView";

export default function LiberacionPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-3 flex items-end justify-between border-b border-[#d9dde3] pb-2">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-[#111827]">
            Liberación
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Cálculo, cobro y cierre de decomisos activos.
          </p>
        </div>
      </div>

      <LiberacionView />
    </div>
  );
}