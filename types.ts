export enum AgentPhase {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  DESIGNING = 'DESIGNING',
  ARCHITECTING = 'ARCHITECTING',
  CODING = 'CODING',
  PATCHING = 'PATCHING',
  READY = 'READY'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'system';
  codeBlock?: string;
}

export interface ProjectState {
  id: string;
  name: string;
  description: string;
  status: AgentPhase;
  files: string[];
  dependencies: string[];
  logs: LogEntry[];
  generatedCode: boolean;
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: any; // Using Lucide icon component type
}
