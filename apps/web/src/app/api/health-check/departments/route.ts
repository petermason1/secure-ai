import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';

interface DepartmentHealth {
  name: string;
  href: string;
  status: 'healthy' | 'degraded' | 'down' | 'not_found';
  agents_count: number;
  active_agents: number;
  last_activity?: string;
  issues: string[];
}

export async function GET(request: NextRequest) {
  try {
    const turso = getTursoClient();

    // Get all departments
    const deptsResult = await turso.execute({
      sql: `SELECT d.*, 
                   COUNT(DISTINCT a.id) as total_agents,
                   COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_agents
            FROM departments d
            LEFT JOIN agents a ON d.id = a.department_id
            GROUP BY d.id
            ORDER BY d.name`,
    });

    const departments: DepartmentHealth[] = [];

    // Department href mapping
    const hrefMap: Record<string, string> = {
      'Bot Data Centre': '/bot-hub',
      'Post Team': '/post-team',
      'Storage & Filing': '/storage',
      'Social Media': '/social-media',
      'Media Team': '/media-team',
      'Sales Agent': '/sales-agent',
      'CEO Dashboard': '/ceo-dashboard',
      'Consigliere': '/consigliere',
      'Health & Safety': '/health-safety',
      'Training': '/training',
      'Legal Department': '/legal-department',
      'HR Department': '/hr-department',
      'Policy & Governance': '/policy-department',
      'Recruitment Consultant': '/recruitment-consultant',
      'Security Advisory': '/security-advisory',
      'Crypto Trading Bot': '/crypto-trading',
      'Well Being Team': '/well-being-team',
      'CEO Bot': '/ceo-bot',
      'Podcast Intelligence': '/podcast-intelligence',
      'SEO Department': '/seo-department',
      'Senior Dev Review': '/senior-dev',
      'Accounts Department': '/accounts-department',
      'Trend Intelligence': '/trend-intelligence',
      'Value Optimization': '/value-optimization',
      'Code Editor': '/code-editor',
      'Blog Department': '/blog-department',
      'Christmas Trends': '/christmas-trends',
    };

    for (const dept of deptsResult.rows) {
      const deptName =
        typeof dept.name === 'string'
          ? dept.name
          : dept.name != null
          ? String(dept.name)
          : 'Unknown Department';
      const totalAgents = Number(dept.total_agents) || 0;
      const activeAgents = Number(dept.active_agents) || 0;
      const deptStatus = dept.status;

      // Determine health status
      let status: 'healthy' | 'degraded' | 'down' | 'not_found' = 'healthy';
      const issues: string[] = [];

      if (deptStatus !== 'active') {
        status = 'down';
        issues.push(`Department status: ${deptStatus}`);
      }

      if (totalAgents === 0) {
        status = status === 'down' ? 'down' : 'degraded';
        issues.push('No agents found');
      } else if (activeAgents === 0) {
        status = status === 'down' ? 'down' : 'degraded';
        issues.push('No active agents');
      } else if (activeAgents < totalAgents) {
        if (status === 'healthy') {
          status = 'degraded';
        }
        issues.push(`${totalAgents - activeAgents} inactive agent(s)`);
      }

      // Check for recent activity (if we have agent_messages or other activity tables)
      let lastActivity: string | undefined;
      try {
        const activityResult = await turso.execute({
          sql: `SELECT MAX(created_at) as last_activity 
                FROM agent_messages 
                WHERE from_agent_id IN (SELECT id FROM agents WHERE department_id = ?)
                   OR to_agent_id IN (SELECT id FROM agents WHERE department_id = ?)
                LIMIT 1`,
          args: [dept.id, dept.id],
        });
        const lastValue = activityResult.rows[0]?.last_activity;
        lastActivity = typeof lastValue === 'string' ? lastValue : undefined;
      } catch {
        // Activity check failed, not critical
      }

      departments.push({
        name: deptName,
        href: hrefMap[deptName] || '/dashboard',
        status,
        agents_count: totalAgents,
        active_agents: activeAgents,
        last_activity: lastActivity,
        issues,
      });
    }

    // Test API endpoints for each department
    const apiTests: Record<string, { endpoint: string; status: 'working' | 'error' | 'not_tested' }> = {};

    // Test a few key endpoints
    const endpointsToTest = [
      { dept: 'SEO Department', endpoint: '/api/seo-department/list' },
      { dept: 'Podcast Intelligence', endpoint: '/api/podcast-intelligence/list' },
      { dept: 'Security Advisory', endpoint: '/api/security/team' },
      { dept: 'HR Department', endpoint: '/api/hr-department/list' },
      { dept: 'Legal Department', endpoint: '/api/legal-department/list' },
    ];

    for (const test of endpointsToTest) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}${test.endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        apiTests[test.dept] = {
          endpoint: test.endpoint,
          status: response.ok ? 'working' : 'error',
        };
      } catch {
        apiTests[test.dept] = {
          endpoint: test.endpoint,
          status: 'not_tested',
        };
      }
    }

    const summary = {
      total: departments.length,
      healthy: departments.filter(d => d.status === 'healthy').length,
      degraded: departments.filter(d => d.status === 'degraded').length,
      down: departments.filter(d => d.status === 'down').length,
      not_found: departments.filter(d => d.status === 'not_found').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      departments,
      api_tests: apiTests,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Health check failed', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

