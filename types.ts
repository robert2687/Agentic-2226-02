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

/**
 * Enhanced ProjectState - The "Collective Consciousness"
 * This is the central state object that all agents read from and write to,
 * preventing hallucination drift and ensuring deterministic execution.
 */
export interface ProjectState {
  // Original project metadata
  id: string;
  name: string;
  description: string;
  status: AgentPhase;

  // User intent - The original "what" from the user
  user_prompt: string;

  // Planning phase output
  plan?: {
    features: string[];
    dataModels: string[];
    technicalRequirements: string[];
    mockDataSchema?: Record<string, any>;
  };

  // Design phase output
  design_system?: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      heading: string;
      body: string;
      code: string;
    };
    spacing: Record<string, string>;
    theme: 'light' | 'dark' | 'cyberpunk' | 'cozy' | 'professional';
  };

  // Architecture phase output
  file_system: {
    path: string;
    content?: string;
    type: 'file' | 'directory';
    lastModified?: string;
  }[];

  // Build and runtime feedback
  terminal_logs: {
    stdout: string[];
    stderr: string[];
    exit_code?: number;
    timestamp: string;
  }[];

  // Self-healing tracking
  iteration_count: number;
  max_iterations: number;

  // Legacy fields (for backward compatibility)
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

/**
 * Compilation result from WebContainer or build process
 */
export interface CompilationResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
  errors?: {
    file: string;
    line: number;
    column: number;
    message: string;
    type: 'syntax' | 'type' | 'import' | 'runtime';
  }[];
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  thought: string;
  output: any;
  project_state: Partial<ProjectState>;
  next_phase?: AgentPhase;
}
