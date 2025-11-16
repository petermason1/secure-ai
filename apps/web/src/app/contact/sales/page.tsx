"use client";

import { FormEvent, useState } from "react";

export default function SalesContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: "name" | "email" | "message", value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
          source: "Sales Intake",
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Failed to submit request");
      }

      setStatus("success");
      setFormState({ name: "", email: "", message: "" });
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-900/50">
        <p className="uppercase tracking-[0.3em] text-xs text-slate-400 mb-4">
          Sales Control Desk
        </p>
        <h1 className="text-4xl font-semibold mb-4">Talk to the Revenue Team</h1>
        <p className="text-slate-400 mb-8">
          Pipe your opportunity straight into Airtable so Sales Ops and the founder team can
          review, score, and schedule the next steps manually.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Name</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none"
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none"
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">What would you like to build?</label>
            <textarea
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none min-h-[150px]"
              value={formState.message}
              onChange={(event) => handleChange("message", event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-emerald-400/90 text-slate-950 font-semibold py-3 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Send to Sales"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 text-emerald-300">
            Logged in Airtable. We’ll assign a sales engineer and reply manually.
          </p>
        )}

        {status === "error" && (
          <p className="mt-4 text-rose-400">
            Something went wrong: {errorMessage || "Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}


