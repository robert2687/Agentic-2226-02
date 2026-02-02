import React from 'react';
import { AgentPhase, AgentDef } from '../../types';
import { AGENTS } from '../../constants';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface Props {
  currentPhase: AgentPhase;
}

export const AgentVisualization: React.FC<Props> = ({ currentPhase }) => {
  const phases = [
    { id: AgentPhase.PLANNING, agent: AGENTS.PLANNER },
    { id: AgentPhase.DESIGNING, agent: AGENTS.DESIGNER },
    { id: AgentPhase.ARCHITECTING, agent: AGENTS.ARCHITECT },
    { id: AgentPhase.CODING, agent: AGENTS.CODER },
    { id: AgentPhase.PATCHING, agent: AGENTS.PATCHER },
  ];

  const getPhaseStatus = (phaseId: AgentPhase) => {
    const phaseOrder = [
        AgentPhase.PLANNING, 
        AgentPhase.DESIGNING, 
        AgentPhase.ARCHITECTING, 
        AgentPhase.CODING, 
        AgentPhase.PATCHING,
        AgentPhase.READY
    ];
    
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phaseId);

    if (currentPhase === AgentPhase.READY) return 'completed';
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-surface border-b border-border p-6">
        <div className="flex justify-between items-center relative">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -z-0"></div>

            {phases.map((phase) => {
                const status = getPhaseStatus(phase.id);
                const isCompleted = status === 'completed';
                const isActive = status === 'active';
                const AgentIcon = phase.agent.icon;

                return (
                    <div key={phase.id} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500
                            ${isActive ? `border-${phase.agent.color.split('-')[1]}-500 bg-background shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-110` : ''}
                            ${isCompleted ? 'border-primary bg-primary/10' : ''}
                            ${!isActive && !isCompleted ? 'border-border bg-surface' : ''}
                        `}>
                            <AgentIcon 
                                size={20} 
                                className={`
                                    ${isActive ? `animate-pulse ${phase.agent.color}` : ''}
                                    ${isCompleted ? 'text-primary' : ''}
                                    ${!isActive && !isCompleted ? 'text-gray-600' : ''}
                                `} 
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={`text-xs font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                {phase.agent.name}
                            </span>
                            {isActive && (
                                <span className="text-[10px] text-primary flex items-center gap-1 mt-1">
                                    <Loader2 size={10} className="animate-spin" />
                                    Working
                                </span>
                            )}
                            {isCompleted && (
                                <span className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                                    <CheckCircle2 size={10} />
                                    Done
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
