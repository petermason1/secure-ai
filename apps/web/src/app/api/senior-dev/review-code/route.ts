import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

/**
 * Senior Dev Code Review
 * Non-AI expert reviews code using traditional methods:
 * - Pattern matching for known issues
 * - Stack Overflow reference lookup
 * - Manual code analysis
 * - Best practices enforcement
 */
export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { file_path, file_content, language, review_type } = body;

    if (!file_path || !file_content) {
      return NextResponse.json(
        { error: 'file_path and file_content are required' },
        { status: 400 }
      );
    }

    // Get Senior Dev agent
    const agentResult = await turso.execute({
      sql: `SELECT id FROM agents WHERE name LIKE '%Senior Dev%' LIMIT 1`,
    });
    const agentId = agentResult.rows[0]?.id || null;

    // Create review
    const reviewId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO senior_dev_reviews (id, file_path, file_content, language, review_type, status, reviewed_by_agent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'in_progress', ?, datetime('now'), datetime('now'))`,
      args: [
        reviewId,
        file_path,
        file_content,
        language || detectLanguage(file_path),
        review_type || 'full_review',
        agentId,
      ],
    });

    // Analyze code using traditional methods (pattern matching, not AI)
    const issues = await analyzeCodeTraditional(file_content, language || detectLanguage(file_path));

    // Save issues
    const savedIssues = [];
    for (const issue of issues) {
      const issueId = randomUUID();
      await turso.execute({
        sql: `INSERT INTO senior_dev_issues (id, review_id, issue_type, severity, line_number, code_snippet, title, description, stack_overflow_reference, suggested_fix, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`,
        args: [
          issueId,
          reviewId,
          issue.issue_type,
          issue.severity,
          issue.line_number || null,
          issue.code_snippet || null,
          issue.title,
          issue.description,
          issue.stack_overflow_reference || null,
          issue.suggested_fix || null,
        ],
      });
      savedIssues.push({ id: issueId, ...issue });
    }

    // Update review status
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const priority = criticalCount > 0 ? 'critical' : highCount > 2 ? 'high' : 'medium';

    await turso.execute({
      sql: `UPDATE senior_dev_reviews 
            SET status = 'completed', priority = ?, completed_at = datetime('now'), updated_at = datetime('now')
            WHERE id = ?`,
      args: [priority, reviewId],
    });

    return NextResponse.json({
      success: true,
      message: 'Code review completed using traditional methods',
      review_id: reviewId,
      file_path,
      language: language || detectLanguage(file_path),
      issues_found: issues.length,
      critical_issues: criticalCount,
      high_issues: highCount,
      issues: savedIssues,
      method: 'traditional_code_review',
      uses_ai: false,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Failed to review code', details: error.message },
      { status: handled.code || 500 }
    );
  }
}

/**
 * Traditional code analysis (pattern matching, not AI)
 */
async function analyzeCodeTraditional(code: string, language: string): Promise<any[]> {
  const issues: any[] = [];
  const lines = code.split('\n');

  // Common anti-patterns and issues to check
  const patterns = [
    // Security issues
    {
      pattern: /eval\s*\(/i,
      type: 'security',
      severity: 'critical',
      title: 'Use of eval() - Security Risk',
      description: 'eval() can execute arbitrary code and is a major security vulnerability',
      fix: 'Use JSON.parse() or a safer alternative',
      soRef: 'https://stackoverflow.com/questions/86513/why-is-using-the-javascript-eval-function-a-bad-idea',
    },
    {
      pattern: /password\s*=\s*['"](.*?)['"]/i,
      type: 'security',
      severity: 'critical',
      title: 'Hardcoded Password',
      description: 'Password found in source code - should use environment variables',
      fix: 'Move to environment variables or secure secret management',
    },
    {
      pattern: /sql\s*=\s*['"](.*?)\$\{/i,
      type: 'security',
      severity: 'critical',
      title: 'SQL Injection Risk',
      description: 'Potential SQL injection vulnerability from string interpolation',
      fix: 'Use parameterized queries or prepared statements',
      soRef: 'https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php',
    },
    // Performance issues
    {
      pattern: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{/,
      type: 'performance',
      severity: 'high',
      title: 'Nested Loops - O(n²) Complexity',
      description: 'Nested loops can cause performance issues with large datasets',
      fix: 'Consider using hash maps, sets, or other data structures to optimize',
    },
    {
      pattern: /\.map\([^)]*\)\.map\([^)]*\)\.map\(/,
      type: 'performance',
      severity: 'medium',
      title: 'Multiple Array Iterations',
      description: 'Chaining multiple map() calls creates multiple iterations',
      fix: 'Combine into a single map() or use reduce()',
    },
    // Code smells
    {
      pattern: /if\s*\([^)]*\)\s*\{[^}]*if\s*\([^)]*\)\s*\{[^}]*if\s*\(/,
      type: 'code_smell',
      severity: 'medium',
      title: 'Deeply Nested Conditionals',
      description: 'Code is hard to read and maintain with deep nesting',
      fix: 'Extract functions, use early returns, or guard clauses',
      soRef: 'https://stackoverflow.com/questions/250235/what-is-the-maximum-depth-for-nested-if-else-statements',
    },
    {
      pattern: /function\s+\w+\s*\([^)]{200,}\)/,
      type: 'code_smell',
      severity: 'medium',
      title: 'Function with Too Many Parameters',
      description: 'Functions with many parameters are hard to maintain',
      fix: 'Use an options object or break into smaller functions',
    },
    // Common mistakes
    {
      pattern: /==\s*null|\s*==\s*undefined/,
      type: 'bug',
      severity: 'medium',
      title: 'Use === Instead of ==',
      description: '== allows type coercion which can cause unexpected behavior',
      fix: 'Use === for strict equality checks',
      soRef: 'https://stackoverflow.com/questions/359494/which-equals-operator-vs-should-be-used-in-javascript-comparisons',
    },
    {
      pattern: /var\s+\w+/,
      type: 'best_practice',
      severity: 'low',
      title: 'Use const/let Instead of var',
      description: 'var has function scope and can cause issues, prefer const/let',
      fix: 'Replace var with const (for constants) or let (for variables)',
    },
    // Async/await issues
    {
      pattern: /async\s+function[^{]*\{[^}]*\.then\(/,
      type: 'anti_pattern',
      severity: 'medium',
      title: 'Mixing async/await with .then()',
      description: 'Mixing async/await with promise chains is inconsistent',
      fix: 'Use async/await consistently throughout',
      soRef: 'https://stackoverflow.com/questions/38884522/why-is-async-await-preferred-over-promise-then',
    },
    {
      pattern: /await\s+[^;]*await\s+[^;]*await\s+[^;]*await/,
      type: 'performance',
      severity: 'medium',
      title: 'Sequential Awaits - Could Be Parallel',
      description: 'Multiple sequential awaits might be able to run in parallel',
      fix: 'Use Promise.all() to run promises in parallel',
    },
  ];

  // Check each line against patterns
  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      if (pattern.pattern.test(line)) {
        issues.push({
          issue_type: pattern.type,
          severity: pattern.severity,
          line_number: index + 1,
          code_snippet: line.trim(),
          title: pattern.title,
          description: pattern.description,
          stack_overflow_reference: pattern.soRef || null,
          suggested_fix: pattern.fix,
        });
      }
    });
  });

  // Check for missing error handling
  if (code.includes('async') && !code.includes('try') && !code.includes('catch')) {
    issues.push({
      issue_type: 'best_practice',
      severity: 'medium',
      title: 'Missing Error Handling in Async Code',
      description: 'Async functions should have try/catch blocks for error handling',
      suggested_fix: 'Wrap async code in try/catch blocks',
    });
  }

  // Check for console.log in production code
  if (code.includes('console.log') && !code.includes('// debug')) {
    issues.push({
      issue_type: 'best_practice',
      severity: 'low',
      title: 'console.log() in Code',
      description: 'console.log statements should be removed or replaced with proper logging',
      suggested_fix: 'Use a proper logging library or remove debug statements',
    });
  }

  return issues;
}

function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'sql': 'sql',
  };
  return langMap[ext || ''] || 'unknown';
}

