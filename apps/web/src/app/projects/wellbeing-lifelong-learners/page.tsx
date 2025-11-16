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

interface BrainstormIdea {
  id: string;
  concept: string;
  quality: 'high' | 'medium' | 'low';
  generatedBy: 'ai' | 'human' | 'hybrid';
  timestamp: string;
}

export default function WellbeingLifelongLearnersPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'First Learning Session', description: 'Completed your first structured learning session', icon: '📚', achieved: true, achievedAt: '2024-01-08' },
    { id: '2', title: 'AI Companion Active', description: 'Had 15 conversations with your AI companion', icon: '🤖', achieved: true, achievedAt: '2024-01-12' },
    { id: '3', title: 'Stress Management', description: 'Maintained stress levels below threshold for 7 days', icon: '🧘', achieved: false },
    { id: '4', title: 'Idea Generation', description: 'Generated 10 high-quality concepts this week', icon: '💡', achieved: false },
  ]);

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([
    { metric: 'Learning Consistency', userValue: 82, benchmarkValue: 58, percentile: 88, betterThan: '88% of lifelong learners' },
    { metric: 'Stress Management', userValue: 6.2, benchmarkValue: 7.8, percentile: 85, betterThan: '85% of adult learners' },
    { metric: 'Idea Quality', userValue: 8.5, benchmarkValue: 5.2, percentile: 90, betterThan: '90% of users' },
  ]);

  const [userStories, setUserStories] = useState<UserStory[]>([
    {
      id: '1',
      name: 'Robert Kim',
      avatar: '👨‍💼',
      title: 'Marketing Director + MBA Student',
      story: 'Struggled with idea fatigue while balancing work, family, and MBA studies. The AI companion learned my schedule and started suggesting brainstorming sessions during my commute. "You have 20 minutes. Want to brainstorm 3 marketing concepts?" These micro-sessions generated 15 high-quality ideas in a month.',
      result: 'Generated 15 high-quality ideas, reduced stress by 40%, maintained 85% learning consistency',
      metrics: [
        { label: 'Ideas Generated', value: '15' },
        { label: 'Stress Reduction', value: '-40%' },
        { label: 'Learning Consistency', value: '85%' },
      ],
    },
    {
      id: '2',
      name: 'Lisa Anderson',
      avatar: '👩',
      title: 'Nurse + Online Course Student',
      story: 'The AI companion helped me manage stress and sleep while juggling night shifts and online courses. It adapted to my irregular schedule and suggested mindfulness exercises when I was most stressed. "You usually feel overwhelmed at 2am after night shifts. Try this 5-minute breathing exercise."',
      result: 'Improved sleep quality by 35%, reduced stress by 50%, completed 3 online courses',
      metrics: [
        { label: 'Sleep Quality', value: '+35%' },
        { label: 'Stress Reduction', value: '-50%' },
        { label: 'Courses Completed', value: '3' },
      ],
    },
    {
      id: '3',
      name: 'Michael Chen',
      avatar: '👨',
      title: 'Engineer + Coding Bootcamp',
      story: 'Faced idea fatigue when trying to come up with project concepts for my bootcamp. The AI companion learned my interests and started suggesting personalized project ideas. "Based on your previous projects, here are 3 concepts that combine your interests in AI and sustainability." This helped me generate 8 project ideas in 2 weeks.',
      result: 'Generated 8 project ideas, improved learning consistency to 90%, reduced burnout',
      metrics: [
        { label: 'Project Ideas', value: '8' },
        { label: 'Learning Consistency', value: '90%' },
        { label: 'Burnout Reduction', value: '-60%' },
      ],
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', title: 'Daily Learning Streak', description: 'Complete learning sessions for 7 days', type: 'daily', trending: true, participants: 287 },
    { id: '2', title: 'Idea Generation', description: 'Generate 5 high-quality concepts this week', type: 'weekly', trending: true, participants: 198 },
    { id: '3', title: 'Stress Management', description: 'Keep stress levels below threshold for 5 days', type: 'weekly', trending: false, participants: 156 },
    { id: '4', title: 'AI Companion Chat', description: 'Have 10 conversations with your AI companion', type: 'weekly', trending: false, participants: 234 },
  ]);

  const [delightMoments, setDelightMoments] = useState<DelightMoment[]>([
    { id: '1', type: 'achievement', title: 'Learning Streak!', message: 'You\'ve completed 5 days in a row! 📚', icon: '📚', timestamp: '2 hours ago' },
    { id: '2', type: 'surprise', title: 'AI Idea Boost', message: 'Your AI companion generated 3 fresh concepts! 💡', icon: '💡', timestamp: '4 hours ago' },
    { id: '3', type: 'milestone', title: 'Stress Managed', message: 'You\'ve kept stress low for 5 days! 🧘', icon: '🧘', timestamp: '1 day ago' },
  ]);

  const [growthHooks, setGrowthHooks] = useState<GrowthHook[]>([
    { id: '1', type: 'referral', title: 'Refer a Learner', description: 'Invite another lifelong learner and both get premium', cta: 'Get Referral Link', value: 'Premium features' },
    { id: '2', type: 'viral', title: 'Share Your Idea', description: 'Post your best concept and inspire others', cta: 'Share Now', value: '+75 points' },
    { id: '3', type: 'onboarding', title: 'Complete Profile', description: 'Finish your profile to unlock AI companion', cta: 'Complete Profile', value: 'Unlock AI' },
    { id: '4', type: 'retention', title: 'Weekly Review', description: 'Review your progress weekly for insights', cta: 'Review Now', value: 'Week 3 of 4' },
  ]);

  const [aiCompanionTips, setAiCompanionTips] = useState<AICompanionTip[]>([
    { id: '1', message: 'I noticed you usually brainstorm best in the morning. Want to generate 3 concepts now?', context: 'Idea Generation', helpful: 5, timestamp: 'Just now' },
    { id: '2', message: 'Your stress levels are elevated. Based on your history, a 10-minute mindfulness session would help. Ready?', context: 'Stress Management', helpful: 5, timestamp: '15 min ago' },
    { id: '3', message: 'You\'ve been learning consistently! Here are 2 fresh concepts related to your current course.', context: 'Learning Support', helpful: 4, timestamp: '1 hour ago' },
  ]);

  const [brainstormIdeas, setBrainstormIdeas] = useState<BrainstormIdea[]>([
    { id: '1', concept: 'AI-powered learning path optimizer for career changers', quality: 'high', generatedBy: 'ai', timestamp: '2 hours ago' },
    { id: '2', concept: 'Micro-learning app that adapts to shift work schedules', quality: 'high', generatedBy: 'hybrid', timestamp: '5 hours ago' },
    { id: '3', concept: 'Community-driven project idea exchange for bootcamp students', quality: 'medium', generatedBy: 'human', timestamp: '1 day ago' },
  ]);

  const [kpiData, setKpiData] = useState({
    learningConsistency: 82,
    aiConversations: 18,
    ideasGenerated: 12,
    stressLevel: 6.2,
  });

  const [progressRings, setProgressRings] = useState({
    learning: 82,
    wellbeing: 75,
    creativity: 68,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    // Simulate animated KPIs
    const interval = setInterval(() => {
      setKpiData(prev => ({
        learningConsistency: prev.learningConsistency,
        aiConversations: prev.aiConversations + Math.floor(Math.random() * 2),
        ideasGenerated: prev.ideasGenerated + Math.floor(Math.random() * 2),
        stressLevel: Math.max(4, prev.stressLevel - Math.random() * 0.5),
      }));
    }, 5000);

    // Random celebration moments
    const celebrationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '📚 Learning streak maintained!',
          '💡 New high-quality idea generated!',
          '🧘 Stress levels managed successfully!',
          '🤖 Your AI companion has a new suggestion!',
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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📚 Everyday Wellbeing for Lifelong Learners
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-3xl">
            Light-touch tools that help people manage stress, sleep, or mindfulness on the go. 
            Designed for adults returning to structured learning while balancing life, career, and family. 
            Tackles idea fatigue with a personalized AI companion that adapts to user history and 
            generates fresh, high-quality concepts consistently.
          </p>
        </div>

        {/* Growth Hooks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {growthHooks.map((hook) => (
            <div
              key={hook.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer group"
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
                <span className="text-xs text-indigo-400 font-semibold">{hook.value}</span>
                <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">
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
            Personalized conversational AI that adapts to your learning history and generates fresh, high-quality concepts
          </p>
          <div className="space-y-3">
            {aiCompanionTips.map((tip) => (
              <div
                key={tip.id}
                className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-4 border border-indigo-500/30 hover:scale-105 transition-transform cursor-pointer"
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
                  <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">
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

        {/* Brainstorm Ideas Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">💡 Generated Ideas</h2>
          <p className="text-slate-300 text-sm mb-4">
            Fresh, high-quality concepts generated by your AI companion to combat idea fatigue
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {brainstormIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`bg-slate-900/50 rounded-lg p-4 border-2 hover:scale-105 transition-transform cursor-pointer ${
                  idea.quality === 'high' ? 'border-emerald-500/50 bg-emerald-900/10' :
                  idea.quality === 'medium' ? 'border-yellow-500/50 bg-yellow-900/10' :
                  'border-slate-600'
                }`}
                onClick={() => triggerDelightMoment('surprise', `💡 ${idea.quality} quality idea saved!`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    idea.quality === 'high' ? 'bg-emerald-900/50 text-emerald-300' :
                    idea.quality === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {idea.quality.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    idea.generatedBy === 'ai' ? 'bg-blue-900/50 text-blue-300' :
                    idea.generatedBy === 'hybrid' ? 'bg-purple-900/50 text-purple-300' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {idea.generatedBy}
                  </span>
                </div>
                <p className="text-white text-sm mb-2">{idea.concept}</p>
                <p className="text-xs text-slate-400">{idea.timestamp}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => triggerDelightMoment('achievement', '💡 3 new ideas generated!')}
          >
            Generate More Ideas
          </button>
        </div>

        {/* Animated KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'learningConsistency', label: 'Learning Consistency', icon: '📚', color: 'indigo', value: `${kpiData.learningConsistency}%` },
            { key: 'aiConversations', label: 'AI Conversations', icon: '🤖', color: 'purple', value: kpiData.aiConversations },
            { key: 'ideasGenerated', label: 'Ideas Generated', icon: '💡', color: 'emerald', value: kpiData.ideasGenerated },
            { key: 'stressLevel', label: 'Stress Level', icon: '🧘', color: 'blue', value: kpiData.stressLevel.toFixed(1) },
          ].map((kpi) => (
            <div
              key={kpi.key}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => triggerDelightMoment('achievement', `📈 ${kpi.label} improved!`)}
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
                    className="text-indigo-400 transition-all duration-1000"
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
                    ? 'border-indigo-500/50 bg-indigo-900/20'
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
                      <p className="text-xs text-indigo-400">Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</p>
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
                  <span className="text-sm text-indigo-400 font-semibold">
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
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${benchmark.percentile}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-400">
                    {benchmark.percentile}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Success Stories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">🌟 Lifelong Learner Success Stories</h2>
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
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3 mb-4">
                  <p className="text-indigo-300 text-sm font-semibold">{story.result}</p>
                </div>
                <div className="flex gap-4">
                  {story.metrics.map((metric, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-lg font-bold text-indigo-400">{metric.value}</div>
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
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
              <h3 className="font-semibold text-indigo-400 mb-2">Headline</h3>
              <p className="text-white text-lg">
                Everyday Wellbeing for Lifelong Learners
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Elevator Pitch</h3>
              <p className="text-slate-300">
                Light-touch tools that help people manage stress, sleep, or mindfulness on the go. 
                Designed for adults returning to structured learning while balancing life, career, and family. 
                Tackles idea fatigue with a personalized AI companion that adapts to user history and 
                generates fresh, high-quality concepts consistently.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Core Problem</h3>
              <p className="text-slate-300">
                Idea Fatigue: Struggle to consistently brainstorm fresh, high-quality concepts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Key Differentiator</h3>
              <p className="text-slate-300">
                AI Companion: Personalized advice generated by a conversational AI that adapts to user history. 
                Generates fresh, high-quality concepts to combat idea fatigue.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400 mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Stress Management: Light-touch tools for managing stress on the go</li>
                <li>Sleep Optimization: Tools to improve sleep quality for busy learners</li>
                <li>Mindfulness: Quick mindfulness exercises that fit into busy schedules</li>
                <li>AI Companion: Conversational AI that adapts to your learning history</li>
                <li>Idea Generation: Fresh, high-quality concepts to combat idea fatigue</li>
                <li>Learning Support: Tools to maintain consistency in structured learning</li>
                <li>Life Balance: Help balancing learning with life, career, and family</li>
                <li>AI-Human Hybrid: AI suggestions with human expert curation for trust</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-cyan-400 mb-2">Monetization</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Subscription tiers: Free, Pro ($24/mo), Premium ($59/mo)</li>
                <li>Premium templates marketplace: $14-$39 per template</li>
                <li>AI companion premium features: Advanced personalization</li>
                <li>Expert consultation: $120-$350 per session</li>
                <li>Referral rewards: Premium features for both referrer and referee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

