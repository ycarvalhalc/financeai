import { AuthPanel } from "@/components/auth/AuthPanel";
import { GuestGate } from "@/components/auth/GuestGate";

export default function HomePage() {
  return (
    <GuestGate>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-success/10 blur-3xl" />
        </div>
        <AuthPanel />
      </div>
    </GuestGate>
  );
}
