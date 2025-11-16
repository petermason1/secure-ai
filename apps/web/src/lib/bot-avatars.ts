/**
 * Bot Avatar System
 * Assigns and manages avatars for bots
 */

const AVATAR_POOL = {
  junior: ['👨‍💻', '👩‍💻', '🤖', '⚡', '🔧', '📝', '🎯', '💡', '🚀', '🎨'],
  senior: ['👨‍🏫', '👩‍🏫', '🎓', '🧠', '💼', '⭐', '🏆', '👑', '🎖️', '🌟'],
  learning: ['📚', '🎓', '📖', '✏️', '🔬', '🧪', '📊', '📈', '💡', '🎯'],
  default: ['🤖', '👤', '⚡', '🎯', '💡', '🚀', '⭐', '🌟', '🎨', '🔧'],
};

export function getAvatarForBot(botName: string, level?: string, specialty?: string): string {
  // Check if bot already has avatar in metadata
  // This would be set via update-avatar API
  
  // Generate based on name/type
  const name = botName.toLowerCase();
  
  if (name.includes('phd') || name.includes('dr.') || name.includes('doctor')) {
    return '🎓';
  }
  if (name.includes('senior')) {
    return AVATAR_POOL.senior[Math.abs(hashCode(botName)) % AVATAR_POOL.senior.length];
  }
  if (name.includes('learning') || name.includes('training')) {
    return AVATAR_POOL.learning[Math.abs(hashCode(botName)) % AVATAR_POOL.learning.length];
  }
  if (name.includes('sales')) {
    return '💼';
  }
  if (name.includes('stats') || name.includes('statistics')) {
    return '📊';
  }
  if (name.includes('random')) {
    return '🎲';
  }
  if (name.includes('wild')) {
    return '🔥';
  }
  if (name.includes('self-taught')) {
    return '🛠️';
  }
  
  // Default based on level
  if (level === 'senior') {
    return AVATAR_POOL.senior[Math.abs(hashCode(botName)) % AVATAR_POOL.senior.length];
  }
  
  return AVATAR_POOL.junior[Math.abs(hashCode(botName)) % AVATAR_POOL.junior.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function getDefaultMissions(agentName: string, capabilities: string[]): Array<{title: string, description: string, type: string}> {
  const missions = [];
  
  if (capabilities.includes('code_review')) {
    missions.push({
      title: 'Review 10 Code Files',
      description: 'Complete code reviews for 10 different files',
      type: 'goal',
    });
  }
  
  if (capabilities.includes('documentation')) {
    missions.push({
      title: 'Document 5 APIs',
      description: 'Create documentation for 5 API endpoints',
      type: 'goal',
    });
  }
  
  if (capabilities.includes('testing')) {
    missions.push({
      title: 'Write 20 Tests',
      description: 'Write 20 unit or integration tests',
      type: 'goal',
    });
  }
  
  if (capabilities.includes('bug_fixing')) {
    missions.push({
      title: 'Fix 5 Bugs',
      description: 'Identify and fix 5 bugs',
      type: 'challenge',
    });
  }
  
  // Default mission for all bots
  missions.push({
    title: 'Complete First Task',
    description: 'Successfully complete your first assigned task',
    type: 'achievement',
  });
  
  return missions;
}
