import { NextResponse } from 'next/server';

const API_ENDPOINTS = {
  'Credits System': {
    description: 'Monetization and usage tracking system',
    endpoints: [
      {
        method: 'POST',
        path: '/api/credits/purchase',
        description: 'Purchase credits for a user/company',
        params: ['userId', 'amount', 'companyId?', 'paymentMethod?'],
      },
      {
        method: 'POST',
        path: '/api/credits/spend',
        description: 'Spend credits on a service',
        params: ['userId', 'amount', 'service', 'description?'],
      },
      {
        method: 'GET',
        path: '/api/credits/status',
        description: 'Get credit balance and transaction history',
        params: ['userId', 'companyId?'],
      },
    ],
  },
  'Lead Management': {
    description: 'CRM-style lead tracking and management',
    endpoints: [
      {
        method: 'POST',
        path: '/api/leads',
        description: 'Create a new lead',
        params: ['companyName', 'email', 'offer', 'contactName?', 'role?', 'workflowTarget?', 'urgency?', 'budgetBand?', 'source?', 'notes?', 'status?', 'owner?'],
      },
      {
        method: 'GET',
        path: '/api/leads',
        description: 'Query leads with filters',
        params: ['status?', 'owner?', 'limit?'],
      },
    ],
  },
  'Junior Dev Team': {
    description: 'AI-powered development automation',
    endpoints: [
      {
        method: 'POST',
        path: '/api/junior-dev-team/jit/activate',
        description: 'Activate a Just-In-Time development session',
        params: ['userId', 'task', 'companyId?', 'context?', 'priority?'],
      },
      {
        method: 'GET',
        path: '/api/junior-dev-team/jit/activate',
        description: 'Get JIT session status or list sessions',
        params: ['id?', 'userId?', 'status?'],
      },
      {
        method: 'GET',
        path: '/api/junior-dev-team/kanban/board',
        description: 'Get kanban board with tasks grouped by status',
        params: ['userId?', 'companyId?'],
      },
      {
        method: 'POST',
        path: '/api/junior-dev-team/kanban/board',
        description: 'Create a new task',
        params: ['userId', 'title', 'companyId?', 'description?', 'priority?', 'tags?'],
      },
      {
        method: 'POST',
        path: '/api/junior-dev-team/kanban/move',
        description: 'Move a task between columns',
        params: ['taskId', 'newStatus', 'assignee?', 'priority?'],
      },
    ],
  },
  'CEO Call System': {
    description: 'Executive-level call tracking and management',
    endpoints: [
      {
        method: 'POST',
        path: '/api/ceo/call',
        description: 'Log a CEO call',
        params: ['userId', 'callType', 'participant?', 'topic?', 'scheduledAt?', 'priority?', 'notes?'],
      },
      {
        method: 'GET',
        path: '/api/ceo/call',
        description: 'Get call details or list calls',
        params: ['id?', 'userId?', 'status?', 'callType?'],
      },
      {
        method: 'PATCH',
        path: '/api/ceo/call',
        description: 'Update call (complete, add outcomes, action items)',
        params: ['callId', 'status?', 'duration?', 'outcome?', 'actionItems?', 'nextSteps?', 'notes?'],
      },
    ],
  },
  'Workflow Automation': {
    description: 'Business process automation and research',
    endpoints: [
      {
        method: 'POST',
        path: '/api/workflows/payment-trigger-research',
        description: 'Trigger automated research on payment workflows',
        params: ['userId', 'workflowType', 'trigger', 'companyId?', 'context?', 'priority?'],
      },
      {
        method: 'GET',
        path: '/api/workflows/payment-trigger-research',
        description: 'Get research results or list research tasks',
        params: ['id?', 'userId?', 'workflowType?', 'status?'],
      },
    ],
  },
  'Content Management': {
    description: 'Blog and content APIs',
    endpoints: [
      {
        method: 'GET',
        path: '/api/blogs',
        description: 'List all blog posts',
        params: [],
      },
      {
        method: 'GET',
        path: '/api/blogs/[slug]',
        description: 'Get a specific blog post',
        params: ['slug'],
      },
      {
        method: 'GET',
        path: '/api/prompts',
        description: 'List all prompts',
        params: [],
      },
      {
        method: 'GET',
        path: '/api/prompts/[id]',
        description: 'Get a specific prompt',
        params: ['id'],
      },
    ],
  },
};

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: API_ENDPOINTS,
    database: process.env.TURSO_DATABASE_URL ? 'connected' : 'not configured',
    totalEndpoints: Object.values(API_ENDPOINTS).reduce(
      (sum, category) => sum + category.endpoints.length,
      0
    ),
  });
}

