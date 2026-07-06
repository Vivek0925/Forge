import type { Metadata } from "next";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Join the beta — Forge",
};

export default function SignupPage() {
  const AuthVisualPanelAny = AuthVisualPanel as any;
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthVisualPanelAny
        quote="One project. Everything connected."
        caption="Set up your workspace in minutes — no more stitching tools together."
      />
      <div className="flex items-center justify-center bg-background px-6 py-16">
        <SignupForm />
      </div>
    </main>
  );
}
