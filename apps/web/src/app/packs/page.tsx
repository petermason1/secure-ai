import Link from "next/link";

import { getPromptPacks } from "@idea-randomizer/core";

const packUseCases = [
  {
    title: "Launch an internal ideation sprint",
    bullets: [
      "Pick 2–3 packs aligned with strategic themes.",
      "Assign each participant a unique seed to encourage diversity.",
      "Use the talking points as discussion prompts during readouts.",
    ],
  },
  {
    title: "Client discovery & workshop prep",
    bullets: [
      "Generate idea variations tailored to the client’s industry.",
      "Export the pitch text into slides or discovery briefs.",
      "Capture feedback and new questions next to each idea code.",
    ],
  },
  {
    title: "Content & community programming",
    bullets: [
      "Run monthly community challenges anchored to a pack.",
      "Reward members who remix the same seed in creative ways.",
      "Bundle featured ideas into newsletters or social snippets.",
    ],
  },
];

export default function PacksPage() {
  const packs = getPromptPacks();

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.16),_transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-12">
        <section className="flex flex-col gap-6">
          <Link
            href="/"
            className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-300/60 hover:text-white"
          >
            ← Back to Studio
          </Link>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Prompt packs library</h1>
          <p className="max-w-3xl text-lg text-slate-300">
            Each pack captures a real product pattern—audiences, problems, twists, and tags tuned to
            spark differentiated ideas. Use them as teaching tools, workshop starters, or lab
            presets.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {packs.map((pack) => (
            <article
              key={pack.id}
              className="flex flex-col gap-4 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-xl shadow-emerald-500/20"
            >
              <header className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Pack
                </span>
                <h2 className="text-2xl font-semibold text-white">{pack.title}</h2>
                <p className="text-sm text-emerald-100">{pack.description}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  {pack.tags.join(", ")}
                </p>
              </header>
              {pack.inspiration && (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-emerald-100">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                    Inspiration
                  </h3>
                  <p className="mt-2 text-slate-100">{pack.inspiration}</p>
                </div>
              )}
              <footer className="mt-auto flex flex-wrap items-center gap-3 text-xs text-slate-200">
                <span>
                  Default theme:{" "}
                  <strong className="text-white">{pack.defaults.themeId ?? "varies"}</strong>
                </span>
                <span>
                  Audience:{" "}
                  <strong className="text-white">{pack.defaults.audienceId ?? "flexible"}</strong>
                </span>
                {pack.defaults.twistId && (
                  <span>
                    Twist: <strong className="text-white">{pack.defaults.twistId}</strong>
                  </span>
                )}
              </footer>
            </article>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30 lg:grid-cols-3">
          {packUseCases.map((useCase) => (
            <article key={useCase.title} className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">{useCase.title}</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                {useCase.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
          <h2 className="text-2xl font-semibold text-white">Need a custom prompt pack?</h2>
          <p className="text-sm text-slate-300">
            We co-create niche packs for agencies, incubators, and product teams. Share your niche
            or strategic focus and we’ll spin up a tailored set with guidance notes and success
            metrics.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="mailto:hello@idearandomizer.app?subject=Custom%20Prompt%20Pack"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
            >
              Request a pack
            </Link>
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              See workshops
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

