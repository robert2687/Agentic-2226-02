import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../../types';
import { Terminal as TerminalIcon } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

export const Terminal: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] rounded-lg overflow-hidden border border-border font-mono text-sm shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f1f23] border-b border-border">
        <div className="flex items-center gap-2 text-gray-400">
          <TerminalIcon size={14} />
          <span className="text-xs font-medium">WebContainer | Node.js Runtime</span>
        </div>
        <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-gray-500 italic">
          > Agentic Studio environment initialized...<br/>
          > Waiting for user prompt...
        </div>
        
        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex gap-2 items-baseline">
                <span className="text-gray-600 text-[10px] select-none">[{log.timestamp}]</span>
                <span className={`text-xs font-bold uppercase tracking-wider w-20 shrink-0 ${
                    log.agent === 'PLANNER' ? 'text-purple-400' :
                    log.agent === 'DESIGNER' ? 'text-pink-400' :
                    log.agent === 'ARCHITECT' ? 'text-blue-400' :
                    log.agent === 'CODER' ? 'text-emerald-400' :
                    log.agent === 'PATCHER' ? 'text-red-400' :
                    log.agent === 'COMPILER' ? 'text-yellow-400' :
                    'text-gray-400'
                }`}>
                    {log.agent}
                </span>
                <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    'text-gray-300'
                }`}>
                    {log.message}
                </span>
            </div>
            {log.codeBlock && (
                <div className="ml-28 mt-2 p-2 bg-black/50 border border-white/10 rounded text-xs text-blue-200 whitespace-pre font-mono">
                    {log.codeBlock}
                </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
