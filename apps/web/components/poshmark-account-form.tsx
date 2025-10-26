"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { z } from "zod";

const poshmarkSchema = z.object({
  label: z
    .string()
    .min(2, "Label should help you identify the account")
    .max(64, "Keep labels concise"),
  username: z.string().min(2, "Enter your Poshmark username"),
  password: z
    .string()
    .min(8, "Poshmark password must be at least 8 characters"),
  sessionCookie: z
    .string()
    .optional()
    .refine((value) => !value || value.length > 16, "Paste a valid session cookie if provided")
});

interface FormState {
  type: "idle" | "error" | "success" | "loading";
  message: string | null;
}

export function PoshmarkAccountForm() {
  const [state, setState] = useState<FormState>({ type: "idle", message: null });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "idle", message: null });

    const form = new FormData(event.currentTarget);
    const payload = {
      label: String(form.get("label") ?? ""),
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
      sessionCookie: String(form.get("sessionCookie") ?? "") || undefined
    };

    const parse = poshmarkSchema.safeParse(payload);
    if (!parse.success) {
      setState({ type: "error", message: parse.error.errors[0]?.message ?? "Invalid submission" });
      return;
    }

    try {
      setState({ type: "loading", message: "Encrypting and saving credentials…" });
      await axios.post("/api/poshmark/connect", parse.data);
      setState({ type: "success", message: "Account connected. We will validate the credentials shortly." });
      event.currentTarget.reset();
    } catch (error: unknown) {
      const description =
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : "Unexpected error";
      setState({ type: "error", message: description });
    }
  }

  return (
    <form className="form-card space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Connect a Poshmark account</h2>
        <p className="mt-1 text-sm text-slate-600">
          We encrypt your credentials with libsodium before they touch the database. Only customer-managed keys can decrypt
          them during job execution.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="label">Account label</label>
          <input id="label" name="label" placeholder="Main closet" required />
        </div>
        <div>
          <label htmlFor="username">Poshmark username</label>
          <input id="username" name="username" placeholder="posher123" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="password">Poshmark password</label>
          <input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div>
          <label htmlFor="sessionCookie">Session cookie (optional)</label>
          <input id="sessionCookie" name="sessionCookie" placeholder="pm_sessions=..." />
          <p className="mt-2 text-xs text-slate-500">
            If provided, we encrypt your session cookie as well. Rotate it regularly for best security.
          </p>
        </div>
      </div>

      {state.message && (
        <div className={`alert ${state.type === "success" ? "success" : ""}`}>{state.message}</div>
      )}

      <button className="primary" type="submit" disabled={state.type === "loading"}>
        {state.type === "loading" ? "Saving…" : "Securely store credentials"}
      </button>
    </form>
  );
}
