import React from 'react';
import { Agent } from '../lib/mockData';
import { Power, ShieldPlus, Cpu } from 'lucide-react';

interface Props {
  agent: Agent;
  onToggle: (id: string) => void;
  onHeal: (id: string) => void;
}

export const AgentCard: React.FC<Props> = ({ agent, onToggle, onHeal }) => {
  const isError = agent.status === 'error';
  const isActive = agent.status === 'active';

  return (
    <div className={`
      relative p-5 rounded-xl border transition-all duration-300 group
      ${isError ? 'bg-red-950/10 border-red-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isError ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{agent.name}</h3>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{agent.type}</span>
          </div>
        </div>
        <div className="relative">
             <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-slate-500'}`} />
             {isActive && <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Integrity</span>
          <span className={`${agent.healthScore < 50 ? 'text-red-400' : 'text-emerald-400'} font-mono`}>{agent.healthScore}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${agent.healthScore < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${agent.healthScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-slate-500">Current Process</span>
          <span className="text-slate-300 font-mono truncate max-w-[120px]">{agent.lastAction}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/50 opacity-100 transition-opacity">
        <button 
          onClick={() => onToggle(agent.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
             isActive 
             ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
             : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          <Power size={14} />
          {isActive ? 'Deactivate' : 'Initialize'}
        </button>
        {isError && (
          <button 
            onClick={() => onHeal(agent.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium transition-colors animate-pulse"
          >
            <ShieldPlus size={14} />
            Auto-Heal
          </button>
        )}
      </div>
    </div>
  );
};
