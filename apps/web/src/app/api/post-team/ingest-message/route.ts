import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { message_source, sender_email, sender_name, subject, content, metadata } = body;

    if (!message_source || !content) {
      return NextResponse.json(
        { error: 'message_source and content are required' },
        { status: 400 }
      );
    }

    // Scan and categorize message using AI
    const categorization = await categorizeMessage(openai, content, model, subject);
    const sentiment = await analyzeSentiment(openai, content, model);
    const spamCheck = await checkSpam(content, sender_email);

    // Determine routing
    const routing = determineRouting(categorization, sentiment, spamCheck);

    // Store all analysis in metadata
    const messageMetadata = {
      ...(metadata || {}),
      categorization,
      sentiment,
      spam_check: spamCheck,
      routing,
      scanned_at: new Date().toISOString(),
      categorized_at: new Date().toISOString(),
      routed_at: new Date().toISOString(),
    };

    const messageId = randomUUID();
    const now = new Date().toISOString();

    // Store message
    await turso.execute({
      sql: `INSERT INTO messages (
        id, source, sender, recipient, subject, body, attachments, status, routed_to_agent_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        messageId,
        message_source,
        sender_email || sender_name || 'unknown',
        null, // recipient
        subject || null,
        content,
        JSON.stringify([]), // attachments
        spamCheck.is_spam ? 'failed' : 'routed',
        null, // routed_to_agent_id (would need agent lookup)
        JSON.stringify(messageMetadata),
        now,
      ],
    });

    return NextResponse.json({
      message_id: messageId,
      status: spamCheck.is_spam ? 'quarantined' : 'routed',
      categorization,
      sentiment: {
        sentiment: sentiment.sentiment,
        sentiment_score: sentiment.sentiment_score,
        urgency_score: sentiment.urgency_score,
      },
      spam_check: spamCheck,
      routing,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}

async function categorizeMessage(openai: any, content: string, model: string, subject?: string) {
  try {
    const prompt = `Categorize this message:
Subject: ${subject || 'N/A'}
Content: ${content}

Return JSON with:
- type: "inquiry" | "complaint" | "request" | "spam" | "general"
- category: "sales" | "support" | "legal" | "technical" | "general"
- department: "sales" | "legal" | "support" | "technical" | "general"
- priority: "low" | "normal" | "high" | "urgent"`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a message categorization expert. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      type: result.type || 'general',
      category: result.category || 'general',
      department: result.department || 'general',
      priority: result.priority || 'normal',
    };
  } catch (error) {
    // Fallback categorization
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('contract') || lowerContent.includes('legal')) {
      return { type: 'request', category: 'legal', department: 'legal', priority: 'high' };
    }
    if (lowerContent.includes('price') || lowerContent.includes('buy') || lowerContent.includes('purchase')) {
      return { type: 'inquiry', category: 'sales', department: 'sales', priority: 'normal' };
    }
    return { type: 'general', category: 'general', department: 'general', priority: 'normal' };
  }
}

async function analyzeSentiment(openai: any, content: string, model: string) {
  try {
    const prompt = `Analyze the sentiment of this message:
${content}

Return JSON with:
- sentiment: "positive" | "neutral" | "negative" | "angry"
- sentiment_score: number between -1 and 1
- tone: "professional" | "casual" | "urgent" | "frustrated"
- emotion: "happy" | "sad" | "angry" | "confused" | "neutral"
- urgency_level: "low" | "medium" | "high" | "critical"
- risk_level: "safe" | "moderate" | "high" | "critical"`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a sentiment analysis expert. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      sentiment: result.sentiment || 'neutral',
      sentiment_score: parseFloat(result.sentiment_score) || 0,
      tone: result.tone || 'professional',
      emotion: result.emotion || 'neutral',
      urgency_level: result.urgency_level || 'medium',
      risk_level: result.risk_level || 'safe',
      urgency_score: calculateUrgencyScore(result),
    };
  } catch (error) {
    return {
      sentiment: 'neutral',
      sentiment_score: 0,
      tone: 'professional',
      emotion: 'neutral',
      urgency_level: 'medium',
      risk_level: 'safe',
      urgency_score: 50,
    };
  }
}

function calculateUrgencyScore(sentiment: any): number {
  let score = 50; // Base score

  if (sentiment.urgency_level === 'critical') score += 40;
  else if (sentiment.urgency_level === 'high') score += 25;
  else if (sentiment.urgency_level === 'medium') score += 10;

  if (sentiment.sentiment === 'angry') score += 20;
  else if (sentiment.sentiment === 'negative') score += 10;

  if (sentiment.risk_level === 'critical') score += 30;
  else if (sentiment.risk_level === 'high') score += 15;

  return Math.min(100, Math.max(0, score));
}

function checkSpam(content: string, sender_email?: string) {
  const lowerContent = content.toLowerCase();
  const spamKeywords = ['free money', 'click here', 'winner', 'congratulations', 'act now', 'limited time'];
  const phishingKeywords = ['verify account', 'suspended', 'click to confirm', 'urgent action required'];

  const isSpam = spamKeywords.some(keyword => lowerContent.includes(keyword));
  const isPhishing = phishingKeywords.some(keyword => lowerContent.includes(keyword));
  const suspiciousDomain = sender_email && (
    sender_email.includes('noreply') ||
    sender_email.includes('no-reply') ||
    !sender_email.includes('@')
  );

  return {
    is_spam: isSpam || isPhishing || suspiciousDomain,
    is_abuse: false,
    spam_type: isPhishing ? 'phishing' : isSpam ? 'spam' : null,
    risk_level: isPhishing ? 'high' : isSpam ? 'medium' : 'low',
  };
}

function determineRouting(categorization: any, sentiment: any, spamCheck: any) {
  if (spamCheck.is_spam) {
    return { agent: 'spam_filter', reason: 'Spam detected' };
  }

  const department = categorization.department;
  const priority = categorization.priority;
  const urgency = sentiment.urgency_level;

  // Route based on department
  let agent = `${department}_agent`;
  if (department === 'general') {
    agent = 'support_agent';
  }

  // Escalate if urgent
  if (priority === 'urgent' || urgency === 'critical' || sentiment.risk_level === 'critical') {
    agent = 'ceo_dashboard'; // Escalate to CEO
  }

  return {
    agent,
    reason: `Routed to ${agent} based on category: ${categorization.category}, priority: ${priority}`,
  };
}
