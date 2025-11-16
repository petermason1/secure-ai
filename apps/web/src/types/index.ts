/**
 * Shared Type Definitions
 * All departments use these types
 */

// Department
export type Department = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Agent
export type AgentType = 'ai' | 'human' | 'hybrid';
export type AgentStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export type Agent = {
  id: string;
  department_id?: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Message
export type MessageType = 'request' | 'response' | 'notification' | 'alert' | 'coordination';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MessageStatus = 'pending' | 'delivered' | 'read' | 'failed';

export type AgentMessage = {
  id: string;
  from_agent_id: string;
  to_agent_id?: string;
  message_type: MessageType;
  content: Record<string, any>;
  priority: MessagePriority;
  status: MessageStatus;
  created_at: string;
  read_at?: string;
  expires_at?: string;
};

// Conflict
export type ConflictType = 'priority' | 'action' | 'resource' | 'timeline' | 'ethical' | 'business';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ConflictStatus = 'detected' | 'resolving' | 'resolved' | 'escalated';

export type Conflict = {
  id: string;
  conflict_type: ConflictType;
  agent_ids: string[];
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  resolution?: string;
  resolved_by_agent_id?: string;
  created_at: string;
  resolved_at?: string;
};

// File
export type FileType = 'document' | 'image' | 'video' | 'audio' | 'other';

export type File = {
  id: string;
  name: string;
  path: string;
  department_id?: string;
  agent_id?: string;
  file_type: FileType;
  mime_type?: string;
  size: number;
  metadata?: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
};

// Message (Post Team)
export type MessageSource = 'email' | 'slack' | 'sms' | 'webhook' | 'manual' | 'other';
export type PostMessageStatus = 'new' | 'processing' | 'routed' | 'completed' | 'failed';

export type Message = {
  id: string;
  source: MessageSource;
  sender: string;
  recipient?: string;
  subject?: string;
  body: string;
  attachments?: any[];
  status: PostMessageStatus;
  routed_to_agent_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
};

// Decision
export type DecisionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'escalated';
export type DecisionPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Decision = {
  id: string;
  title: string;
  description?: string;
  department_id?: string;
  status: DecisionStatus;
  priority: DecisionPriority;
  decision_maker_id?: string;
  options: any[];
  selected_option?: string;
  reasoning?: string;
  created_at: string;
  decided_at?: string;
};

// Iteration
export type IterationStatus = 'running' | 'paused' | 'completed' | 'failed';

export type Iteration = {
  id: string;
  problem: string;
  current_level: number;
  status: IterationStatus;
  best_solution?: any;
  best_score?: number;
  solutions: any[];
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
};

// Snapshot
export type SnapshotType = 'project' | 'department' | 'agent' | 'full';

export type Snapshot = {
  id: string;
  snapshot_type: SnapshotType;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
};

// Audit Log
export type AuditLog = {
  id: string;
  department_id?: string;
  agent_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  cost?: number;
  created_at: string;
};

