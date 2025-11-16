/**
 * File Manager
 * Handles file storage and retrieval (Storage & Filing Department)
 */

import { getSupabaseClient } from './supabase';
import type { File, FileType } from '../types';

/**
 * Upload a file
 */
export async function uploadFile(data: {
  name: string;
  path: string;
  department_id?: string;
  agent_id?: string;
  file_type: FileType;
  mime_type?: string;
  size: number;
  metadata?: Record<string, any>;
  tags?: string[];
}): Promise<File> {
  const supabase = getSupabaseClient(true);
  
  const { data: file, error } = await supabase
    .from('files')
    .insert({
      ...data,
      tags: data.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return file as File;
}

/**
 * Get file by ID
 */
export async function getFile(id: string): Promise<File | null> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data as File;
}

/**
 * Search files
 */
export async function searchFiles(filters: {
  department_id?: string;
  agent_id?: string;
  file_type?: FileType;
  tags?: string[];
  search?: string;
  limit?: number;
}): Promise<File[]> {
  const supabase = getSupabaseClient(true);
  
  let query = supabase.from('files').select('*');

  if (filters.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  
  if (filters.agent_id) {
    query = query.eq('agent_id', filters.agent_id);
  }
  
  if (filters.file_type) {
    query = query.eq('file_type', filters.file_type);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }
  
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as File[];
}

/**
 * Delete a file
 */
export async function deleteFile(id: string): Promise<void> {
  const supabase = getSupabaseClient(true);
  
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  id: string,
  metadata: Record<string, any>
): Promise<File> {
  const supabase = getSupabaseClient(true);
  
  const { data, error } = await supabase
    .from('files')
    .update({
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as File;
}

