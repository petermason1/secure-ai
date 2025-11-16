'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.16),transparent_60%)]" />
      
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-4 sm:px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-emerald-950">
              IR
            </span>
            <span className="text-lg font-semibold text-white">Idea Randomizer</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
          >
            Back to Generator
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-12 sm:px-5 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">£0</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">10 ideas per month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Save & remix ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Export ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">No credit card required</span>
              </li>
            </ul>
            <Link
              href="/"
              className="block w-full rounded-full border border-white/20 bg-transparent px-6 py-3 text-center font-semibold text-white transition hover:border-emerald-300/60 hover:text-emerald-200"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-slate-900/80 p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
                MOST POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">£10</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-white font-semibold">Unlimited ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Cancel anytime</span>
              </li>
            </ul>
            <button
              onClick={() => {
                const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
                if (!priceId || priceId === 'price_placeholder') {
                  alert('Stripe not configured. Please add NEXT_PUBLIC_STRIPE_PRICE_ID to your .env.local file. See docs/2-HOUR-SETUP-GUIDE.md');
                  return;
                }
                handleSubscribe(priceId);
              }}
              disabled={loading}
              className="block w-full rounded-full bg-emerald-500 px-6 py-3 text-center font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
            <p className="text-xs text-slate-400 text-center mt-3">
              First customer? Message us for 50% off!
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            Questions? Need a custom plan?
          </p>
          <p className="text-sm text-slate-500">
            Email us or message on Twitter - we're here to help!
          </p>
        </div>
      </main>
    </div>
  );
}

