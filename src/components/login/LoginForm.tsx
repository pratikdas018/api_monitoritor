"use client";

import { useFormState } from "react-dom";

import { loginAction, type LoginState } from "@/app/login/actions";
import { SubmitButton } from "@/components/SubmitButton";

type LoginFormProps = {
  nextPath: string;
};

const initialState: LoginState = {
  status: "idle",
  message: "",
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@apimonitor.local"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="********"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <SubmitButton label="Login" pendingLabel="Signing in..." className="w-full" />
      {state.status === "error" ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
