/**
 * Message Bus
 * Routes messages between agents (Bot Data Centre)
 */

import { getSupabaseClient } from './supabase';
import type { AgentMessage, MessageType, MessagePriority } from '../types';

/**
 * Send a message from one agent to another
 */
export async function sendMessage(data: {
  from_agent_id: string;
  to_agent_id?: string; // null = broadcast to all
  message_type: MessageType;
  content: Record<string, any>;
  priority?: MessagePriority;
  expires_at?: string;
}): Promise<AgentMessage> {
  const supabase = getSupabaseClient(true);
  
  const { data: message, error } = await supabase
    .from('agent_messages')
    .insert({
      ...data,
      priority: data.priority || 'medium',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return message as AgentMessage;
}

/**
 * Get messages for an agent
 */
export async function getMessagesForAgent(
  agentId: string,
  options?: {
    status?: 'pending' | 'delivered' | 'read';
    limit?: number;
    priority?: MessagePriority;
  }
): Promise<AgentMessage[]> {
  const supabase = getSupabaseClient(true);
  
  let query = supabase
    .from('agent_messages')
    .select('*')
    .or(`to_agent_id.eq.${agentId},to_agent_id.is.null`)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  
  if (options?.priority) {
    query = query.eq('priority', options.priority);
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AgentMessage[];
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<AgentMessage> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agent_messages')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data as AgentMessage;
}

/**
 * Mark message as delivered
 */
export async function markMessageAsDelivered(messageId: string): Promise<AgentMessage> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agent_messages')
    .update({ status: 'delivered' })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data as AgentMessage;
}

/**
 * Get unread message count for an agent
 */
export async function getUnreadMessageCount(agentId: string): Promise<number> {
  const supabase = getSupabaseClient(true);
  
  const { count, error } = await supabase
    .from('agent_messages')
    .select('*', { count: 'exact', head: true })
    .or(`to_agent_id.eq.${agentId},to_agent_id.is.null`)
    .in('status', ['pending', 'delivered']);

  if (error) throw error;
  return count || 0;
}

