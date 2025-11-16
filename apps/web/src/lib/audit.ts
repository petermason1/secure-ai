/**
 * Audit Logger
 * Logs all actions for audit trail (All Departments)
 */

import { getSupabaseClient } from './supabase';
import type { AuditLog } from '../types';

/**
 * Log an action
 */
export async function logAction(data: {
  department_id?: string;
  agent_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  cost?: number;
}): Promise<AuditLog> {
  const supabase = getSupabaseClient(true);
  
  const { data: log, error } = await supabase
    .from('audit_logs')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return log as AuditLog;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters?: {
  department_id?: string;
  agent_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  limit?: number;
  start_date?: string;
  end_date?: string;
}): Promise<AuditLog[]> {
  const supabase = getSupabaseClient(true);
  
  let query = supabase.from('audit_logs').select('*');

  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  
  if (filters?.agent_id) {
    query = query.eq('agent_id', filters.agent_id);
  }
  
  if (filters?.resource_type) {
    query = query.eq('resource_type', filters.resource_type);
  }
  
  if (filters?.resource_id) {
    query = query.eq('resource_id', filters.resource_id);
  }
  
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  
  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date);
  }
  
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AuditLog[];
}

/**
 * Get total cost for a time period
 */
export async function getTotalCost(filters?: {
  department_id?: string;
  agent_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<number> {
  const supabase = getSupabaseClient(true);
  
  let query = supabase
    .from('audit_logs')
    .select('cost');

  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  
  if (filters?.agent_id) {
    query = query.eq('agent_id', filters.agent_id);
  }
  
  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date);
  }
  
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).reduce((sum, log) => sum + (log.cost || 0), 0);
}

