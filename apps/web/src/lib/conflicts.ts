/**
 * Conflict Detection
 * Automatically detects conflicts between agents (Bot Data Centre)
 */

import { getSupabaseClient } from './supabase';
import type { Conflict, ConflictType, ConflictSeverity, ConflictStatus } from '../types';

/**
 * Detect and create a conflict
 */
export async function detectConflict(data: {
  conflict_type: ConflictType;
  agent_ids: string[];
  description: string;
  severity?: ConflictSeverity;
}): Promise<Conflict> {
  const supabase = getSupabaseClient(true);
  
  const { data: conflict, error } = await supabase
    .from('conflicts')
    .insert({
      ...data,
      severity: data.severity || 'medium',
      status: 'detected',
    })
    .select()
    .single();

  if (error) throw error;
  return conflict as Conflict;
}

/**
 * Get all active conflicts
 */
export async function getActiveConflicts(): Promise<Conflict[]> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .in('status', ['detected', 'resolving'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Conflict[];
}

/**
 * Get conflicts for specific agents
 */
export async function getConflictsForAgents(agentIds: string[]): Promise<Conflict[]> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .overlaps('agent_ids', agentIds)
    .in('status', ['detected', 'resolving'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Conflict[];
}

/**
 * Resolve a conflict
 */
export async function resolveConflict(
  conflictId: string,
  resolution: string,
  resolvedByAgentId?: string
): Promise<Conflict> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('conflicts')
    .update({
      status: 'resolved',
      resolution,
      resolved_by_agent_id: resolvedByAgentId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', conflictId)
    .select()
    .single();

  if (error) throw error;
  return data as Conflict;
}

/**
 * Escalate a conflict
 */
export async function escalateConflict(conflictId: string): Promise<Conflict> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('conflicts')
    .update({ status: 'escalated' })
    .eq('id', conflictId)
    .select()
    .single();

  if (error) throw error;
  return data as Conflict;
}

/**
 * Check for conflicts between two agents
 */
export async function checkForConflicts(
  agentId1: string,
  agentId2: string
): Promise<Conflict[]> {
  return getConflictsForAgents([agentId1, agentId2]);
}

