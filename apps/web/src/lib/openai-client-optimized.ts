/**
 * Optimized OpenAI Client with Token Sharing & Controls
 * 
 * Features:
 * - Response caching
 * - Request deduplication
 * - Token usage tracking
 * - Budget enforcement
 * - Smart model selection
 */

import { OpenAI } from 'openai';
import {
  getCachedResponse,
  cacheResponse,
  generateCacheKey,
  getPendingRequest,
  setPendingRequest,
  trackTokenUsage,
  checkBudget,
} from './token-manager';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AI API key not configured');
    }

    const baseURL = process.env.AI_GATEWAY_API_KEY
      ? 'https://gateway.ai.cloudflare.com/v1/accounts/' + process.env.CLOUDFLARE_ACCOUNT_ID + '/ai'
      : undefined;

    openaiClient = new OpenAI({
      apiKey,
      baseURL,
    });
  }
  return openaiClient;
}

export function getAIModel(): string {
  // Use free Gemini by default
  if (process.env.AI_GATEWAY_API_KEY) {
    return 'google/gemini-2.0-flash-exp';
  }
  return 'gpt-4o-mini'; // Cheapest OpenAI model
}

interface OptimizedChatOptions {
  messages: any[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  department_id?: string;
  bot_id?: string;
  use_cache?: boolean;
  use_deduplication?: boolean;
}

/**
 * Optimized chat completion with caching and deduplication
 */
export async function optimizedChatCompletion(options: OptimizedChatOptions) {
  const {
    messages,
    model,
    temperature = 0.7,
    max_tokens = 1000,
    department_id = 'unknown',
    bot_id = 'unknown',
    use_cache = true,
    use_deduplication = true,
  } = options;

  const finalModel = model || getAIModel();
  const prompt = messages.map(m => m.content).join('\n');

  // Check budget
  if (department_id !== 'unknown') {
    const budgetCheck = checkBudget(department_id);
    if (!budgetCheck.allowed) {
      throw new Error(`Budget exceeded: ${budgetCheck.reason}`);
    }
  }

  // Try cache first
  if (use_cache) {
    const cacheKey = generateCacheKey(prompt, finalModel, temperature);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return {
        ...cached,
        cached: true,
        tokens_used: 0, // Cache hit = 0 tokens
      };
    }
  }

  // Check for pending duplicate request
  if (use_deduplication) {
    const requestKey = `${finalModel}:${prompt.substring(0, 100)}`;
    const pending = getPendingRequest(requestKey);
    if (pending) {
      return pending; // Wait for existing request instead of making new one
    }
  }

  // Make API call
  const client = getClient();
  const requestPromise = client.chat.completions.create({
    model: finalModel,
    messages,
    temperature,
    max_tokens,
  }).then(async (response) => {
    const result = {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: response.usage,
      cached: false,
    };

    // Cache the response
    if (use_cache) {
      const cacheKey = generateCacheKey(prompt, finalModel, temperature);
      cacheResponse(cacheKey, result);
    }

    // Track token usage
    if (response.usage) {
      const tokensUsed = response.usage.total_tokens || 0;
      trackTokenUsage(bot_id, department_id, tokensUsed);
    }

    return result;
  });

  // Store pending request for deduplication
  if (use_deduplication) {
    const requestKey = `${finalModel}:${prompt.substring(0, 100)}`;
    setPendingRequest(requestKey, requestPromise);
  }

  return requestPromise;
}

/**
 * Get cheapest model for task
 */
export function getCheapestModel(taskType: string): string {
  // Use free Gemini for most tasks
  if (process.env.AI_GATEWAY_API_KEY) {
    return 'google/gemini-2.0-flash-exp';
  }

  // Fallback to cheapest OpenAI model
  return 'gpt-4o-mini';
}
