export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  healthScore: number;
  lastAction: string;
  type: 'Research' | 'Design' | 'Engineering' | 'Analytics';
}

export const initialAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Manus Prime',
    status: 'active',
    healthScore: 98,
    lastAction: 'Market Synthesis',
    type: 'Research'
  },
  {
    id: 'agent-002',
    name: 'Gemini-3-Vision',
    status: 'idle',
    healthScore: 100,
    lastAction: 'UI Audit',
    type: 'Design'
  },
  {
    id: 'agent-003',
    name: 'Claude-Patcher',
    status: 'error',
    healthScore: 42,
    lastAction: 'Kernel Debug',
    type: 'Engineering'
  },
  {
    id: 'agent-004',
    name: 'Data-Seeker-X',
    status: 'active',
    healthScore: 89,
    lastAction: 'Scraping arXiv',
    type: 'Research'
  },
  {
    id: 'agent-005',
    name: 'Atlas-Architect',
    status: 'active',
    healthScore: 95,
    lastAction: 'DB Schema Opt.',
    type: 'Engineering'
  }
];
