'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

interface Benchmark {
  metric: string;
  userValue: number;
  benchmarkValue: number;
  percentile: number;
  betterThan: string;
}

interface UserStory {
  id: string;
  name: string;
  avatar: string;
  title: string;
  story: string;
  result: string;
  metrics: { label: string; value: string }[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  trending: boolean;
  participants: number;
}

interface DelightMoment {
  id: string;
  type: 'celebration' | 'surprise' | 'achievement' | 'milestone';
  title: string;
  message: string;
  icon: string;
  timestamp: string;
}

interface GrowthHook {
  id: string;
  type: 'referral' | 'viral' | 'onboarding' | 'retention';
  title: string;
  description: string;
  cta: string;
  value: string;
}

interface ContextualNudge {
  id: string;
  type: 'location' | 'calendar' | 'sensor';
  message: string;
  action: string;
  timestamp: string;
}

export default function FintechTrustLayerPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'First Budget Set', description: 'Created your first automated budget', icon: '💰', achieved: true, achievedAt: '2024-01-10' },
    { id: '2', title: 'Credit Building Active', description: 'Started credit building program', icon: '📈', achieved: true, achievedAt: '2024-01-15' },
    { id: '3', title: 'Contextual Nudge', description: 'Received 10 context-aware nudges', icon: '🔔', achieved: false },
    { id: '4', title: 'Side Hustle Tracked', description: 'Tracked side hustle income for 30 days', icon: '💼', achieved: false },
  ]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: 'Budget Adherence', userValue: 87, benchmarkValue: 62, percentile: 90, betterThan: '90% of side hustlers' },
    { metric: 'Credit Score Improvement', userValue: 45, benchmarkValue: 22, percentile: 85, betterThan: '85% of users' },
    { metric: 'Tool Consolidation', userValue: 3, benchmarkValue: 8, percentile: 92, betterThan: '92% of users' },
  ]);

  const [userStories, setUserStories] = useState<UserStory[]>([
    {
      id: '1',
      name: 'Jessica Park',
      avatar: '👩‍💼',
      title: 'Marketing Manager + Etsy Seller',
      story: 'Was drowning in 8 different financial apps. The real-world triggers changed everything - when I was near a coffee shop during work hours, it nudged: "You usually spend $5 here. Your side hustle goal needs $50 more this month. Skip today?" These context-aware nudges helped me save $200/month.',
      result: 'Consolidated to 1 app, saved $200/month, credit score +45 points',
      metrics: [
        { label: 'Apps Consolidated', value: '8 → 1' },
        { label: 'Monthly Savings', value: '$200' },
        { label: 'Credit Score', value: '+45 pts' },
      ],
    },
    {
      id: '2',
      name: 'Ryan Mitchell',
      avatar: '👨‍💻',
      title: 'Software Engineer + Freelancer',
      story: 'The calendar integration was a game-changer. When I had a client meeting, it automatically suggested: "You have $500 coming in from this client. Want to auto-allocate 30% to investments?" These contextual suggestions made financial management effortless.',
      result: 'Automated 60% of finances, invested $1.2K, credit score +38 points',
      metrics: [
        { label: 'Automation', value: '60%' },
        { label: 'Invested', value: '$1.2K' },
        { label: 'Credit Score', value: '+38 pts' },
      ],
    },
    {
      id: '3',
      name: 'Amanda Torres',
      avatar: '👩',
      title: 'Teacher + Online Tutor',
      story: 'Sensor data integration helped me understand my spending patterns. When my phone detected I was at a restaurant after 8pm (usually when I overspend), it nudged: "Late-night dining detected. Your budget has $30 left. Want to set a limit?" This transparency prevented $150 in overspending.',
      result: 'Prevented $150 overspending, built $500 emergency fund, credit +32 points',
      metrics: [
        { label: 'Overspending Prevented', value: '$150' },
        { label: 'Emergency Fund', value: '$500' },
        { label: 'Credit Score', value: '+32 pts' },
      ],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: 'Budget Master', description: 'Stick to your budget for 7 days', type: 'weekly', trending: true, participants: 312 },
    { id: '2', title: 'Credit Builder', description: 'Complete 5 credit-building actions', type: 'weekly', trending: true, participants: 245 },
    { id: '3', title: 'Tool Consolidator', description: 'Replace 3 old tools with our platform', type: 'weekly', trending: false, participants: 189 },
    { id: '4', title: 'Side Hustle Tracker', description: 'Track side hustle income for 30 days', type: 'weekly', trending: false, participants: 156 },
  ]);

  const [delightMoments, setDelightMoments] = useState<DelightMoment[]>([
    { id: '1', type: 'achievement', title: 'Budget Success!', message: 'You stuck to your budget for 5 days! 💰', icon: '💰', timestamp: '1 hour ago' },
    { id: '2', type: 'surprise', title: 'Contextual Nudge', message: 'Smart suggestion based on your location! 🔔', icon: '🔔', timestamp: '3 hours ago' },
    { id: '3', type: 'milestone', title: 'Credit Boost', message: 'Your credit score improved by 5 points! 📈', icon: '📈', timestamp: '1 day ago' },
  ]);

  const [growthHooks, setGrowthHooks] = useState<GrowthHook[]>([
    { id: '1', type: 'referral', title: 'Refer a Hustler', description: 'Invite another side hustler and both get premium', cta: 'Get Referral Link', value: 'Premium features' },
    { id: '2', type: 'viral', title: 'Share Your Win', description: 'Post your financial win and inspire others', cta: 'Share Now', value: '+100 points' },
    { id: '3', type: 'onboarding', title: 'Complete Setup', description: 'Finish setup to unlock all features', cta: 'Complete Setup', value: 'Unlock features' },
    { id: '4', type: 'retention', title: 'Weekly Review', description: 'Review your finances weekly for insights', cta: 'Review Now', value: 'Week 2 of 4' },
  ]);

  const [contextualNudges, setContextualNudges] = useState<ContextualNudge[]>([
    { id: '1', type: 'location', message: 'You\'re near your usual coffee shop. You\'ve spent $45 here this month. Your budget has $55 left. Skip today?', action: 'Skip & Save', timestamp: 'Just now' },
    { id: '2', type: 'calendar', message: 'You have a freelance payment coming in tomorrow ($800). Want to auto-allocate 20% to investments?', action: 'Set Auto-Allocate', timestamp: '10 min ago' },
    { id: '3', type: 'sensor', message: 'Late-night spending detected (10pm). Your usual pattern shows $30 overspending. Want to set a limit?', action: 'Set Limit', timestamp: '1 hour ago' },
  ]);

  const [kpiData, setKpiData] = useState({
    budgetAdherence: 87,
    creditScore: 720,
    toolsConsolidated: 3,
    contextualNudges: 24,
  });

  const [progressRings, setProgressRings] = useState({
    budget: 87,
    credit: 75,
    automation: 68,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    // Simulate animated KPIs
    const interval = setInterval(() => {
      setKpiData(prev => ({
        budgetAdherence: prev.budgetAdherence,
        creditScore: prev.creditScore + Math.floor(Math.random() * 2),
        toolsConsolidated: prev.toolsConsolidated,
        contextualNudges: prev.contextualNudges + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    // Random celebration moments
    const celebrationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '💰 Budget goal achieved!',
          '📈 Credit score improved!',
          '🔔 New contextual nudge available!',
          '💼 Side hustle income tracked!',
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        setCelebrationMessage(message);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(celebrationInterval);
    };
  }, []);

  const triggerDelightMoment = (type: string, message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
              <div className="text-4xl mb-2 text-center">{celebrationMessage}</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/project-ideas" 
            className="text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Project Ideas
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            💰 Fintech Trust Layer for Time-strapped Side Hustlers
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Helps consumers automate budgets, investments, and credit building with transparency. 
            Designed for people balancing a full-time job with a growing passion project. 
            Tackles signal vs noise with real-world triggers using location, calendar, or sensor data 
            to surface context-aware nudges.
          </p>
        </div>

        {/* Growth Hooks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {growthHooks.map((hook) => (
            <div
              key={hook.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group"
              onClick={() => triggerDelightMoment('surprise', `🎁 ${hook.value} unlocked!`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl group-hover:scale-110 transition-transform">{hook.type === 'referral' ? '🎁' : hook.type === 'viral' ? '📢' : hook.type === 'onboarding' ? '🚀' : '💎'}</div>
                <span className={`text-xs px-2 py-1 rounded ${
                  hook.type === 'referral' ? 'bg-green-900/50 text-green-300' :
                  hook.type === 'viral' ? 'bg-blue-900/50 text-blue-300' :
                  hook.type === 'onboarding' ? 'bg-purple-900/50 text-purple-300' :
                  'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {hook.type}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{hook.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{hook.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-semibold">{hook.value}</span>
                <button className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded transition-colors">
                  {hook.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Contextual Nudges Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🔔 Real-World Triggers & Contextual Nudges</h2>
          <p className="text-slate-300 text-sm mb-4">
            Location, calendar, and sensor data surface context-aware financial suggestions
          </p>
          <div className="space-y-3">
            {contextualNudges.map((nudge) => (
              <div
                key={nudge.id}
                className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4 border border-cyan-500/30 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => triggerDelightMoment('surprise', '💡 Nudge action taken!')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        nudge.type === 'location' ? 'bg-green-900/50 text-green-300' :
                        nudge.type === 'calendar' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-purple-900/50 text-purple-300'
                      }`}>
                        {nudge.type === 'location' ? '📍 Location' : nudge.type === 'calendar' ? '📅 Calendar' : '📱 Sensor'}
                      </span>
                      <span className="text-xs text-slate-400">{nudge.timestamp}</span>
                    </div>
                    <p className="text-white text-sm mb-2">{nudge.message}</p>
                  </div>
                </div>
                <button className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors">
                  {nudge.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Animated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'budgetAdherence', label: 'Budget Adherence', icon: '💰', color: 'cyan', value: `${kpiData.budgetAdherence}%` },
            { key: 'creditScore', label: 'Credit Score', icon: '📈', color: 'blue', value: kpiData.creditScore },
            { key: 'toolsConsolidated', label: 'Tools Consolidated', icon: '🔧', color: 'emerald', value: kpiData.toolsConsolidated },
            { key: 'contextualNudges', label: 'Contextual Nudges', icon: '🔔', color: 'purple', value: kpiData.contextualNudges },
          ].map((kpi) => (
            <div
              key={kpi.key}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => triggerDelightMoment('achievement', `📈 ${kpi.label} increased!`)}
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{kpi.icon}</div>
              <div className={`text-3xl font-bold text-${kpi.color}-400 animate-pulse`}>{kpi.value}</div>
              <div className="text-xs text-slate-400">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(progressRings).map(([key, value]) => (
            <div
              key={key}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 text-center hover:scale-105 transition-transform cursor-pointer"
              onClick={() => triggerDelightMoment('milestone', `🎯 ${key} progress: ${value}%!`)}
            >
              <h3 className="text-sm font-semibold text-slate-400 mb-4 capitalize">{key}</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - value / 100)}`}
                    className="text-cyan-400 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🎉 Milestones & Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                  milestone.achieved
                    ? 'border-cyan-500/50 bg-cyan-900/20'
                    : 'border-slate-600 bg-slate-700/30'
                }`}
                onClick={() => {
                  if (milestone.achieved) {
                    triggerDelightMoment('celebration', `🎉 ${milestone.title} achieved!`);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{milestone.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{milestone.title}</h3>
                    <p className="text-sm text-slate-300 mb-2">{milestone.description}</p>
                    {milestone.achieved && milestone.achievedAt && (
                      <p className="text-xs text-cyan-400">Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</p>
                    )}
                    {!milestone.achieved && (
                      <button
                        className="text-xs text-blue-400 hover:text-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDelightMoment('surprise', '🚀 Challenge started!');
                        }}
                      >
                        Start challenge →
                      </button>
                    )}
                  </div>
                  {milestone.achieved && (
                    <span className="text-2xl animate-pulse">✅</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmarks */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">📊 Benchmark Yourself</h2>
          <div className="space-y-4">
            {benchmarks.map((benchmark, i) => (
              <div
                key={i}
                className="bg-slate-900/50 rounded-lg p-4 hover:scale-102 transition-transform cursor-pointer"
                onClick={() => triggerDelightMoment('achievement', `🏆 You're in the top ${benchmark.percentile}%!`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{benchmark.metric}</span>
                  <span className="text-sm text-cyan-400 font-semibold">
                    Better than {benchmark.betterThan}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>You: {benchmark.userValue}</span>
                      <span>Average: {benchmark.benchmarkValue}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${benchmark.percentile}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {benchmark.percentile}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Success Stories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌟 Side Hustler Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userStories.map((story) => (
              <div
                key={story.id}
                className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50 hover:scale-105 transition-transform cursor-pointer group"
                onClick={() => triggerDelightMoment('surprise', `💡 Learn from ${story.name}'s journey!`)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{story.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{story.name}</h3>
                    <p className="text-sm text-slate-400">{story.title}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">{story.story}</p>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3 mb-4">
                  <p className="text-cyan-300 text-sm font-semibold">{story.result}</p>
                </div>
                <div className="flex gap-4">
                  {story.metrics.map((metric, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-lg font-bold text-cyan-400">{metric.value}</div>
                      <div className="text-xs text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Challenges */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🎯 Personalized Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer ${
                  challenge.trending
                    ? 'border-yellow-500/50 bg-yellow-900/20'
                    : 'border-slate-600 bg-slate-700/30'
                }`}
                onClick={() => triggerDelightMoment('surprise', `🎯 ${challenge.title} joined!`)}
              >
                {challenge.trending && (
                  <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded mb-2 inline-block animate-pulse">
                    🔥 Trending
                  </span>
                )}
                <h3 className="font-semibold text-white mb-2">{challenge.title}</h3>
                <p className="text-sm text-slate-300 mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">
                    {challenge.type === 'daily' ? '📅 Daily' : '📆 Weekly'}
                  </span>
                  <span className="text-xs text-blue-400">
                    {challenge.participants} participants
                  </span>
                </div>
                <button
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDelightMoment('achievement', '🚀 Challenge started!');
                  }}
                >
                  Join Challenge
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">📋 Project Overview</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Headline</h3>
              <p className="text-white text-lg">
                Fintech Trust Layer for Time-strapped Side Hustlers
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Elevator Pitch</h3>
              <p className="text-slate-300">
                Helps consumers automate budgets, investments, and credit building with transparency. 
                Designed for people balancing a full-time job with a growing passion project. 
                Tackles signal vs noise with real-world triggers using location, calendar, or sensor data 
                to surface context-aware nudges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Core Problem</h3>
              <p className="text-slate-300">
                Signal vs Noise: Wading through too many tools, guides, and templates to find relevant ones.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Key Differentiator</h3>
              <p className="text-slate-300">
                Real-World Triggers: Uses location, calendar, or sensor data to surface context-aware nudges. 
                Consolidates multiple tools into one transparent platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Automated Budgets: Set and track budgets automatically</li>
                <li>Investment Automation: Auto-allocate income to investments</li>
                <li>Credit Building: Transparent credit improvement programs</li>
                <li>Real-World Triggers: Location, calendar, and sensor-based nudges</li>
                <li>Tool Consolidation: Replace 8+ apps with one platform</li>
                <li>Transparency: Clear visibility into all financial decisions</li>
                <li>Context-Aware: Suggestions based on your actual behavior and location</li>
                <li>AI-Human Hybrid: AI suggestions with human expert curation for trust</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-pink-400 mb-2">Monetization</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Subscription tiers: Free, Pro ($29/mo), Premium ($79/mo)</li>
                <li>Premium templates marketplace: $19-$49 per template</li>
                <li>Investment platform fees: 0.5% on managed investments</li>
                <li>Expert consultation: $150-$400 per session</li>
                <li>Referral rewards: Premium features for both referrer and referee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

