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

interface AICompanionTip {
  id: string;
  message: string;
  context: string;
  helpful: number;
  timestamp: string;
}

export default function CommerceBoosterNewParentsPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'First Setup Complete', description: 'Completed onboarding without dropping off', icon: '🎯', achieved: true, achievedAt: '2024-01-12' },
    { id: '2', title: 'AI Companion Active', description: 'Had 10 conversations with your AI companion', icon: '🤖', achieved: true, achievedAt: '2024-01-15' },
    { id: '3', title: 'First Business Connection', description: 'Connected with your first local business', icon: '🏪', achieved: false },
    { id: '4', title: 'Routine Established', description: 'Maintained routine for 7 days straight', icon: '📅', achieved: false },
  ]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: 'Onboarding Completion', userValue: 95, benchmarkValue: 68, percentile: 92, betterThan: '92% of new parent apps' },
    { metric: 'AI Engagement', userValue: 8.5, benchmarkValue: 4.2, percentile: 88, betterThan: '88% of users' },
    { metric: 'Routine Adherence', userValue: 78, benchmarkValue: 52, percentile: 85, betterThan: '85% of new parents' },
  ]);

  const [userStories, setUserStories] = useState<UserStory[]>([
    {
      id: '1',
      name: 'Emma Thompson',
      avatar: '👩',
      title: 'New Mom (3 months)',
      story: 'Was about to give up on the app after 2 days - too overwhelming. The AI companion noticed I was struggling and sent a gentle nudge: "Let\'s just set up one thing today - baby feeding reminders." That one simple step kept me engaged, and now I use it daily.',
      result: '95% onboarding completion, 30-day retention, 5 local businesses connected',
      metrics: [
        { label: 'Onboarding', value: '95%' },
        { label: 'Retention', value: '30 days' },
        { label: 'Businesses', value: '5' },
      ],
    },
    {
      id: '2',
      name: 'David Martinez',
      avatar: '👨',
      title: 'New Dad (6 months)',
      story: 'The AI companion learned my schedule and started suggesting local businesses when I was near them. "You\'re near the coffee shop - they have a parent-friendly area and 20% off for app users." These context-aware nudges made all the difference.',
      result: '88% routine adherence, $200 saved through local deals, 8 businesses connected',
      metrics: [
        { label: 'Routine Adherence', value: '88%' },
        { label: 'Savings', value: '$200' },
        { label: 'Businesses', value: '8' },
      ],
    },
    {
      id: '3',
      name: 'Sophie Chen',
      avatar: '👩',
      title: 'New Mom (1 year)',
      story: 'The personalized AI companion adapted to my changing needs. When I was sleep-deprived, it simplified everything. As I got more comfortable, it gradually introduced more features. This adaptive approach prevented me from churning.',
      result: '1 year retention, 12 businesses connected, $500 in local savings',
      metrics: [
        { label: 'Retention', value: '1 year' },
        { label: 'Businesses', value: '12' },
        { label: 'Savings', value: '$500' },
      ],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: 'Complete Onboarding', description: 'Finish setup in 3 simple steps', type: 'daily', trending: true, participants: 234 },
    { id: '2', title: 'AI Companion Chat', description: 'Have 5 conversations with your AI companion', type: 'weekly', trending: true, participants: 189 },
    { id: '3', title: 'Routine Streak', description: 'Maintain your routine for 7 days', type: 'weekly', trending: false, participants: 156 },
    { id: '4', title: 'Local Connection', description: 'Connect with 3 local businesses', type: 'weekly', trending: false, participants: 98 },
  ]);

  const [delightMoments, setDelightMoments] = useState<DelightMoment[]>([
    { id: '1', type: 'achievement', title: 'Onboarding Complete!', message: 'You completed setup without dropping off! 🎉', icon: '🎉', timestamp: '2 hours ago' },
    { id: '2', type: 'surprise', title: 'AI Nudge', message: 'Your AI companion noticed you needed help! 🤖', icon: '🤖', timestamp: '5 hours ago' },
    { id: '3', type: 'milestone', title: 'Routine Established', message: 'You\'ve maintained your routine for 5 days! 📅', icon: '📅', timestamp: '1 day ago' },
  ]);

  const [growthHooks, setGrowthHooks] = useState<GrowthHook[]>([
    { id: '1', type: 'referral', title: 'Refer a Parent', description: 'Invite another new parent and both get premium', cta: 'Get Referral Link', value: 'Premium features' },
    { id: '2', type: 'viral', title: 'Share Your Win', description: 'Post your routine success and inspire others', cta: 'Share Now', value: '+50 points' },
    { id: '3', type: 'onboarding', title: 'Complete Profile', description: 'Finish your profile to unlock AI companion', cta: 'Complete Profile', value: 'Unlock AI' },
    { id: '4', type: 'retention', title: 'Daily Check-in', description: 'Check in 7 days in a row for exclusive deals', cta: 'Check In', value: 'Day 4 of 7' },
  ]);

  const [aiCompanionTips, setAiCompanionTips] = useState<AICompanionTip[]>([
    { id: '1', message: 'I noticed you haven\'t set up feeding reminders yet. Want me to help you do that in 30 seconds?', context: 'Onboarding', helpful: 4, timestamp: 'Just now' },
    { id: '2', message: 'You\'re near 3 parent-friendly businesses! Want to see deals?', context: 'Location-based', helpful: 5, timestamp: '10 min ago' },
    { id: '3', message: 'Great job maintaining your routine! You\'re on a 5-day streak. 🎉', context: 'Encouragement', helpful: 5, timestamp: '1 hour ago' },
  ]);

  const [kpiData, setKpiData] = useState({
    onboardingCompletion: 95,
    aiConversations: 12,
    businessesConnected: 5,
    routineAdherence: 78,
  });

  const [progressRings, setProgressRings] = useState({
    onboarding: 95,
    engagement: 82,
    retention: 75,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    // Simulate animated KPIs
    const interval = setInterval(() => {
      setKpiData(prev => ({
        onboardingCompletion: prev.onboardingCompletion,
        aiConversations: prev.aiConversations + Math.floor(Math.random() * 2),
        businessesConnected: prev.businessesConnected,
        routineAdherence: prev.routineAdherence + Math.floor(Math.random() * 3),
      }));
    }, 5000);

    // Random celebration moments
    const celebrationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '🎉 Onboarding complete! You did it!',
          '🤖 Your AI companion has a new tip for you!',
          '📅 3-day routine streak - amazing!',
          '🏪 New local business deal available!',
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
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            👶 Local Commerce Booster for New Parents
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Connects neighborhood businesses with loyal customers through smart incentives. 
            Designed for sleep-deprived caregivers juggling routines, self-care, and schedules. 
            Tackles onboarding drop-off with a personalized AI companion that adapts to user history 
            and provides gentle nudges to prevent churn.
          </p>
        </div>

        {/* Growth Hooks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {growthHooks.map((hook) => (
            <div
              key={hook.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-pink-500/50 transition-all cursor-pointer group"
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
                <span className="text-xs text-pink-400 font-semibold">{hook.value}</span>
                <button className="text-xs bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded transition-colors">
                  {hook.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Companion Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🤖 Your AI Companion</h2>
          <p className="text-slate-300 text-sm mb-4">
            Personalized conversational AI that adapts to your history and provides gentle nudges to prevent churn
          </p>
          <div className="space-y-3">
            {aiCompanionTips.map((tip) => (
              <div
                key={tip.id}
                className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-lg p-4 border border-pink-500/30 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => triggerDelightMoment('surprise', '💬 AI companion tip saved!')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-sm mb-1">{tip.message}</p>
                    <span className="text-xs text-slate-400">{tip.context} • {tip.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${star <= tip.helpful ? 'text-yellow-400' : 'text-slate-600'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="text-xs bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded transition-colors">
                    👍 Helpful
                  </button>
                  <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                    💬 Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'onboardingCompletion', label: 'Onboarding Completion', icon: '🎯', color: 'pink', value: `${kpiData.onboardingCompletion}%` },
            { key: 'aiConversations', label: 'AI Conversations', icon: '🤖', color: 'purple', value: kpiData.aiConversations },
            { key: 'businessesConnected', label: 'Businesses Connected', icon: '🏪', color: 'emerald', value: kpiData.businessesConnected },
            { key: 'routineAdherence', label: 'Routine Adherence', icon: '📅', color: 'blue', value: `${kpiData.routineAdherence}%` },
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
                    className="text-pink-400 transition-all duration-1000"
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
                    ? 'border-pink-500/50 bg-pink-900/20'
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
                      <p className="text-xs text-pink-400">Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</p>
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
                  <span className="text-sm text-pink-400 font-semibold">
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
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${benchmark.percentile}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-pink-400">
                    {benchmark.percentile}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Success Stories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌟 New Parent Success Stories</h2>
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
                <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3 mb-4">
                  <p className="text-pink-300 text-sm font-semibold">{story.result}</p>
                </div>
                <div className="flex gap-4">
                  {story.metrics.map((metric, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-lg font-bold text-pink-400">{metric.value}</div>
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
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
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
              <h3 className="font-semibold text-pink-400 mb-2">Headline</h3>
              <p className="text-white text-lg">
                Local Commerce Booster for New Parents
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Elevator Pitch</h3>
              <p className="text-slate-300">
                Connects neighborhood businesses with loyal customers through smart incentives. 
                Designed for sleep-deprived caregivers juggling routines, self-care, and schedules. 
                Tackles onboarding drop-off with a personalized AI companion that adapts to user history 
                and provides gentle nudges to prevent churn.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Core Problem</h3>
              <p className="text-slate-300">
                Onboarding Drop-off: People churn before reaching 'aha' moments due to overwhelming setup or lack of nudges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Key Differentiator</h3>
              <p className="text-slate-300">
                AI Companion: Personalized advice generated by a conversational AI that adapts to user history. 
                Provides gentle nudges and context-aware suggestions to prevent churn.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>AI Companion: Conversational AI that adapts to your history and needs</li>
                <li>Gentle Nudges: Context-aware reminders to prevent churn</li>
                <li>Simplified Onboarding: 3-step setup process to prevent drop-off</li>
                <li>Local Business Connections: Connect with parent-friendly businesses</li>
                <li>Routine Management: Help juggle routines, self-care, and schedules</li>
                <li>Adaptive Interface: Simplifies when you're overwhelmed, expands as you grow</li>
                <li>AI-Human Hybrid: AI suggestions with human expert curation for trust</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Monetization</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Subscription tiers: Free, Pro ($19/mo), Premium ($49/mo)</li>
                <li>Premium templates marketplace: $9-$29 per template</li>
                <li>Partner marketplace fees: 10% transaction fee</li>
                <li>Expert consultation: $100-$300 per session</li>
                <li>Referral rewards: Premium features for both referrer and referee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

