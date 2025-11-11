import Link from "next/link";

import { getPromptPacks } from "@idea-randomizer/core";

const learningTracks = [
  {
    id: "foundation",
    title: "AI Foundations For Makers",
    duration: "35 minutes",
    outcomes: [
      "Understand how prompt ingredients map to product strategy questions.",
      "Practice generating reproducible ideas using seeds and packs.",
      "Learn how to critique an AI-generated concept with human insight.",
    ],
  },
  {
    id: "workflow",
    title: "From Idea To Experiment Plan",
    duration: "45 minutes",
    outcomes: [
      "Translate generated ideas into customer discovery prompts.",
      "Draft MVP scopes using action checklists and validation loops.",
      "Decide when to add AI assistance vs. human touchpoints.",
    ],
  },
  {
    id: "team-sprint",
    title: "Facilitating AI Ideation Sprints",
    duration: "60 minutes",
    outcomes: [
      "Design collaborative sessions with packs, seeds, and remix rituals.",
      "Score ideas on impact, feasibility, and confidence with templates.",
      "Package results for leadership updates or investor teasers.",
    ],
  },
];

const practicePrompts = [
  {
    title: "Build your first AI concept card",
    steps: [
      "Pick a prompt pack and generate three ideas with different seeds.",
      "Highlight the problem, twist, and key tags that resonate most.",
      "Write a reflection: Where would you add human expertise?",
    ],
  },
  {
    title: "Diagnose signal vs. noise",
    steps: [
      "Filter by a new audience and regenerate with the same seed.",
      "Compare outcomes—what elements stayed consistent? Why?",
      "Log what additional data you’d need to validate the concept.",
    ],
  },
  {
    title: "Pitch and pre-mortem",
    steps: [
      "Copy the pitch, then list the top three risks using the checklist template.",
      "Add a success metric and a quick experiment you could run within a week.",
      "Share the code with a peer to co-create mitigation ideas.",
    ],
  },
];

export default function LearnPage() {
  const packs = getPromptPacks();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.16),_transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-12">
        <section className="flex flex-col gap-6 text-left">
          <Link
            href="/"
            className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-300/60 hover:text-white"
          >
            ← Back to Studio
          </Link>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Learn how AI thinks, while you build.
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            These guided tracks turn every idea you generate into a mini-lesson. You&apos;ll see how
            prompt packs, filters, and seeds shape the outcome—and how to apply that knowledge in
            real projects, from solo ventures to team workshops.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {learningTracks.map((track) => (
            <article
              key={track.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30"
            >
              <header className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Lesson
                </span>
                <h2 className="text-xl font-semibold text-white">{track.title}</h2>
                <span className="text-sm text-slate-400">{track.duration}</span>
              </header>
              <ul className="space-y-3 text-sm text-slate-200">
                {track.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/learn/${track.id}`}
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-300/70 hover:text-emerald-100"
              >
                View outline →
              </Link>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30">
          <header className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-white">Practice prompts</h2>
            <p className="text-sm text-slate-300">
              Pair these exercises with the generator to turn experimentation into a repeatable
              skill.
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            {practicePrompts.map((prompt) => (
              <article
                key={prompt.title}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-800/40 p-5"
              >
                <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
                <ol className="list-decimal space-y-2 pl-4 text-sm text-slate-200">
                  {prompt.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30 lg:grid-cols-[1fr,0.9fr]">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-white">Recommended prompt packs</h2>
            <p className="text-sm text-slate-300">
              Start with these collections to anchor your lessons in realistic AI-assisted scenarios.
              Each pack mirrors a real product pattern and includes an inspiration example you can
              dissect with your team.
            </p>
          </div>
          <div className="grid gap-3">
            {packs.slice(0, 3).map((pack) => (
              <article
                key={pack.id}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-50"
              >
                <header className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-white">{pack.title}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                    {pack.tags.join(" • ")}
                  </p>
                </header>
                <p className="mt-2 text-sm text-emerald-100">{pack.description}</p>
                {pack.inspiration && (
                  <p className="mt-3 text-xs text-emerald-200">
                    Inspiration: <span className="text-white">{pack.inspiration}</span>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-xl shadow-slate-950/30">
          <h2 className="text-2xl font-semibold text-white">
            Ready for a deeper dive or team session?
          </h2>
          <p className="text-sm text-slate-300">
            We run live, small-group labs where you practice the same flows with peers, guided by
            facilitators. You&apos;ll leave with annotated idea decks, feedback templates, and next
            steps.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
            >
              Explore workshops
            </Link>
            <Link
              href="mailto:hello@idearandomizer.app"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              Request a private cohort
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

