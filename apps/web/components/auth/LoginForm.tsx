"use client";

import { useState } from "react";
import Link from "next/link";

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.11.82-.27.82-.6 0-.29-.01-1.06-.02-2.08-3.34.75-4.04-1.65-4.04-1.65-.55-1.42-1.34-1.81-1.34-1.81-1.09-.77.08-.75.08-.75 1.21.09 1.84 1.28 1.84 1.28 1.07 1.88 2.81 1.34 3.5 1.02.11-.79.42-1.34.76-1.65-2.67-.31-5.47-1.37-5.47-6.09 0-1.35.46-2.45 1.22-3.31-.12-.31-.53-1.55.12-3.23 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.65 1.68.24 2.92.12 3.23.76.86 1.22 1.96 1.22 3.31 0 4.73-2.81 5.77-5.49 6.08.43.38.81 1.13.81 2.29 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.34 24 17.74 24 12.3 24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.6c-.13 1.1-.85 2.75-2.45 3.86l-.02.15 3.56 2.76.25.02c2.26-2.09 3.58-5.17 3.58-8.46Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.78-2.93c-1.01.7-2.37 1.19-4.15 1.19-3.18 0-5.87-2.1-6.83-5.01l-.14.01-3.71 2.87-.05.14C3.24 21.3 7.28 24 12 24Z" />
      <path fill="#FBBC05" d="M5.17 14.33a7.35 7.35 0 0 1-.39-2.33c0-.81.14-1.6.38-2.33l-.01-.16-3.75-2.9-.12.06A11.98 11.98 0 0 0 0 12c0 1.93.47 3.76 1.28 5.38l3.89-3.05Z" />
      <path fill="#EA4335" d="M12 4.75c2.26 0 3.79.97 4.66 1.79l3.4-3.31C17.94 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.28 6.62l3.89 3.05c.96-2.91 3.65-4.92 6.83-4.92Z" />
    </svg>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // wire up to your auth provider here
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col">
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-text">
          <span className="h-[9px] w-[9px] rounded-[2px] bg-primary" />
        </span>
        <span className="text-[15px] font-medium tracking-tight text-text">Forge</span>
      </div>

      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        Sign in
      </span>
      <h1 className="mt-3 text-[30px] font-light leading-tight tracking-[-0.01em] text-text">
        Welcome back to Forge
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
        Sign in to keep working in one connected place.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2.5 rounded-[var(--radius-sm)] border border-border bg-surface text-[13px] font-medium text-text transition-colors hover:bg-surface-secondary"
        >
          <GithubIcon />
          Continue with GitHub
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2.5 rounded-[var(--radius-sm)] border border-border bg-surface text-[13px] font-medium text-text transition-colors hover:bg-surface-secondary"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-11 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[14px] text-text placeholder:text-text-secondary/70 outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-text">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-text-secondary transition-colors hover:text-text"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[14px] text-text placeholder:text-text-secondary/70 outline-none transition-colors focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="mt-2 h-11 rounded-[var(--radius-sm)] bg-primary text-[14px] font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-text hover:text-primary">
          Join the beta
        </Link>
      </p>
    </div>
  );
}
