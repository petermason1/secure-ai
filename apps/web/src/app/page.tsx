export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="uppercase tracking-[0.35em] text-slate-400 text-sm">
          Secure AI Control
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Governance-first launches. Two-week proof, then scale.
        </h1>
        <p className="text-slate-300">
          We help founders ship sensitive AI/crypto/BI workflows with human-in-loop controls
          and audit-ready evidence. Start with a 2‑week Audit Pack Sprint, then convert to a retainer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href="/sales-one-pager.html"
            className="rounded-full bg-white text-slate-900 px-6 py-3 font-semibold shadow-lg shadow-cyan-500/30 hover:bg-slate-200"
          >
            View the Offer
          </a>
          <a
            href="/contact.html?source=next-landing&offer=Audit%20Pack%20Sprint"
            className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:border-white"
          >
            Book 15‑min Scope Call
          </a>
        </div>
        <p className="text-slate-400 text-sm">
          Note: Agents, departments, and internal idea modules remain private and are not included in this app.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import IdeaStudio from "./components/IdeaStudio";

export default function Home() {
  // Redirect to landing page - keep idea generator private
  // Uncomment to make landing page the default:
  // redirect('/landing');
  
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.16),transparent_60%)]" />
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-8 lg:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 sm:h-10 sm:w-10 sm:text-base md:text-lg">
              IR
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200 sm:text-xs md:text-sm">
                Idea Randomizer
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-lg md:text-xl">
                Your AI concept co-pilot
              </h1>
            </div>
          </div>
          <nav className="flex w-full flex-col items-stretch gap-2 text-[11px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:text-xs md:w-auto md:flex-nowrap md:justify-end md:text-sm">
            <Link
              href="#how-it-works"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              How it works
            </Link>
            <Link
              href="/learn"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Learn AI
            </Link>
            <Link
              href="/packs"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Prompt packs
            </Link>
            <Link
              href="#faq"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              FAQ
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:px-4 sm:text-sm"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:text-emerald-100 sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/health-check"
              className="rounded-full border border-white/20 px-3 py-2 text-center text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:px-4"
            >
              Health Check
            </Link>
            <a
              href="https://github.com/petermason1/idea-gen"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow transition hover:bg-slate-100 sm:px-4 sm:text-sm"
            >
              View on GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="px-3 pb-12 pt-6 sm:px-5 md:pb-18 md:pt-10 lg:px-8">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-start gap-2.5 text-left sm:items-center sm:gap-4 sm:text-center">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 sm:px-4 sm:text-xs">
            Build faster
          </span>
          <h2 className="max-w-3xl text-[24px] font-semibold leading-snug text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Spin up thoughtful startup concepts and learn AI along the way.
          </h2>
          <p className="max-w-2xl text-[13px] leading-relaxed text-slate-300 sm:text-base md:text-lg">
            Blend curated prompts with smart randomization to explore new markets, surface
            differentiators, and create MVP-ready narratives. Each step explains the AI thinking so
            founders and teams build confidence, not just ideas.
          </p>
          <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <Link
              href="#workspace"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300 sm:w-auto sm:px-5 md:px-6 md:py-3"
            >
              Launch the studio
            </Link>
            <Link
              href="#faq"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200 sm:w-auto sm:px-5 md:px-6 md:py-3"
            >
              Learn more
            </Link>
            <Link
              href="/learn"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/80 hover:text-white sm:w-auto sm:px-5 md:px-6 md:py-3"
            >
              Explore AI lessons
            </Link>
          </div>
        </section>

        <section id="workspace" className="mt-10 sm:mt-14">
          <IdeaStudio />
        </section>

        <section
          id="how-it-works"
          className="mx-auto mt-12 grid w-full max-w-5xl gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-xl shadow-slate-950/30 sm:p-6 sm:gap-6 sm:rounded-3xl md:mt-20 md:grid-cols-3 md:p-8"
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
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-800/40 p-3 sm:gap-3 sm:p-5"
            >
              <h3 className="text-base font-semibold text-white sm:text-lg">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
            </article>
          ))}
        </section>

        <section
          id="faq"
          className="mx-auto mt-12 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-xl shadow-slate-950/30 sm:rounded-3xl sm:p-6 md:mt-20 md:p-8"
        >
          <h3 className="text-base font-semibold text-white sm:text-2xl">
            Frequently asked
          </h3>
          <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-6">
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
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-5 text-[11px] text-slate-400 sm:px-6 sm:text-sm lg:px-8">
          <p className="leading-relaxed">
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

