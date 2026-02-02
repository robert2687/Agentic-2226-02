import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk'; 
import { Search, Zap, ShieldAlert, Play, Plus, Terminal, Bot } from 'lucide-react';
import { Agent } from '../lib/mockData';

interface Props {
  agents: Agent[];
  onAction: (action: string, id?: string) => void;
}

export const CommandPalette: React.FC<Props> = ({ agents, onAction }) => {
  const [open, setOpen] = useState(false);

  // Keyboard Shortcut Listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-xl bg-[#0e0e11] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-zoom-in ring-1 ring-white/10">
        <div className="flex items-center border-b border-slate-800 px-4 py-3 bg-white/5">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <Command.Input 
            placeholder="Type a command or search agents..." 
            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-500 font-medium"
          />
          <div className="flex items-center gap-1">
             <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">ESC</span>
          </div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
          <Command.Empty className="py-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <Bot size={24} className="opacity-20" />
            No results found.
          </Command.Empty>

          <Command.Group heading="Global Actions" className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2 mt-2 font-bold">
            <Item 
              onSelect={() => { onAction('heal_all'); setOpen(false); }} 
              icon={<ShieldAlert className="w-4 h-4 text-red-500" />} 
              label="Surgical Heal All Agents" 
              shortcut="⌘H" 
            />
            <Item 
              onSelect={() => { onAction('deploy'); setOpen(false); }} 
              icon={<Zap className="w-4 h-4 text-amber-500" />} 
              label="Deploy to Production" 
              shortcut="⌘D" 
            />
            <Item 
              onSelect={() => { onAction('restart'); setOpen(false); }} 
              icon={<Play className="w-4 h-4 text-green-500" />} 
              label="Restart Simulation" 
              shortcut="⌘R" 
            />
          </Command.Group>

          <Command.Group heading="Active Agents" className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2 mt-4 font-bold">
            {agents.map((agent) => (
              <Item 
                key={agent.id}
                onSelect={() => { onAction('focus', agent.id); setOpen(false); }} 
                icon={
                  <div className={`flex items-center justify-center w-5 h-5 rounded-md ${agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : agent.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                     <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-emerald-500' : agent.status === 'error' ? 'bg-red-500' : 'bg-slate-500'}`} />
                  </div>
                } 
                label={`Focus ${agent.name}`} 
                subLabel={agent.type}
              />
            ))}
          </Command.Group>
        </Command.List>
        
        <div className="bg-[#09090b] px-4 py-2 flex justify-between items-center border-t border-slate-800 text-[10px] text-slate-500">
          <span>Agentic Studio Pro v2.4</span>
          <div className="flex gap-2">
            <span>Commands</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
};

const Item = ({ icon, label, subLabel, shortcut, onSelect }: any) => (
  <Command.Item 
    onSelect={onSelect}
    className="flex items-center justify-between p-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer transition-colors group aria-selected:bg-white/10 aria-selected:text-white"
  >
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex flex-col">
          <span>{label}</span>
          {subLabel && <span className="text-[10px] text-slate-500 font-mono -mt-0.5">{subLabel}</span>}
      </div>
    </div>
    {shortcut && <span className="text-[10px] text-slate-600 font-mono group-hover:text-slate-400 border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 rounded">{shortcut}</span>}
  </Command.Item>
);