import type { Metadata } from "next";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import LoginForm from "@/components/auth/LoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/AuthRedirect";

export const metadata: Metadata = {
  title: "Sign in — Vynor",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <main className="grid min-h-screen lg:grid-cols-2">
        <AuthVisualPanel />
        <div className="flex items-center justify-center bg-background px-6 py-16">
          <LoginForm />
        </div>
      </main>
    </RedirectIfAuthenticated>
  );
}
