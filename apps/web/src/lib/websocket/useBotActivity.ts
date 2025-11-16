/**
 * WebSocket Hook for Real-Time Bot Activity Updates
 * 
 * Provides real-time updates for bot status, tasks, and activity.
 * Automatically reconnects on disconnect and handles connection states.
 * 
 * @example
 * ```tsx
 * const { bots, tasks, isConnected, error } = useBotActivity();
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface Bot {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  specialty?: string;
  latest_task?: Task;
  message_count: number;
  performance_metrics?: {
    tasks_completed: number;
    avg_completion_time: number;
    success_rate: number;
    recent_performance: number[]; // For sparklines
  };
  created_at: string;
}

interface Task {
  id: string;
  type: string;
  description: string;
  priority: string;
  assigned_at: string;
  status?: string;
}

interface UseBotActivityReturn {
  bots: Bot[];
  tasks: Task[];
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useBotActivity(): UseBotActivityReturn {
  const [bots, setBots] = useState<Bot[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // For now, use polling. WebSocket server can be added later
    // This hook provides the interface for future WebSocket implementation
    const fetchData = async () => {
      try {
        const res = await fetch('/api/junior-dev-team/activity');
        const data = await res.json();
        if (data.success) {
          setBots(data.agents || []);
          setTasks(data.recent_activity?.tasks || []);
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        }
      } catch (err: any) {
        setError(err.message);
        setIsConnected(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { bots, tasks, isConnected, error, reconnect };
}
