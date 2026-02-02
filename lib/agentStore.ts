import { useState } from 'react';
import { Agent } from './mockData';

export const useAgentController = (initialState: Agent[]) => {
  const [agents, setAgents] = useState<Agent[]>(initialState);

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== id) return agent;
      return {
        ...agent,
        status: agent.status === 'active' ? 'idle' : 'active'
      };
    }));
  };

  const healAgent = (id: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== id) return agent;
      return {
        ...agent,
        status: 'active',
        healthScore: 100,
        lastAction: 'System Restored'
      };
    }));
  };

  const healAll = () => {
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'active',
      healthScore: 100,
      lastAction: 'Global System Restore'
    })));
  };

  return { agents, toggleAgentStatus, healAgent, healAll };
};