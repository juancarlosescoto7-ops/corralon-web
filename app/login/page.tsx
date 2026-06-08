import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4">
      <div className="w-full max-w-[420px]">
        <LoginForm />

        <p className="mt-3 text-center text-[11px] text-[#6b7280]">
          Sistema interno de control de corralón municipal.
        </p>
      </div>
    </main>
  );
}