import { AgentPhase, LogEntry } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createLog = (agent: string, message: string, type: LogEntry['type'] = 'info', codeBlock?: string): LogEntry => ({
  id: generateId(),
  timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  agent,
  message,
  type,
  codeBlock
});

export const SIMULATION_STEPS = [
  // PLANNING
  { phase: AgentPhase.PLANNING, delay: 500, log: createLog('SYSTEM', 'Booting Agentic Studio Pro Environment...', 'system') },
  { phase: AgentPhase.PLANNING, delay: 1000, log: createLog('SYSTEM', 'Connecting to Gemini 3 Pro (Orchestrator)...', 'info') },
  { phase: AgentPhase.PLANNING, delay: 1500, log: createLog('PLANNER', 'Ingesting user intent: "AI Research Portfolio".', 'info') },
  { phase: AgentPhase.PLANNING, delay: 2500, log: createLog('PLANNER', 'Defining Logic Layer requirements: Deterministic State.', 'success') },
  
  // DESIGN
  { phase: AgentPhase.DESIGNING, delay: 3500, log: createLog('DESIGNER', 'Analyzing semantic vibe: "Command Center" (Dark/Slate-900).', 'info') },
  { phase: AgentPhase.DESIGNING, delay: 4500, log: createLog('DESIGNER', 'Generated theme.json: Slate/Indigo palette with Inter & JetBrains Mono.', 'info') },
  
  // ARCHITECT
  { phase: AgentPhase.ARCHITECTING, delay: 6000, log: createLog('ARCHITECT', 'Initializing WebContainer filesystem...', 'info') },
  { phase: AgentPhase.ARCHITECTING, delay: 7000, log: createLog('ARCHITECT', 'Scaffolding Next.js 14 App Router structure.', 'success', `src/
  app/
    layout.tsx
    page.tsx
  context/
    AppContext.tsx
  components/
    Dashboard/
      StatsCard.tsx
      RevenueChart.tsx
  lib/
    utils.ts`) },

  // CODING (The Functional Brain)
  { phase: AgentPhase.CODING, delay: 8500, log: createLog('CODER', 'Writing src/lib/mockData.ts (Mock Data Mandate).', 'info') },
  { phase: AgentPhase.CODING, delay: 9500, log: createLog('CODER', 'Implementing "Functional Brain" in src/context/AppContext.tsx.', 'info') },
  { phase: AgentPhase.CODING, delay: 10500, log: createLog('CODER', 'Wiring deterministic reducers for Add/Delete actions.', 'success', `const appReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, revenue: state.revenue + action.payload };
    // ... global state sync
  }
}`) },
  { phase: AgentPhase.CODING, delay: 12000, log: createLog('SYSTEM', 'Starting WebContainer build process...', 'system') },
  
  // ERROR SIMULATION & PATCHING (Build Time)
  { phase: AgentPhase.PATCHING, delay: 13500, log: createLog('STDERR', 'Error: Module "recharts" has no exported member "LineChart".', 'error') },
  { phase: AgentPhase.PATCHING, delay: 14000, log: createLog('PATCHER', 'Build Error Detected. Reading stderr stream...', 'info') },
  { phase: AgentPhase.PATCHING, delay: 15000, log: createLog('PATCHER', 'Applying hotfix to RevenueChart.tsx: Fixed named imports.', 'success') },
  
  // READY
  { phase: AgentPhase.READY, delay: 16500, log: createLog('SYSTEM', 'Build successful. Dev server listening on port 3000.', 'success') },
  { phase: AgentPhase.READY, delay: 17000, log: createLog('PATCHER', 'System Monitor Active: Watching for Runtime Errors.', 'system') },
  { phase: AgentPhase.READY, delay: 17500, log: createLog('SYSTEM', 'App available at http://localhost:3000', 'info') },
];
