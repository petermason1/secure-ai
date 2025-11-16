"use client";

import { FormEvent, useState } from "react";

export default function DesignContactPage() {
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
          source: "Design Intake",
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
          Design Studio
        </p>
        <h1 className="text-4xl font-semibold mb-4">Brief the Experience Team</h1>
        <p className="text-slate-400 mb-8">
          Tell us what you want your Cragside room or interface to feel like. Every request
          goes to the design pod in Airtable for triage and concepting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Name</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-indigo-400 focus:outline-none"
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-indigo-400 focus:outline-none"
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Vision / Brief</label>
            <textarea
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-slate-100 focus:border-indigo-400 focus:outline-none min-h-[150px]"
              value={formState.message}
              onChange={(event) => handleChange("message", event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl bg-indigo-400/90 text-slate-950 font-semibold py-3 shadow-lg shadow-indigo-400/30 transition hover:bg-indigo-300 disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Send to Design"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 text-emerald-300">
            Logged in Airtable. The studio will review and follow up with sketches.
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


