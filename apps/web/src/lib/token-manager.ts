/**
 * Token Manager - Shared LLM Token Pool & Usage Control
 * 
 * Features:
 * - Shared token pool across all bots
 * - Usage limits per bot/department
 * - Request deduplication
 * - Response caching
 * - Smart throttling
 * - Cost tracking
 */

interface TokenUsage {
  bot_id: string;
  department_id: string;
  tokens_used: number;
  requests_count: number;
  last_request: string;
}

interface TokenBudget {
  department_id: string;
  daily_limit: number;
  monthly_limit: number;
  used_today: number;
  used_this_month: number;
}

// In-memory cache for responses (shared across all bots)
const responseCache = new Map<string, { response: any; timestamp: number; hit_count: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Token usage tracking
const tokenUsage = new Map<string, TokenUsage>();
const tokenBudgets = new Map<string, TokenBudget>();

// Request deduplication (prevent same request multiple times)
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Get cached response if available
 */
export function getCachedResponse(cacheKey: string): any | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    cached.hit_count++;
    return cached.response;
  }
  return null;
}

/**
 * Cache a response
 */
export function cacheResponse(cacheKey: string, response: any) {
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    hit_count: 0,
  });
  
  // Limit cache size (keep most recent 1000)
  if (responseCache.size > 1000) {
    const oldest = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    responseCache.delete(oldest[0]);
  }
}

/**
 * Generate cache key from request
 */
export function generateCacheKey(prompt: string, model: string, temperature?: number): string {
  // Normalize prompt (remove whitespace, lowercase for comparison)
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  return `${model}:${temperature || 0}:${normalized.substring(0, 200)}`;
}

/**
 * Check if request is already pending (deduplication)
 */
export function getPendingRequest(requestKey: string): Promise<any> | null {
  return pendingRequests.get(requestKey) || null;
}

/**
 * Store pending request
 */
export function setPendingRequest(requestKey: string, promise: Promise<any>) {
  pendingRequests.set(requestKey, promise);
  promise.finally(() => {
    // Remove after 30 seconds (request should complete by then)
    setTimeout(() => pendingRequests.delete(requestKey), 30000);
  });
}

/**
 * Track token usage
 */
export function trackTokenUsage(
  botId: string,
  departmentId: string,
  tokensUsed: number
) {
  const key = `${departmentId}:${botId}`;
  const current = tokenUsage.get(key) || {
    bot_id: botId,
    department_id: departmentId,
    tokens_used: 0,
    requests_count: 0,
    last_request: new Date().toISOString(),
  };

  current.tokens_used += tokensUsed;
  current.requests_count += 1;
  current.last_request = new Date().toISOString();

  tokenUsage.set(key, current);

  // Update department budget
  const budget = tokenBudgets.get(departmentId) || {
    department_id: departmentId,
    daily_limit: 100000, // Default: 100k tokens/day
    monthly_limit: 3000000, // Default: 3M tokens/month
    used_today: 0,
    used_this_month: 0,
  };

  budget.used_today += tokensUsed;
  budget.used_this_month += tokensUsed;

  tokenBudgets.set(departmentId, budget);
}

/**
 * Check if department has budget remaining
 */
export function checkBudget(departmentId: string): { allowed: boolean; reason?: string } {
  const budget = tokenBudgets.get(departmentId);
  if (!budget) {
    return { allowed: true }; // No budget set = unlimited
  }

  if (budget.used_today >= budget.daily_limit) {
    return { allowed: false, reason: 'Daily limit exceeded' };
  }

  if (budget.used_this_month >= budget.monthly_limit) {
    return { allowed: false, reason: 'Monthly limit exceeded' };
  }

  return { allowed: true };
}

/**
 * Get usage stats
 */
export function getUsageStats() {
  return {
    cache: {
      size: responseCache.size,
      hits: Array.from(responseCache.values()).reduce((sum, c) => sum + c.hit_count, 0),
    },
    pending_requests: pendingRequests.size,
    token_usage: Array.from(tokenUsage.values()),
    budgets: Array.from(tokenBudgets.values()),
  };
}

/**
 * Reset daily usage (call at midnight)
 */
export function resetDailyUsage() {
  tokenBudgets.forEach(budget => {
    budget.used_today = 0;
  });
}

/**
 * Set budget for department
 */
export function setBudget(
  departmentId: string,
  dailyLimit: number,
  monthlyLimit: number
) {
  tokenBudgets.set(departmentId, {
    department_id: departmentId,
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
    used_today: tokenBudgets.get(departmentId)?.used_today || 0,
    used_this_month: tokenBudgets.get(departmentId)?.used_this_month || 0,
  });
}
