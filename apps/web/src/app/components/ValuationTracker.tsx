'use client';

import { useState, useEffect } from 'react';

type Feature = {
  name: string;
  value: number;
  reasoning: string;
  status: 'built' | 'planned';
};

type ValuationMetrics = {
  totalValue: number;
  features: Feature[];
  revenue: {
    current: number;
    projected12m: number;
    projected24m: number;
  };
  multiplier: number;
  lastUpdated: string;
};

export default function ValuationTracker() {
  const [metrics, setMetrics] = useState<ValuationMetrics>({
    totalValue: 0,
    features: [],
    revenue: { current: 0, projected12m: 0, projected24m: 0 },
    multiplier: 10,
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    calculateValuation();
  }, []);

  function calculateValuation() {
    const features: Feature[] = [
      {
        name: 'Idea Generator (Core Product)',
        value: 500000,
        reasoning: 'Validated MVP with 100+ users. Comparable to early-stage SaaS at £50k MRR × 10x multiple.',
        status: 'built'
      },
      {
        name: 'Validation Toolkit MVP',
        value: 250000,
        reasoning: 'Market validation feature. Adds £25k MRR potential. 10x multiple.',
        status: 'built'
      },
      {
        name: 'Tier 1: Invoice Processor',
        value: 1000000,
        reasoning: '£15-25k per client. 50 clients/year = £1M ARR. 10x multiple = £10M, discounted 90% for early stage.',
        status: 'built'
      },
      {
        name: 'Tier 2: Sales Automation Agent',
        value: 2000000,
        reasoning: '£100k per client. 100 clients/year = £10M ARR. 10x multiple = £100M, discounted 98% for early stage.',
        status: 'built'
      },
      {
        name: 'SQL Generator',
        value: 150000,
        reasoning: 'Developer tool. £10k MRR potential. 15x multiple (dev tools premium).',
        status: 'built'
      },
      {
        name: 'Domain Finder',
        value: 100000,
        reasoning: 'Utility tool. £5k MRR potential. 20x multiple (high margin).',
        status: 'built'
      },
      {
        name: 'Social Media Department (6 Agents)',
        value: 500000,
        reasoning: 'Agency replacement. £50k MRR potential (10 clients × £5k). 10x multiple.',
        status: 'built'
      },
      {
        name: 'Training Department',
        value: 300000,
        reasoning: 'EdTech SaaS. £30k MRR potential. 10x multiple.',
        status: 'built'
      },
      {
        name: 'Contact & Promotions Suite',
        value: 200000,
        reasoning: 'Email automation. £20k MRR potential. 10x multiple.',
        status: 'built'
      },
      {
        name: 'DECISION Meeting Service',
        value: 1000000,
        reasoning: '£100/meeting × 1000 meetings/month = £100k MRR. 10x multiple.',
        status: 'built'
      },
      {
        name: 'AI Agent Meeting Coordinator',
        value: 500000,
        reasoning: 'Enterprise coordination tool. £50k MRR potential. 10x multiple.',
        status: 'built'
      },
      {
        name: 'Global Documentation Library',
        value: 2000000,
        reasoning: 'DocuMerge AI + Migration-as-a-Service. £200k MRR potential (£5M + £10M Year 1 / 12). 10x multiple.',
        status: 'planned'
      },
      {
        name: '6 Marketing Agents (Failed Startup Targeting)',
        value: 780000,
        reasoning: '£15k/week revenue (30 conversions × £500/mo). £780k/year. 10x multiple, discounted 90%.',
        status: 'planned'
      },
      {
        name: 'Why.ai Blog + SEO',
        value: 500000,
        reasoning: 'Content marketing engine. Drives 50% of inbound leads. £50k MRR attribution. 10x multiple.',
        status: 'built'
      },
      {
        name: 'Ask Jeeves Enterprise',
        value: 5000000,
        reasoning: '£100k per client. 50 clients/year = £5M ARR. 10x multiple = £50M, discounted 90%.',
        status: 'planned'
      },
      {
        name: 'Why.ai Marketplace',
        value: 3000000,
        reasoning: 'eBay competitor. £300k MRR potential (10% take rate on £3M GMV). 10x multiple.',
        status: 'planned'
      },
      {
        name: 'Learning Affiliate Platform',
        value: 1000000,
        reasoning: 'Performance-based commissions. £100k MRR potential. 10x multiple.',
        status: 'planned'
      },
      {
        name: 'Job Board',
        value: 500000,
        reasoning: 'Recruitment fees. £50k MRR potential. 10x multiple.',
        status: 'planned'
      },
      {
        name: 'SmartRaceCards Integration',
        value: 200000,
        reasoning: 'Cross-promotion value. £20k MRR attribution. 10x multiple.',
        status: 'built'
      },
      {
        name: 'Underground Brand + £100k Service Positioning',
        value: 10000000,
        reasoning: 'Premium positioning. 100 clients × £100k = £10M ARR. 10x multiple = £100M, discounted 90%.',
        status: 'built'
      }
    ];

    const builtValue = features
      .filter(f => f.status === 'built')
      .reduce((sum, f) => sum + f.value, 0);

    const plannedValue = features
      .filter(f => f.status === 'planned')
      .reduce((sum, f) => sum + f.value, 0);

    const totalValue = builtValue + (plannedValue * 0.3); // Discount planned features by 70%

    const projectedMRR12m = 500000; // Conservative: £500k MRR in 12 months
    const projectedMRR24m = 2000000; // Aggressive: £2M MRR in 24 months

    setMetrics({
      totalValue: Math.round(totalValue),
      features,
      revenue: {
        current: 0,
        projected12m: projectedMRR12m * 12,
        projected24m: projectedMRR24m * 12
      },
      multiplier: 10,
      lastUpdated: new Date().toISOString()
    });
  }

  const builtFeatures = metrics.features.filter(f => f.status === 'built');
  const plannedFeatures = metrics.features.filter(f => f.status === 'planned');
  const builtValue = builtFeatures.reduce((sum, f) => sum + f.value, 0);
  const plannedValue = plannedFeatures.reduce((sum, f) => sum + f.value, 0);

  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-emerald-200 mb-2">
          Current Valuation: £{(metrics.totalValue / 1000000).toFixed(2)}M
        </h2>
        <p className="text-sm text-slate-400">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400 mb-1">Built Features</p>
          <p className="text-2xl font-bold text-white">£{(builtValue / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-emerald-300 mt-1">{builtFeatures.length} features live</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400 mb-1">Planned (30% value)</p>
          <p className="text-2xl font-bold text-white">£{(plannedValue * 0.3 / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-yellow-300 mt-1">{plannedFeatures.length} features planned</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400 mb-1">12-Month ARR Target</p>
          <p className="text-2xl font-bold text-white">£{(metrics.revenue.projected12m / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-slate-400 mt-1">10x multiple = £{(metrics.revenue.projected12m * metrics.multiplier / 1000000).toFixed(0)}M</p>
        </div>
      </div>

      <details className="rounded-lg border border-white/10 bg-slate-900/40 p-4 mb-4">
        <summary className="cursor-pointer font-semibold text-white">
          Built Features ({builtFeatures.length}) - £{(builtValue / 1000000).toFixed(2)}M
        </summary>
        <div className="mt-4 space-y-3">
          {builtFeatures.map((feature, i) => (
            <div key={i} className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-white">{feature.name}</p>
                <p className="text-emerald-300 font-bold whitespace-nowrap">
                  £{(feature.value / 1000).toFixed(0)}k
                </p>
              </div>
              <p className="text-xs text-slate-400">{feature.reasoning}</p>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
        <summary className="cursor-pointer font-semibold text-white">
          Planned Features ({plannedFeatures.length}) - £{(plannedValue / 1000000).toFixed(2)}M (30% value)
        </summary>
        <div className="mt-4 space-y-3">
          {plannedFeatures.map((feature, i) => (
            <div key={i} className="rounded-lg border border-yellow-400/20 bg-yellow-500/5 p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-white">{feature.name}</p>
                <p className="text-yellow-300 font-bold whitespace-nowrap">
                  £{(feature.value * 0.3 / 1000).toFixed(0)}k
                </p>
              </div>
              <p className="text-xs text-slate-400">{feature.reasoning}</p>
            </div>
          ))}
        </div>
      </details>

      <div className="mt-6 rounded-lg border border-white/10 bg-slate-900/60 p-4">
        <h3 className="font-semibold text-white mb-3">Valuation Methodology</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• <strong>SaaS Multiple:</strong> 10x ARR (industry standard for early-stage)</li>
          <li>• <strong>Built Features:</strong> 100% value (live and generating potential revenue)</li>
          <li>• <strong>Planned Features:</strong> 30% value (discounted for execution risk)</li>
          <li>• <strong>Revenue Projections:</strong> Based on comparable SaaS companies at similar stage</li>
          <li>• <strong>Enterprise Positioning:</strong> £100k service tier adds significant premium</li>
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
        <h3 className="font-semibold text-emerald-200 mb-2">Next Milestone: £50M Valuation</h3>
        <p className="text-sm text-slate-300 mb-3">
          To reach £50M valuation, we need £5M ARR (£417k MRR) at 10x multiple.
        </p>
        <p className="text-sm text-slate-300">
          <strong>Path:</strong> Launch 6 Marketing Agents → 30 conversions/week × £500/mo = £60k MRR. 
          Scale to 100 conversions/week = £200k MRR. Add enterprise clients (10 × £100k/year) = £83k MRR. 
          Total: £283k MRR → £3.4M ARR → £34M valuation. Launch Ask Jeeves (£100k MRR) → £5M ARR → £50M valuation.
        </p>
      </div>
    </div>
  );
}
