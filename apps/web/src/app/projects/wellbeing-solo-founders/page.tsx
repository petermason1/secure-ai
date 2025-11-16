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

interface FounderStory {
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

export default function WellbeingSoloFoundersPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'First Habit Tracked', description: 'Tracked your first wellbeing habit', icon: '🎯', achieved: true, achievedAt: '2024-01-15' },
    { id: '2', title: 'Community Growth', description: 'Reached 10 community members', icon: '👥', achieved: false },
    { id: '3', title: 'Template Success', description: 'Created your first template', icon: '📝', achieved: true, achievedAt: '2024-01-20' },
    { id: '4', title: 'Trend Intel Used', description: 'Applied trend intelligence to your project', icon: '📊', achieved: false },
  ]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: 'Sleep Quality', userValue: 7.5, benchmarkValue: 6.2, percentile: 85, betterThan: '85% of tech founders' },
    { metric: 'Stress Level', userValue: 4.2, benchmarkValue: 6.8, percentile: 75, betterThan: '75% of solo founders' },
    { metric: 'Community Engagement', userValue: 12, benchmarkValue: 8, percentile: 90, betterThan: '90% of indie builders' },
  ]);

  const [founderStories, setFounderStories] = useState<FounderStory[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      title: 'Indie SaaS Builder',
      story: 'Used trend intelligence to identify a gap in solo founder mental health tools. Applied the "micro-community" template and scaled from 0 to 500 members in 3 months.',
      result: 'Launched "Founder Wellness" - now generating $2K MRR',
      metrics: [
        { label: 'Community Growth', value: '+500%' },
        { label: 'Revenue', value: '$2K MRR' },
        { label: 'Stress Reduction', value: '-40%' },
      ],
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      avatar: '👨‍💼',
      title: 'Solo Agency Owner',
      story: 'Struggled with burnout and solo scaling. Used the trend feed to spot "hybrid AI-human curation" as a rising pattern. Built a wellbeing dashboard that combines AI insights with human expert tips.',
      result: 'Reduced burnout by 60%, increased client capacity by 2x',
      metrics: [
        { label: 'Burnout Reduction', value: '-60%' },
        { label: 'Client Capacity', value: '+200%' },
        { label: 'Work-Life Balance', value: '+85%' },
      ],
    },
    {
      id: '3',
      name: 'Alex Kim',
      avatar: '👨‍💻',
      title: 'Solo Product Builder',
      story: 'Started tracking sleep and stress patterns. Discovered through benchmarking that his sleep was in the bottom 20%. Applied personalized challenges and expert tips to improve sleep quality by 2 hours.',
      result: 'Improved sleep by 2 hours, increased daily productivity by 35%',
      metrics: [
        { label: 'Sleep Improvement', value: '+2 hours' },
        { label: 'Productivity', value: '+35%' },
        { label: 'Energy Levels', value: '+50%' },
      ],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: '7-Day Habit Streak', description: 'Track one wellbeing habit for 7 consecutive days', type: 'daily', trending: true, participants: 234 },
    { id: '2', title: 'Community Connection', description: 'Engage with 5 other founders this week', type: 'weekly', trending: false, participants: 89 },
    { id: '3', title: 'Trend Intel Challenge', description: 'Apply one trend signal to your project', type: 'weekly', trending: true, participants: 156 },
    { id: '4', title: 'Expert Tip Feedback', description: 'Rate 3 expert tips this week', type: 'weekly', trending: false, participants: 67 },
  ]);

  const [delightMoments, setDelightMoments] = useState<DelightMoment[]>([
    { id: '1', type: 'achievement', title: 'Streak Master!', message: 'You\'ve tracked habits for 7 days straight! 🔥', icon: '🔥', timestamp: '2 hours ago' },
    { id: '2', type: 'milestone', title: 'Community Impact', message: 'Your template helped 3 other founders! 🌟', icon: '🌟', timestamp: '5 hours ago' },
    { id: '3', type: 'surprise', title: 'Trend Alert!', message: 'A trend you\'re tracking just spiked 40%! 📈', icon: '📈', timestamp: '1 day ago' },
  ]);

  const [growthHooks, setGrowthHooks] = useState<GrowthHook[]>([
    { id: '1', type: 'referral', title: 'Refer a Founder', description: 'Invite a fellow solo founder and both get 1 month free', cta: 'Get Referral Link', value: '1 month free' },
    { id: '2', type: 'viral', title: 'Share Your Win', description: 'Post your milestone and inspire others', cta: 'Share Now', value: '+50 community points' },
    { id: '3', type: 'onboarding', title: 'Complete Your Profile', description: 'Add your expertise to help other founders', cta: 'Complete Profile', value: 'Unlock expert mode' },
    { id: '4', type: 'retention', title: 'Weekly Check-in', description: 'Check in 4 weeks in a row for exclusive content', cta: 'Check In', value: 'Week 2 of 4' },
  ]);

  const [kpiData, setKpiData] = useState({
    habitsTracked: 12,
    communityMembers: 8,
    templatesCreated: 3,
    trendSignalsApplied: 5,
  });

  const [progressRings, setProgressRings] = useState({
    wellbeing: 72,
    community: 45,
    productivity: 68,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    // Simulate animated KPIs
    const interval = setInterval(() => {
      setKpiData(prev => ({
        habitsTracked: prev.habitsTracked + Math.floor(Math.random() * 2),
        communityMembers: prev.communityMembers,
        templatesCreated: prev.templatesCreated,
        trendSignalsApplied: prev.trendSignalsApplied + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    // Random celebration moments
    const celebrationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '🎉 You\'re in the top 10% of founders this week!',
          '🌟 Your community impact just reached a new level!',
          '🔥 5-day streak! You\'re on fire!',
          '💪 You\'ve helped 3 founders today - amazing!',
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
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            🌱 Everyday Wellbeing for Solo Founders
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            A digital wellbeing platform that blends founder pain points (stress, solo scaling, burnout) 
            with true digital intelligence. Actionable from day one with trend intelligence, community support, 
            and hybrid AI-human curation.
          </p>
        </div>

        {/* Growth Hooks - Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {growthHooks.map((hook) => (
            <div
              key={hook.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer group"
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
                <span className="text-xs text-emerald-400 font-semibold">{hook.value}</span>
                <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors">
                  {hook.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Delight Moments */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">✨ Recent Delight Moments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {delightMoments.map((moment) => (
              <div
                key={moment.id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 border border-slate-700/50 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => triggerDelightMoment(moment.type, moment.message)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{moment.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{moment.title}</h3>
                    <p className="text-xs text-slate-400">{moment.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{moment.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'habitsTracked', label: 'Habits Tracked', icon: '🎯', color: 'emerald', value: kpiData.habitsTracked },
            { key: 'communityMembers', label: 'Community Members', icon: '👥', color: 'blue', value: kpiData.communityMembers },
            { key: 'templatesCreated', label: 'Templates Created', icon: '📝', color: 'yellow', value: kpiData.templatesCreated },
            { key: 'trendSignalsApplied', label: 'Trend Signals Applied', icon: '📊', color: 'purple', value: kpiData.trendSignalsApplied },
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
                    className="text-emerald-400 transition-all duration-1000"
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
                    ? 'border-emerald-500/50 bg-emerald-900/20'
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
                      <p className="text-xs text-emerald-400">Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</p>
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
                  <span className="text-sm text-emerald-400 font-semibold">
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
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${benchmark.percentile}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {benchmark.percentile}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Stories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌟 Founder Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {founderStories.map((story) => (
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
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 mb-4">
                  <p className="text-emerald-300 text-sm font-semibold">{story.result}</p>
                </div>
                <div className="flex gap-4">
                  {story.metrics.map((metric, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-lg font-bold text-emerald-400">{metric.value}</div>
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
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
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

        {/* Community Impact Visualization */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌊 Community Impact Expansion</h2>
          <p className="text-slate-300 text-sm mb-4">
            See how actions ripple through the community - one founder's success inspires others
          </p>
          <div className="bg-slate-900/50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-2xl mb-2 animate-pulse cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => triggerDelightMoment('surprise', `👤 Founder ${i} inspired you!`)}
                  >
                    👤
                  </div>
                  <div className="text-xs text-slate-400">Founder {i}</div>
                  {i < 5 && (
                    <div className="text-emerald-400 text-2xl mt-2 animate-pulse">→</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-slate-300 text-sm">
                <span className="text-emerald-400 font-semibold">12 founders</span> have been inspired by community actions this week
              </p>
              <button
                className="mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                onClick={() => triggerDelightMoment('viral', '📢 Share your impact with the community!')}
              >
                Share Your Impact →
              </button>
            </div>
          </div>
        </div>

        {/* AI-Human Connection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🤝 AI-Human Hybrid Curation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer">
              <h3 className="font-semibold text-white mb-3">Curator Profile</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <div className="font-semibold text-white">Dr. Sarah Kim</div>
                  <div className="text-xs text-slate-400">Wellbeing Expert • 5 years experience</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Specializes in founder mental health and stress management. 
                Curates personalized content based on your activity patterns.
              </p>
              <button
                className="text-xs text-emerald-400 hover:text-emerald-300"
                onClick={() => triggerDelightMoment('surprise', '💬 Connect with Dr. Sarah Kim!')}
              >
                View Full Profile →
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Expert Tip Overlay</h3>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-3">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Expert Tip:</strong> "Track your sleep for 3 days to identify patterns. 
                  Most solo founders see improvement after adjusting their evening routine."
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors"
                  onClick={() => triggerDelightMoment('feedback', '👍 Thanks for the feedback!')}
                >
                  👍 Helpful
                </button>
                <button
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors"
                  onClick={() => triggerDelightMoment('feedback', '💬 We\'ll improve based on your feedback!')}
                >
                  💬 Rate this suggestion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Overlay System */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">💬 Feedback & Improvement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2 text-sm">Rate Suggestions</h3>
              <p className="text-xs text-slate-400 mb-3">Help us improve by rating AI and expert suggestions</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-yellow-400 hover:scale-110 transition-transform"
                    onClick={() => triggerDelightMoment('feedback', `⭐ ${star} star rating saved!`)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2 text-sm">Suggest Features</h3>
              <p className="text-xs text-slate-400 mb-3">What would make this better for you?</p>
              <button
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                onClick={() => triggerDelightMoment('surprise', '💡 Your suggestion has been submitted!')}
              >
                Submit Idea
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2 text-sm">Share Feedback</h3>
              <p className="text-xs text-slate-400 mb-3">Tell us about your experience</p>
              <button
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                onClick={() => triggerDelightMoment('feedback', '🙏 Thank you for your feedback!')}
              >
                Leave Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">📋 Project Overview</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Headline</h3>
              <p className="text-white text-lg">
                Everyday Wellbeing for Solo Founders: Stress-free scaling with trend intelligence
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Elevator Pitch</h3>
              <p className="text-slate-300">
                A digital wellbeing platform that helps solo founders manage stress, avoid burnout, 
                and scale their community intelligently. Combines AI-powered trend intelligence with 
                human expert curation, actionable templates, and a supportive community of fellow builders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Trend Intelligence Feed: Real-world signals for community growth and monetization</li>
                <li>Hybrid AI-Human Curation: Get both AI suggestions and expert human tips</li>
                <li>Actionable Templates: Ready-to-use frameworks for common founder challenges</li>
                <li>Community Support: Connect with other solo founders facing similar challenges</li>
                <li>Milestone Tracking: Visual progress indicators and achievement celebrations</li>
                <li>Benchmarking: Compare your metrics to anonymized founder data</li>
                <li>Personalized Challenges: Daily/weekly quests driven by trending signals</li>
                <li>Delight Moments: Surprise celebrations and micro-interactions</li>
                <li>Growth Hooks: Referral systems, viral mechanics, retention loops</li>
                <li>Feedback System: Rate suggestions, submit ideas, share experiences</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Monetization</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Subscription tiers: Free, Pro ($29/mo), Premium ($99/mo)</li>
                <li>Premium templates marketplace: $5-$50 per template</li>
                <li>Expert consultation: $150-$500 per session</li>
                <li>Community marketplace fees: 10% transaction fee</li>
                <li>Referral rewards: 1 month free for both referrer and referee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
