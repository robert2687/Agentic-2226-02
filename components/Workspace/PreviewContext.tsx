import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { initialAgents, Agent } from '../../lib/mockData';

// 1. Define the Shape of the Application State
interface Transaction {
  id: string;
  user: string;
  email: string;
  amount: number;
  status: 'completed' | 'pending';
}

interface ChartDataPoint {
  name: string;
  sales: number;
  active: number;
}

interface AppState {
  revenue: number;
  activeUsers: number;
  bounceRate: number;
  transactions: Transaction[];
  chartData: ChartDataPoint[];
  agents: Agent[];
  themeColor: 'indigo' | 'emerald' | 'violet' | 'rose' | 'amber'; // Added for refinement
}

// 2. Define Actions
type Action = 
  | { type: 'REFRESH_DATA' }
  | { type: 'ADD_TRANSACTION' }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'REFINE_UI'; payload: string }; // New Action

// 3. Initial Mock Data (The "Mock Data Mandate")
const INITIAL_STATE: AppState = {
  revenue: 45231.89,
  activeUsers: 2350,
  bounceRate: 12.5,
  transactions: [
    { id: '1', user: 'Alice Smith', email: 'alice@research.edu', amount: 1200, status: 'completed' },
    { id: '2', user: 'Bob Jones', email: 'bob@lab.io', amount: 950, status: 'pending' },
    { id: '3', user: 'Charlie Day', email: 'charlie@ai.net', amount: 2100, status: 'completed' },
    { id: '4', user: 'Dana White', email: 'dana@future.org', amount: 800, status: 'completed' },
    { id: '5', user: 'Evan Li', email: 'evan@tech.com', amount: 1500, status: 'completed' },
  ],
  chartData: [
    { name: 'Jan', sales: 4000, active: 2400 },
    { name: 'Feb', sales: 3000, active: 1398 },
    { name: 'Mar', sales: 2000, active: 9800 },
    { name: 'Apr', sales: 2780, active: 3908 },
    { name: 'May', sales: 1890, active: 4800 },
    { name: 'Jun', sales: 2390, active: 3800 },
  ],
  agents: initialAgents,
  themeColor: 'indigo'
};

// 4. Deterministic Reducer Logic
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'REFRESH_DATA':
      return {
        ...state,
        activeUsers: state.activeUsers + Math.floor(Math.random() * 200) - 50,
        revenue: state.revenue + (Math.random() * 1000 - 200),
        chartData: state.chartData.map(d => ({
          ...d,
          sales: Math.abs(d.sales + Math.floor(Math.random() * 1000) - 200)
        })),
        agents: state.agents.map(agent => ({
          ...agent,
          healthScore: Math.min(100, Math.max(0, agent.healthScore + Math.floor(Math.random() * 10) - 5))
        }))
      };
    case 'ADD_TRANSACTION':
      const newAmount = Math.floor(Math.random() * 1000) + 100;
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'New Researcher',
        email: 'researcher@inst.org',
        amount: newAmount,
        status: 'completed'
      };
      return {
        ...state,
        revenue: state.revenue + newAmount,
        transactions: [newTx, ...state.transactions],
        // Synchronize Chart with new Transaction
        chartData: state.chartData.map((d, i) => 
          i === state.chartData.length - 1 ? { ...d, sales: d.sales + newAmount } : d
        )
      };
    case 'DELETE_TRANSACTION':
      const tx = state.transactions.find(t => t.id === action.id);
      if (!tx) return state;
      return {
        ...state,
        revenue: state.revenue - tx.amount,
        transactions: state.transactions.filter(t => t.id !== action.id),
        // Synchronize Chart with removed Transaction
         chartData: state.chartData.map((d, i) => 
          i === state.chartData.length - 1 ? { ...d, sales: Math.max(0, d.sales - tx.amount) } : d
        )
      };
    case 'REFINE_UI':
        // Determine new theme based on prompt or random rotation
        const colors: AppState['themeColor'][] = ['indigo', 'emerald', 'violet', 'rose', 'amber'];
        let nextColor = state.themeColor;
        
        const prompt = action.payload.toLowerCase();
        if (prompt.includes('green') || prompt.includes('emerald')) nextColor = 'emerald';
        else if (prompt.includes('purple') || prompt.includes('violet')) nextColor = 'violet';
        else if (prompt.includes('red') || prompt.includes('rose')) nextColor = 'rose';
        else if (prompt.includes('orange') || prompt.includes('amber')) nextColor = 'amber';
        else if (prompt.includes('blue') || prompt.includes('indigo')) nextColor = 'indigo';
        else {
            // Random rotation if no color specified
            const currentIndex = colors.indexOf(state.themeColor);
            nextColor = colors[(currentIndex + 1) % colors.length];
        }

        return {
            ...state,
            themeColor: nextColor,
            // Shake up the data a bit to show "change"
            revenue: state.revenue + (Math.random() * 5000),
            activeUsers: state.activeUsers + 150
        };
    default:
      return state;
  }
};

const PreviewContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  return (
    <PreviewContext.Provider value={{ state, dispatch }}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreviewApp = () => {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("usePreviewApp must be used within a PreviewProvider");
  return context;
};