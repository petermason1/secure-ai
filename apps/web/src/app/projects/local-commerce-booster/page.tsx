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
  organization: string;
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

interface PartnerTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  popular: boolean;
  integrations: string[];
}

export default function LocalCommerceBoosterPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'First Business Partner', description: 'Connected your first local business', icon: '🏪', achieved: true, achievedAt: '2024-01-10' },
    { id: '2', title: '100 Active Volunteers', description: 'Reached 100 active volunteers in your program', icon: '👥', achieved: false },
    { id: '3', title: 'Template Marketplace', description: 'Published your first template', icon: '📝', achieved: true, achievedAt: '2024-01-18' },
    { id: '4', title: 'Community Impact', description: 'Generated $10K in local commerce', icon: '💰', achieved: false },
  ]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: 'Volunteer Engagement', userValue: 85, benchmarkValue: 62, percentile: 88, betterThan: '88% of non-profit programs' },
    { metric: 'Business Partnerships', userValue: 12, benchmarkValue: 7, percentile: 82, betterThan: '82% of program leads' },
    { metric: 'Community Participation', userValue: 450, benchmarkValue: 280, percentile: 90, betterThan: '90% of local programs' },
  ]);

  const [userStories, setUserStories] = useState<UserStory[]>([
    {
      id: '1',
      name: 'Maria Rodriguez',
      avatar: '👩‍💼',
      title: 'Community Program Director',
      organization: 'Downtown Food Bank',
      story: 'Struggled to connect local restaurants with our volunteer network. Used the partner marketplace to onboard 15 restaurants in 2 weeks. Applied the "loyalty rewards" template to create a points system that increased volunteer participation by 200%.',
      result: 'Connected 15 businesses, 200% volunteer growth, $25K in local commerce',
      metrics: [
        { label: 'Business Partners', value: '15' },
        { label: 'Volunteer Growth', value: '+200%' },
        { label: 'Local Commerce', value: '$25K' },
      ],
    },
    {
      id: '2',
      name: 'James Chen',
      avatar: '👨‍💼',
      title: 'Non-profit Coordinator',
      organization: 'Community Garden Initiative',
      story: 'Needed to scale from 20 to 200 volunteers. Used the "community scaling" template and AI suggestions to identify high-engagement neighborhoods. Partnered with local hardware stores and nurseries through the marketplace.',
      result: 'Scaled to 200 volunteers, 8 business partners, 5x program impact',
      metrics: [
        { label: 'Volunteers', value: '200' },
        { label: 'Business Partners', value: '8' },
        { label: 'Program Impact', value: '5x' },
      ],
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      avatar: '👩‍💻',
      title: 'Program Lead',
      organization: 'Youth Mentorship Program',
      story: 'Wanted to reward mentors and connect with local businesses. Used the "smart incentives" template to create a system where mentors earn points redeemable at partner businesses. Applied trend intelligence to identify which businesses would resonate most with mentors.',
      result: '95% mentor retention, 12 business partners, $15K in rewards distributed',
      metrics: [
        { label: 'Mentor Retention', value: '95%' },
        { label: 'Business Partners', value: '12' },
        { label: 'Rewards Distributed', value: '$15K' },
      ],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: 'Partner Onboarding Week', description: 'Onboard 5 new business partners this week', type: 'weekly', trending: true, participants: 142 },
    { id: '2', title: 'Volunteer Engagement', description: 'Increase volunteer participation by 20%', type: 'weekly', trending: false, participants: 89 },
    { id: '3', title: 'Template Creator', description: 'Create and publish your first template', type: 'weekly', trending: true, participants: 67 },
    { id: '4', title: 'Community Impact', description: 'Generate $5K in local commerce this month', type: 'weekly', trending: false, participants: 156 },
  ]);

  const [delightMoments, setDelightMoments] = useState<DelightMoment[]>([
    { id: '1', type: 'achievement', title: 'Partnership Milestone!', message: 'You\'ve connected 10 local businesses! 🎉', icon: '🎉', timestamp: '3 hours ago' },
    { id: '2', type: 'milestone', title: 'Template Success', message: 'Your template helped 5 other programs! 🌟', icon: '🌟', timestamp: '6 hours ago' },
    { id: '3', type: 'surprise', title: 'Community Growth', message: 'Your program just hit 500 participants! 📈', icon: '📈', timestamp: '1 day ago' },
  ]);

  const [growthHooks, setGrowthHooks] = useState<GrowthHook[]>([
    { id: '1', type: 'referral', title: 'Refer a Program Lead', description: 'Invite another non-profit and both get premium features', cta: 'Get Referral Link', value: 'Premium features' },
    { id: '2', type: 'viral', title: 'Share Your Impact', description: 'Post your community impact and inspire others', cta: 'Share Now', value: '+100 community points' },
    { id: '3', type: 'onboarding', title: 'Complete Setup', description: 'Finish onboarding to unlock marketplace access', cta: 'Complete Setup', value: 'Unlock marketplace' },
    { id: '4', type: 'retention', title: 'Weekly Check-in', description: 'Check in weekly for exclusive partner deals', cta: 'Check In', value: 'Week 3 of 4' },
  ]);

  const [partnerTemplates, setPartnerTemplates] = useState<PartnerTemplate[]>([
    { id: '1', name: 'Loyalty Rewards System', category: 'Engagement', description: 'Points-based rewards for volunteers and donors', price: 29, popular: true, integrations: ['Stripe', 'Square', 'Local POS'] },
    { id: '2', name: 'Business Partner Onboarding', category: 'Partnerships', description: 'Streamlined onboarding for local businesses', price: 49, popular: true, integrations: ['CRM', 'Email', 'SMS'] },
    { id: '3', name: 'Community Scaling Template', category: 'Growth', description: 'AI-powered scaling strategies for small groups', price: 79, popular: false, integrations: ['Analytics', 'Social Media'] },
    { id: '4', name: 'Smart Incentives Engine', category: 'Monetization', description: 'Dynamic incentive system based on engagement', price: 99, popular: true, integrations: ['Payment', 'Loyalty', 'CRM'] },
  ]);

  const [kpiData, setKpiData] = useState({
    businessPartners: 12,
    activeVolunteers: 85,
    templatesUsed: 3,
    localCommerce: 12500,
  });

  const [progressRings, setProgressRings] = useState({
    partnerships: 65,
    engagement: 78,
    impact: 72,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    // Simulate animated KPIs
    const interval = setInterval(() => {
      setKpiData(prev => ({
        businessPartners: prev.businessPartners,
        activeVolunteers: prev.activeVolunteers + Math.floor(Math.random() * 3),
        templatesUsed: prev.templatesUsed,
        localCommerce: prev.localCommerce + Math.floor(Math.random() * 500),
      }));
    }, 5000);

    // Random celebration moments
    const celebrationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '🎉 New business partner joined!',
          '🌟 Your template helped 3 programs today!',
          '🔥 Volunteer engagement up 15% this week!',
          '💪 $5K in local commerce generated!',
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
            🏪 Local Commerce Booster for Non-profit Program Leads
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Connects neighborhood businesses with loyal customers through smart incentives. 
            Designed for mission-driven operators coordinating volunteers, donors, and community programs. 
            Tackles translating small, motivated groups into wider participation and impact through a 
            partner marketplace with curated partners and templates.
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
            { key: 'businessPartners', label: 'Business Partners', icon: '🏪', color: 'emerald', value: kpiData.businessPartners },
            { key: 'activeVolunteers', label: 'Active Volunteers', icon: '👥', color: 'blue', value: kpiData.activeVolunteers },
            { key: 'templatesUsed', label: 'Templates Used', icon: '📝', color: 'yellow', value: kpiData.templatesUsed },
            { key: 'localCommerce', label: 'Local Commerce', icon: '💰', color: 'purple', value: `$${(kpiData.localCommerce / 1000).toFixed(1)}K` },
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

        {/* Partner Marketplace Templates */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🛒 Partner Marketplace Templates</h2>
          <p className="text-slate-300 text-sm mb-4">
            Curated templates and partners you can plug in instantly to expand capabilities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-slate-900/50 rounded-lg p-4 border-2 hover:scale-105 transition-transform cursor-pointer ${
                  template.popular ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-slate-700/50'
                }`}
                onClick={() => triggerDelightMoment('surprise', `📦 ${template.name} template added!`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      {template.popular && (
                        <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">
                          🔥 Popular
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{template.category}</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">${template.price}</div>
                </div>
                <p className="text-sm text-slate-300 mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.integrations.map((integration, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {integration}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Add Template
                </button>
              </div>
            ))}
          </div>
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

        {/* User Success Stories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌟 Program Lead Success Stories</h2>
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
                    <p className="text-xs text-slate-500">{story.organization}</p>
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
            See how your program's success ripples through the community - one connection leads to many
          </p>
          <div className="bg-slate-900/50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {['Business', 'Volunteer', 'Donor', 'Partner', 'Community'].map((type, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 flex items-center justify-center text-2xl mb-2 animate-pulse cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => triggerDelightMoment('surprise', `👤 ${type} connection made!`)}
                  >
                    {type === 'Business' ? '🏪' : type === 'Volunteer' ? '👥' : type === 'Donor' ? '💝' : type === 'Partner' ? '🤝' : '🌍'}
                  </div>
                  <div className="text-xs text-slate-400">{type}</div>
                  {i < 4 && (
                    <div className="text-emerald-400 text-2xl mt-2 animate-pulse">→</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-slate-300 text-sm">
                <span className="text-emerald-400 font-semibold">8 programs</span> have been inspired by your template this week
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
                  <div className="font-semibold text-white">Michael Thompson</div>
                  <div className="text-xs text-slate-400">Non-profit Strategy Expert • 10 years experience</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Specializes in community scaling and business partnerships. 
                Curates templates and partners based on your program's needs and goals.
              </p>
              <button
                className="text-xs text-emerald-400 hover:text-emerald-300"
                onClick={() => triggerDelightMoment('surprise', '💬 Connect with Michael Thompson!')}
              >
                View Full Profile →
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Expert Tip Overlay</h3>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-3">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Expert Tip:</strong> "Start with 3-5 local businesses in high-traffic areas. 
                  Use the loyalty rewards template to create immediate value for volunteers. 
                  Most programs see 50% engagement increase in the first month."
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
              <p className="text-xs text-slate-400 mb-3">What would make this better for your program?</p>
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
                Local Commerce Booster for Non-profit Program Leads
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Elevator Pitch</h3>
              <p className="text-slate-300">
                Connects neighborhood businesses with loyal customers through smart incentives. 
                Designed for mission-driven operators coordinating volunteers, donors, and community programs. 
                Tackles translating small, motivated groups into wider participation and impact through a 
                partner marketplace with curated partners and templates that users can plug in instantly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Core Problem</h3>
              <p className="text-slate-300">
                Community Scaling: Translating small, motivated groups into wider participation and impact.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Key Differentiator</h3>
              <p className="text-slate-300">
                Partner Marketplace via ecosystem and monetization. Curated partners and templates that 
                users can plug in to expand capabilities instantly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-pink-400 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Smart Incentives: Connect businesses with customers through reward systems</li>
                <li>Partner Marketplace: Curated templates and partners for instant expansion</li>
                <li>Volunteer Coordination: Manage volunteers, donors, and community programs</li>
                <li>Community Scaling: Tools to translate small groups into wider participation</li>
                <li>AI-Human Hybrid: AI suggestions with human expert curation for trust</li>
                <li>Template Library: Ready-to-use frameworks for common challenges</li>
                <li>Benchmarking: Compare your program to anonymized data</li>
                <li>Impact Tracking: Visualize community impact and growth</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Monetization</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Subscription tiers: Free, Pro ($49/mo), Premium ($149/mo)</li>
                <li>Premium templates marketplace: $29-$99 per template</li>
                <li>Partner marketplace fees: 10% transaction fee</li>
                <li>Expert consultation: $200-$500 per session</li>
                <li>Referral rewards: Premium features for both referrer and referee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

