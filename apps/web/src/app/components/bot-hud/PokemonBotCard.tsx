/**
 * PokemonBotCard Component
 * 
 * Pokemon card-style bot profile with:
 * - Visual avatar and rarity badge
 * - Stat bars (Power, Urgency, Accuracy, etc.)
 * - Special Moves/Powers section
 * - Level and evolution indicators
 * - Collectible card styling
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { Sparkline } from './Sparkline';

interface PokemonBot {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  specialty?: string;
  effort_metrics?: {
    effort_score: number;
    priority_boost: number;
    focus_boost: number;
    total_hours: number;
    resources: number;
  };
  level?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  evolution_stage?: number;
}

interface PokemonBotCardProps {
  bot: PokemonBot;
  onActivatePower?: (botId: string, power: string) => void;
  onLevelUp?: (botId: string) => void;
  onTrade?: (botId: string) => void;
}

const RARITY_COLORS = {
  common: 'border-slate-500 bg-slate-800',
  rare: 'border-blue-500 bg-blue-900/20',
  epic: 'border-purple-500 bg-purple-900/20',
  legendary: 'border-yellow-500 bg-yellow-900/20',
};

const RARITY_BADGES = {
  common: '⚪ Common',
  rare: '🔵 Rare',
  epic: '🟣 Epic',
  legendary: '⭐ Legendary',
};

export function PokemonBotCard({ bot, onActivatePower, onLevelUp, onTrade }: PokemonBotCardProps) {
  const [showPowers, setShowPowers] = useState(false);

  // Calculate stats from effort metrics
  const power = bot.effort_metrics?.effort_score || 0; // 0-100
  const urgency = bot.effort_metrics?.priority_boost || 0; // 0-100
  const accuracy = bot.effort_metrics?.focus_boost || 50; // 0-100
  const stamina = bot.effort_metrics?.total_hours || 0; // hours
  const level = bot.level || Math.floor(power / 10) + 1;

  // Determine rarity based on effort score
  const rarity = bot.rarity || 
    (power >= 80 ? 'legendary' :
     power >= 60 ? 'epic' :
     power >= 40 ? 'rare' : 'common');

  // Map capabilities to "Special Moves"
  const specialMoves = bot.capabilities.map(cap => ({
    name: cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: getMoveType(cap),
    icon: getMoveIcon(cap),
  }));

  const getStatusColor = () => {
    switch (bot.status) {
      case 'active': return 'bg-emerald-500';
      case 'busy': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className={`relative rounded-2xl border-4 ${RARITY_COLORS[rarity]} overflow-hidden transform hover:scale-105 transition-transform duration-300 shadow-2xl`}>
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          rarity === 'legendary' ? 'bg-yellow-500 text-yellow-950' :
          rarity === 'epic' ? 'bg-purple-500 text-white' :
          rarity === 'rare' ? 'bg-blue-500 text-white' :
          'bg-slate-500 text-white'
        }`}>
          {RARITY_BADGES[rarity]}
        </div>
      </div>

      {/* Level Badge */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold">
          Lv.{level}
        </div>
      </div>

      {/* Card Header - Avatar & Name */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center border-b-2 border-white/10">
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/20 shadow-lg">
            {bot.name.charAt(0).toUpperCase()}
          </div>
          {/* Status Ring */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor()} rounded-full border-4 border-slate-900`} />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{bot.name}</h3>
        {bot.specialty && (
          <div className="text-sm text-emerald-400 font-medium">{bot.specialty}</div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-slate-900/50 p-4 space-y-3">
        {/* Power Stat */}
        <StatBar
          label="Power"
          value={power}
          max={100}
          color="emerald"
          icon="🟩"
        />

        {/* Urgency Stat */}
        <StatBar
          label="Urgency"
          value={urgency}
          max={100}
          color="red"
          icon="🔺"
        />

        {/* Accuracy Stat */}
        <StatBar
          label="Accuracy"
          value={accuracy}
          max={100}
          color="blue"
          icon="🎯"
        />

        {/* Stamina Stat */}
        <StatBar
          label="Stamina"
          value={Math.min(100, stamina * 10)}
          max={100}
          color="yellow"
          icon="⚡"
        />
      </div>

      {/* Special Moves Section */}
      <div className="bg-slate-800/50 p-4 border-t border-white/10">
        <button
          onClick={() => setShowPowers(!showPowers)}
          className="w-full text-left mb-2 text-white font-semibold flex items-center justify-between"
        >
          <span>✨ Special Moves ({specialMoves.length})</span>
          <span>{showPowers ? '▼' : '▶'}</span>
        </button>

        {showPowers && (
          <div className="space-y-2 mt-2">
            {specialMoves.map((move, i) => (
              <button
                key={i}
                onClick={() => onActivatePower && onActivatePower(bot.id, move.name)}
                className="w-full bg-slate-900/50 hover:bg-slate-900 rounded-lg p-2 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{move.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{move.name}</div>
                    <div className="text-xs text-slate-400">{move.type}</div>
                  </div>
                  <span className="text-emerald-400 text-xs">Use →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-900 p-4 border-t border-white/10 flex gap-2">
        {onLevelUp && (
          <button
            onClick={() => onLevelUp(bot.id)}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
          >
            ⬆️ Level Up
          </button>
        )}
        {onTrade && (
          <button
            onClick={() => onTrade(bot.id)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors"
          >
            🔄 Trade
          </button>
        )}
      </div>

      {/* Evolution Indicator */}
      {bot.evolution_stage && bot.evolution_stage > 1 && (
        <div className="absolute bottom-2 right-2 bg-yellow-500 text-yellow-950 px-2 py-1 rounded-full text-xs font-bold">
          ⭐ Evolved x{bot.evolution_stage}
        </div>
      )}
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: 'emerald' | 'red' | 'blue' | 'yellow';
  icon: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  const colorClasses = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs text-slate-300 font-medium">{label}</span>
        </div>
        <span className="text-xs text-white font-bold">{value.toFixed(0)}/{max}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getMoveType(capability: string): string {
  const cap = capability.toLowerCase();
  if (cap.includes('review') || cap.includes('code')) return 'Technical';
  if (cap.includes('bug') || cap.includes('fix')) return 'Support';
  if (cap.includes('test')) return 'Quality';
  if (cap.includes('doc')) return 'Knowledge';
  if (cap.includes('refactor')) return 'Enhancement';
  return 'General';
}

function getMoveIcon(capability: string): string {
  const cap = capability.toLowerCase();
  if (cap.includes('review')) return '👁️';
  if (cap.includes('bug')) return '🐛';
  if (cap.includes('test')) return '✅';
  if (cap.includes('doc')) return '📝';
  if (cap.includes('refactor')) return '🔧';
  return '⚡';
}
