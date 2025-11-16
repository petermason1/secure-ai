'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const USAGE_KEY = 'idea-generator:usage';
const FREE_LIMIT = 10;

type UsageData = {
  count: number;
  resetDate: string; // YYYY-MM-DD
};

const getUsage = (): UsageData => {
  if (typeof window === 'undefined') {
    return { count: 0, resetDate: new Date().toISOString().split('T')[0] };
  }

  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as UsageData;
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if it's a new month
      if (data.resetDate !== today) {
        const newData = { count: 0, resetDate: today };
        localStorage.setItem(USAGE_KEY, JSON.stringify(newData));
        return newData;
      }
      
      return data;
    }
  } catch {
    // Ignore errors
  }

  return { count: 0, resetDate: new Date().toISOString().split('T')[0] };
};

const incrementUsage = (): boolean => {
  const data = getUsage();
  if (data.count >= FREE_LIMIT) {
    return false; // At limit
  }
  
  const newData = { ...data, count: data.count + 1 };
  localStorage.setItem(USAGE_KEY, JSON.stringify(newData));
  return true; // Success
};

export const useUsage = () => {
  const [usage, setUsage] = useState<UsageData>({ count: 0, resetDate: '' });
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const data = getUsage();
    setUsage(data);
    
    // Check if user is Pro (you'll implement this with Stripe webhook later)
    // For now, check localStorage
    const proStatus = localStorage.getItem('idea-generator:pro') === 'true';
    setIsPro(proStatus);
  }, []);

  const canGenerate = isPro || usage.count < FREE_LIMIT;
  const remaining = isPro ? Infinity : Math.max(0, FREE_LIMIT - usage.count);

  const generate = () => {
    if (isPro) return true;
    return incrementUsage();
  };

  return {
    usage,
    isPro,
    canGenerate,
    remaining,
    generate,
    setPro: (pro: boolean) => {
      setIsPro(pro);
      localStorage.setItem('idea-generator:pro', String(pro));
    },
  };
};

export function UsageTracker() {
  const { usage, isPro, remaining, canGenerate } = useUsage();

  if (isPro) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm">
        <span className="text-emerald-400">✓ Pro Member</span>
        <span className="text-slate-400 ml-2">Unlimited ideas</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm">
      <span className="text-slate-300">
        {remaining} free {remaining === 1 ? 'idea' : 'ideas'} remaining this month
      </span>
    </div>
  );
}

export function UpgradePrompt() {
  const { remaining, canGenerate } = useUsage();

  if (canGenerate) {
    return null;
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-500 bg-slate-900/80 p-6 text-center">
      <h3 className="text-xl font-bold text-white mb-2">
        You've used all 10 free ideas!
      </h3>
      <p className="text-slate-300 mb-4">
        Upgrade to Pro for unlimited ideas and all features.
      </p>
      <Link
        href="/pricing"
        className="inline-block rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400"
      >
        Upgrade to Pro - £10/month
      </Link>
      <p className="text-xs text-slate-400 mt-3">
        First customer? Message us for 50% off!
      </p>
    </div>
  );
}

