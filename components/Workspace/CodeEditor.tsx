import React from 'react';
import { FileCode, X, Search, GitBranch, Braces } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const code = `import React, { createContext, useContext, useReducer } from 'react';
import { MOCK_DATA } from '@/lib/mockData';

// ------------------------------------------------------------------
// THE BRAIN: Deterministic State Management
// ------------------------------------------------------------------

type Action = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'REFRESH_METRICS' };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      // Auto-calculate new revenue when a transaction is added
      const newRevenue = state.revenue + action.payload.amount;
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        revenue: newRevenue,
        // Update chart data in real-time
        chartData: updateChart(state.chartData, newRevenue) 
      };

    case 'DELETE_TRANSACTION':
      const target = state.transactions.find(t => t.id === action.id);
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.id),
        revenue: state.revenue - (target?.amount || 0)
      };

    case 'REFRESH_METRICS':
      return {
         ...state,
         activeUsers: state.activeUsers + Math.floor(Math.random() * 50),
         lastUpdated: new Date().toISOString()
      };

    default:
      return state;
  }
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // The Single Source of Truth
  const [state, dispatch] = useReducer(appReducer, MOCK_DATA);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};`;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden font-mono text-sm border border-[#2b2b2b] shadow-2xl animate-in fade-in duration-300">
      {/* Tab Bar */}
      <div className="flex bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-t-2 border-t-[#3b82f6] text-[#e0e0e0] min-w-[160px] border-r border-[#1e1e1e]">
          <Braces size={14} className="text-blue-400" />
          <span className="text-xs truncate">AppContext.tsx</span>
          <X size={14} className="ml-auto text-gray-400 hover:text-white cursor-pointer rounded-md hover:bg-[#333] p-0.5" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-[#969696] hover:bg-[#2a2a2b] cursor-pointer min-w-[140px] border-r border-[#1e1e1e]">
          <FileCode size={14} className="text-yellow-400" />
          <span className="text-xs truncate">page.tsx</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-[#969696] hover:bg-[#2a2a2b] cursor-pointer min-w-[140px] border-r border-[#1e1e1e]">
          <FileCode size={14} className="text-cyan-400" />
          <span className="text-xs truncate">RevenueChart.tsx</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4 flex">
        {/* Line Numbers */}
        <div className="flex flex-col text-right pr-4 text-[#858585] select-none border-r border-[#333] mr-4 min-w-[3rem]">
          {code.split('\n').map((_, i) => (
            <span key={i} className="leading-6 hover:text-[#c6c6c6] cursor-pointer">{i + 1}</span>
          ))}
        </div>
        
        {/* Code Area */}
        <pre className="text-[#d4d4d4] font-mono leading-6 whitespace-pre">
          <code dangerouslySetInnerHTML={{ 
            __html: code
              .replace(/import/g, '<span class="text-[#c586c0]">import</span>')
              .replace(/from/g, '<span class="text-[#c586c0]">from</span>')
              .replace(/const/g, '<span class="text-[#569cd6]">const</span>')
              .replace(/return/g, '<span class="text-[#c586c0]">return</span>')
              .replace(/export/g, '<span class="text-[#569cd6]">export</span>')
              .replace(/function/g, '<span class="text-[#569cd6]">function</span>')
              .replace(/React/g, '<span class="text-[#4ec9b0]">React</span>')
              .replace(/type/g, '<span class="text-[#569cd6]">type</span>')
              .replace(/interface/g, '<span class="text-[#569cd6]">interface</span>')
              .replace(/case/g, '<span class="text-[#c586c0]">case</span>')
              .replace(/switch/g, '<span class="text-[#c586c0]">switch</span>')
              .replace(/default/g, '<span class="text-[#c586c0]">default</span>')
              .replace(/'@\/lib\/mockData'/g, '<span class="text-[#ce9178]">\'@/lib/mockData\'</span>')
          }} />
        </pre>
      </div>
      
      {/* Status Bar */}
      <div className="bg-[#007acc] text-white text-[10px] px-3 py-1 flex justify-between items-center select-none">
        <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1"><GitBranch size={10} /> main*</span>
            <span>0 errors, 0 warnings</span>
        </div>
        <div className="flex gap-4">
            <span>Ln 15, Col 42</span>
            <span>UTF-8</span>
            <span>TypeScript React</span>
            <span className="hover:bg-white/10 px-1 rounded cursor-pointer">Prettier</span>
        </div>
      </div>
    </div>
  );
};
