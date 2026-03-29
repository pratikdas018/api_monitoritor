"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  label,
  pendingLabel = "Working...",
  className = "",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`btn-primary rounded-btn px-4 py-2.5 text-sm font-semibold transition duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
