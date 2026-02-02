import React, { useState, useEffect } from 'react';
import { AgentPhase } from '../../types';
import { usePreviewApp, PreviewProvider } from './PreviewContext';
import { RefreshCw, ExternalLink, Lock, Loader2, Bug, Stethoscope, TrendingUp, Users, DollarSign, Activity, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  status: AgentPhase;
  onTriggerError?: () => void;
  onRefine?: (prompt: string) => void;
}

// ----------------------------------------------------------------------
// GENERATED APP COMPONENT (The "Product" being built)
// ----------------------------------------------------------------------
const GeneratedSaaSDashboard = () => {
  const { state } = usePreviewApp();

  // Dynamic Theme Colors
  const theme = {
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', stroke: '#4f46e5' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', stroke: '#10b981' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', stroke: '#8b5cf6' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-600', stroke: '#f43f5e' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', stroke: '#f59e0b' },
  }[state.themeColor];

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-8 font-sans transition-colors duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
          <p className="text-slate-500 text-sm">Real-time financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
             <div className={`w-2 h-2 rounded-full ${state.themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></div>
             <span className="text-xs font-semibold text-slate-600">Live Connection</span>
          </div>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User" className="w-9 h-9 rounded-full border border-slate-200" />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
           <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}><DollarSign size={20} /></div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+12.5%</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">${state.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
           <div className="text-sm text-slate-500 mt-1">Total Revenue</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
           <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}><Users size={20} /></div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+4.2%</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">{state.activeUsers.toLocaleString()}</div>
           <div className="text-sm text-slate-500 mt-1">Active Users</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
           <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}><Activity size={20} /></div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">-1.2%</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">{state.bounceRate}%</div>
           <div className="text-sm text-slate-500 mt-1">Bounce Rate</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 h-[300px]">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} /> Revenue Trend</h3>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option>Last 6 Months</option>
                <option>Last Year</option>
            </select>
         </div>
         <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.chartData}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={theme.stroke} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} 
                        itemStyle={{color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="sales" stroke={theme.stroke} strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
                <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {state.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-mono text-slate-500">#{tx.id}</td>
                        <td className="px-6 py-3">
                            <div className="font-medium text-slate-900">{tx.user}</div>
                            <div className="text-xs text-slate-500">{tx.email}</div>
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-700">${tx.amount}</td>
                        <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {tx.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// PREVIEW FRAME CONTENT (Internal)
// ----------------------------------------------------------------------
const PreviewFrameContent: React.FC<Props> = ({ status, onTriggerError, onRefine }) => {
  const isReady = status === AgentPhase.READY;
  const isPatching = status === AgentPhase.PATCHING;
  const { dispatch } = usePreviewApp();
  const [isReloading, setIsReloading] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Trigger Hot Reload Effect on Status Change
  useEffect(() => {
     if (isReady || isPatching) {
         setIsReloading(true);
         const timer = setTimeout(() => setIsReloading(false), 1200);
         return () => clearTimeout(timer);
     }
  }, [status, isReady, isPatching]);

  const handleRefresh = () => {
      setIsReloading(true);
      setTimeout(() => setIsReloading(false), 1200);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim() || !onRefine) return;

    setIsRefining(true);
    // 1. Trigger App Logic (Logs)
    onRefine(refineInput);
    
    // 2. Trigger Visual Logic (Mock Update) with delay to match "agent work"
    setTimeout(() => {
        dispatch({ type: 'REFINE_UI', payload: refineInput });
        setIsRefining(false);
        setRefineInput('');
        setIsReloading(true);
        setTimeout(() => setIsReloading(false), 800);
    }, 1500);
  };

  if (!isReady && !isPatching) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center text-gray-500 gap-4 border border-border rounded-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="w-16 h-16 border-2 border-border border-t-primary rounded-full animate-spin"></div>
        <p className="animate-pulse">Building Application...</p>
        <div className="text-xs max-w-xs text-center text-gray-600">
            Waiting for: Planner, Designer, Architect, Coder, and Patcher to complete cycles.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/5 relative group/preview">
      {/* Browser Chrome (Light Mode to distinguish Preview) */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
        </div>
        
        <div className="flex gap-2 text-slate-400 mx-2">
            <button className="hover:text-slate-600"><RefreshCw size={14} className={isReloading ? "animate-spin" : ""} onClick={handleRefresh} /></button>
        </div>

        <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono shadow-sm">
          <Lock className="w-3 h-3 text-emerald-500" /> 
          <span className="text-slate-700">localhost:3000/dashboard</span>
        </div>
        
        <button 
             onClick={onTriggerError}
             disabled={isPatching}
             className="ml-2 text-[10px] flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-500 rounded border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
            <Bug size={10} />
            <span className="hidden sm:inline">Simulate Bug</span>
        </button>
      </div>

      {/* Actual Preview Area */}
      <div className="flex-1 relative bg-slate-50 overflow-auto scrollbar-thin scrollbar-thumb-slate-300">
        <AnimatePresence>
          {(isReloading && !isPatching) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Agentic Hot Reload...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GeneratedSaaSDashboard />

         {/* Self-Healing Overlay (Error State) */}
         <AnimatePresence>
         {isPatching && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center"
            >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Stethoscope size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Patcher Agent Active</h3>
                <p className="text-slate-400 max-w-md mb-6">
                    Runtime error detected in <span className="font-mono text-red-300">RevenueChart.tsx</span>. Reading stderr stream and applying hotfix...
                </p>
                <div className="w-full max-w-lg bg-black/50 rounded-lg p-4 border border-red-900/50 font-mono text-xs text-left text-red-300 mb-4 shadow-2xl overflow-hidden">
                    <div className="opacity-50 border-b border-white/10 pb-2 mb-2">stderr output:</div>
                    > Uncaught TypeError: Cannot read properties of undefined (reading 'map')<br/>
                    > at RevenueChart (src/components/Dashboard/RevenueChart.tsx:45)<br/>
                    <span className="text-blue-400 animate-pulse mt-2 block">> Analysis: "data" prop is missing from parent.</span>
                    <span className="text-green-400 mt-1 block">> Action: Implementing optional chaining & default props.</span>
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Refinement Floating Bar */}
        <AnimatePresence>
            {isReady && !isPatching && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40"
                >
                    <form 
                        onSubmit={handleRefineSubmit}
                        className="relative flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-slate-200 ring-1 ring-slate-900/5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
                    >
                        <div className="pl-3 text-slate-400">
                           {isRefining ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <Sparkles size={16} className="text-indigo-500" />}
                        </div>
                        <input 
                            type="text" 
                            value={refineInput}
                            onChange={(e) => setRefineInput(e.target.value)}
                            disabled={isRefining}
                            placeholder="Refine app (e.g., 'Change theme to Emerald' or 'Update charts')..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 h-9"
                        />
                        <button 
                            type="submit"
                            disabled={!refineInput || isRefining}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-full transition-colors shadow-sm"
                        >
                            <Send size={14} className={isRefining ? "opacity-0" : "opacity-100"} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// PREVIEW FRAME EXPORT
// ----------------------------------------------------------------------
export const PreviewFrame: React.FC<Props> = (props) => (
  <PreviewProvider>
    <PreviewFrameContent {...props} />
  </PreviewProvider>
);