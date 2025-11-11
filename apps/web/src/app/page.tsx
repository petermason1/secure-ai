import Link from "next/link";

import IdeaStudio from "./components/IdeaStudio";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.16),_transparent_60%)]" />
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-emerald-950">
              IR
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Idea Randomizer</p>
              <h1 className="text-xl font-semibold text-white">Your AI concept co-pilot</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="#how-it-works"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              How it works
            </Link>
            <Link
              href="/learn"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              Learn AI
            </Link>
            <Link
              href="/packs"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              Prompt packs
            </Link>
            <Link
              href="#faq"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              FAQ
            </Link>
            <a
              href="https://github.com/petermason1/idea-gen"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-900 shadow hover:bg-slate-100"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="px-6 pb-24 pt-12 lg:px-8">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
            Build faster
          </span>
          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Spin up thoughtful startup concepts and learn AI along the way.
          </h2>
          <p className="max-w-2xl text-lg text-slate-300">
            Blend curated prompts with smart randomization to explore new markets, surface
            differentiators, and create MVP-ready narratives. Each step explains the AI thinking so
            founders and teams build confidence, not just ideas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="#workspace"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
            >
              Launch the studio
            </Link>
            <Link
              href="#faq"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              Learn more
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/80 hover:text-white"
            >
              Explore AI lessons
            </Link>
          </div>
        </section>

        <section id="workspace" className="mt-14">
          <IdeaStudio />
        </section>

        <section
          id="how-it-works"
          className="mx-auto mt-20 grid w-full max-w-5xl gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/30 md:grid-cols-3"
        >
          {[
            {
              title: "Curated prompt DNA",
              description:
                "Pick from tuned themes, audiences, problems, and twists inspired by real product playbooks. Blend them into a unique creative brief in seconds.",
            },
            {
              title: "Actionable idea decks",
              description:
                "Each generated concept includes a headline, pitch, and talking points you can drop straight into decks, docs, or client conversations.",
            },
            {
              title: "Save & remix",
              description:
                "Keep a local backlog of favourites, copy pitches to share instantly, and reroll with new angles whenever inspiration strikes.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-800/40 p-5"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <section
          id="faq"
          className="mx-auto mt-20 w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/30"
        >
          <h3 className="text-2xl font-semibold text-white">Frequently asked</h3>
          <div className="mt-6 space-y-6">
            <article>
              <h4 className="text-lg font-semibold text-emerald-200">
                Can I export or share these ideas?
              </h4>
              <p className="mt-2 text-sm text-slate-300">
                Yes—each idea comes with a ready-to-copy pitch summary. We plan to add PDF export and
                share links as part of the next milestone.
              </p>
            </article>
            <article>
              <h4 className="text-lg font-semibold text-emerald-200">
                Will the randomizer learn my preferences?
              </h4>
              <p className="mt-2 text-sm text-slate-300">
                Today it keeps everything local for speed. Once accounts land, it will refine
                suggestions using your saved history and industry focus.
              </p>
            </article>
            <article>
              <h4 className="text-lg font-semibold text-emerald-200">
                What&apos;s coming next?
              </h4>
              <p className="mt-2 text-sm text-slate-300">
                Up next: trend-aware prompt packs, market validation checklists, and collaborative
                workspaces. Follow the repo to watch features drop in.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-slate-400 lg:px-8">
          <p>
            © {new Date().getFullYear()} Idea Randomizer. Crafted for founders and product teams.
          </p>
          <a
            href="mailto:hello@idearandomizer.app"
            className="text-emerald-200 transition hover:text-emerald-300"
          >
            hello@idearandomizer.app
          </a>
        </div>
      </footer>
    </div>
  );
}
