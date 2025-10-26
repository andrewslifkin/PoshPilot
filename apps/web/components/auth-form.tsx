"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import axios from "axios";
import Link from "next/link";

const authSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Use upper, lower, and a number for maximum security"),
  name: z.string().min(2, "Provide your full name").optional()
});

const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_ENABLED === "true";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "error" | "success" | "loading">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const values = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      name: form.get("name") ? String(form.get("name")) : undefined
    };

    const parse = authSchema.safeParse(values);
    if (!parse.success) {
      setStatus("error");
      setMessage(parse.error.errors[0]?.message ?? "Please review the form");
      return;
    }

    try {
      setStatus("loading");
      if (mode === "register") {
        await axios.post("/api/auth/register", parse.data);
        setStatus("success");
        setMessage("Account created. You can sign in now.");
      }

      const result = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        email: parse.data.email,
        password: parse.data.password
      });

      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
      }
    } catch (error: unknown) {
      const description =
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Unexpected error";
      setStatus("error");
      setMessage(description);
    } finally {
      if (mode === "register") {
        event.currentTarget.reset();
      }
    }
  }

  return (
    <form className="form-card space-y-6" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {mode === "login" ? "Welcome back" : "Create your secure workspace"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "login"
            ? "Sign in with your credentials or single-click with OAuth."
            : "We encrypt your credentials at rest and in transit. Passwords require upper, lower, and numeric characters."}
        </p>
      </div>

      {mode === "register" && (
        <div>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" placeholder="Casey Seller" autoComplete="name" required />
        </div>
      )}

      <div>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
        <p className="mt-2 text-xs text-slate-500">
          Your password is hashed before storage, and never leaves our infrastructure unencrypted.
        </p>
      </div>

      {message && (
        <div className={`alert ${status === "success" ? "success" : ""}`}>{message}</div>
      )}

      <div className="flex flex-col gap-3">
        <button className="primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Processing…" : mode === "login" ? "Sign in" : "Register & continue"}
        </button>
        {githubEnabled ? (
          <button
            className="secondary"
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            Continue with GitHub
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500">
            GitHub SSO is disabled. Set NEXT_PUBLIC_GITHUB_ENABLED=true to expose it.
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600">
        {mode === "login" ? (
          <>
            Need an account? <Link href="/register">Create one securely.</Link>
          </>
        ) : (
          <>
            Already registered? <Link href="/login">Sign in securely.</Link>
          </>
        )}
      </p>
    </form>
  );
}
