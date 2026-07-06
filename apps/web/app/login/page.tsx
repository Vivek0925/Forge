import type { Metadata } from "next";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Forge",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthVisualPanel />
      <div className="flex items-center justify-center bg-background px-6 py-16">
        <LoginForm />
      </div>
    </main>
  );
}
