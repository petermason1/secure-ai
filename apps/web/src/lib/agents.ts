/**
 * Agent Registry
 * Manages all AI agents across departments
 */

import { getSupabaseClient } from './supabase';
import type { Agent, AgentStatus, AgentType } from '../types';

/**
 * Register a new agent
 */
export async function registerAgent(data: {
  department_id?: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  const supabase = getSupabaseClient(true);
  
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      ...data,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return agent as Agent;
}

/**
 * Get agent by ID
 */
export async function getAgent(id: string): Promise<Agent | null> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data as Agent;
}

/**
 * Get all agents in a department
 */
export async function getAgentsByDepartment(departmentId: string): Promise<Agent[]> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('department_id', departmentId)
    .eq('status', 'active');

  if (error) throw error;
  return (data || []) as Agent[];
}

/**
 * Find agents by capability
 */
export async function findAgentsByCapability(capability: string): Promise<Agent[]> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .contains('capabilities', [capability]);

  if (error) throw error;
  return (data || []) as Agent[];
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  id: string,
  status: AgentStatus
): Promise<Agent> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Agent;
}

/**
 * Get all active agents
 */
export async function getAllActiveAgents(): Promise<Agent[]> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  return (data || []) as Agent[];
}

