import Link from 'next/link';

const BLOG_POSTS = [
  {
    slug: 'why-startups-fail-and-how-ai-could-save-them',
    title: 'Why Startups Fail (And How AI Could Save Them)',
    excerpt: 'We analyzed 100 failed startups. 87% could have been saved with better idea validation. Here\'s what we found.',
    date: '2025-11-13',
    author: 'Why.ai Research Team',
    readTime: '8 min read',
    tags: ['Startups', 'AI', 'Validation', 'Market Research']
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
            Why.ai Blog
          </h1>
          <p className="text-xl text-slate-300">
            Insights on AI, startups, and building products that actually work.
          </p>
        </header>

        <div className="space-y-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="rounded-xl border border-white/10 bg-slate-900/60 p-6 hover:border-emerald-400/30 transition">
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 hover:text-emerald-400 transition">
                  {post.title}
                </h2>
                <p className="text-slate-300 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
