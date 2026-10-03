import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#DEDFE8]/40 py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
          <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
        </span>
        <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
          Vynor
        </span>
      </Link>

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 rounded-full border border-[#DEDFE8] bg-white px-4 py-2 text-[13px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
}
