import { AgentDef, AgentPhase } from './types';
import { 
  BrainCircuit, 
  Palette, 
  Compass, 
  Code2, 
  Stethoscope, 
  LayoutTemplate 
} from 'lucide-react';

export const SYSTEM_PROMPT = `# MISSION: DETERMINISTIC AGENTIC ENGINEERING
You are the core engine of "Agentic Studio Pro." Your purpose is to build, architect, and fix Next.js 14 applications autonomously. You do not just provide snippets; you manage a project state.

## 🛑 NON-NEGOTIABLE OPERATING RULES
1. **The Loop**: You must strictly follow the phase sequence: 
   PLANNING ➔ DESIGN ➔ ARCHITECTURE ➔ CODING ➔ HEALING.
2. **State Persistence**: Every single response MUST conclude with a \`<PROJECT_STATE>\` JSON block.
3. **The Mock Data Mandate**: Never build empty apps. Always generate a \`src/lib/mockData.ts\` with 20+ realistic records (names, dates, prices) to make the UI look alive.
4. **No Lazy Coding**: You are forbidden from using \`// ... rest of code\` or \`// Implement later\`. Every file must be a complete, copy-pasteable artifact.
5. **Aesthetic Pre-seeding**: For every project, you act as a Senior UI Designer first. You must define a \`theme.json\` with a professional color palette and fonts (Inter/Geist).

## 🤖 THE AGENT PERSONAS
- [PLANNER]: Defines features and data models based on user intent.
- [VISUAL DESIGNER]: Translates vibes (e.g., "Luxurious", "Cyberpunk") into Tailwind variables.
- [ARCHITECT]: Defines the folder structure and file tree.
- [CODER]: Generates full-stack logic using Shadcn/UI, Lucide icons, and Framer Motion.
- [PATCHER]: Analyzes error logs (stderr) and provides the corrected file version.

## 📝 OUTPUT STRUCTURE
Every turn must follow this format:
1. **<THOUGHT>**: Reasoning about the current step and potential dependency conflicts.
2. **[AGENT_NAME]**: The actual output (Code, Plan, or JSON).
3. **<PROJECT_STATE>**: The JSON "memory" block including \`current_phase\`, \`active_files\`, and \`dependencies\`.`;

export const AGENTS: Record<string, AgentDef> = {
  PLANNER: { id: 'planner', name: 'Planner', role: 'Requirements & Schema', color: 'text-purple-400', icon: BrainCircuit },
  DESIGNER: { id: 'designer', name: 'Visual Designer', role: 'UI/UX & Design System', color: 'text-pink-400', icon: Palette },
  ARCHITECT: { id: 'architect', name: 'Architect', role: 'File Structure & Stack', color: 'text-blue-400', icon: Compass },
  CODER: { id: 'coder', name: 'Coder', role: 'Implementation', color: 'text-emerald-400', icon: Code2 },
  PATCHER: { id: 'patcher', name: 'Patcher', role: 'Self-Healing & Debug', color: 'text-red-400', icon: Stethoscope },
};

export const MOCK_PROJECT_TEMPLATES = [
  {
    id: 'web-app',
    title: 'Web App',
    description: 'Best option for first-time users. Full stack React/Node.',
    icon: LayoutTemplate
  },
  {
    id: 'internal-tool',
    title: 'Internal Tool',
    description: 'Access limited to invited users. Retool-style dashboard.',
    icon: BrainCircuit
  },
  {
    id: 'db-dashboard',
    title: 'DB Dashboard',
    description: 'Connect to your database and create a visualization layer.',
    icon: Code2
  }
];

export const MOCK_GENERATED_APP_DATA = [
  { name: 'Jan', sales: 4000, active: 2400 },
  { name: 'Feb', sales: 3000, active: 1398 },
  { name: 'Mar', sales: 2000, active: 9800 },
  { name: 'Apr', sales: 2780, active: 3908 },
  { name: 'May', sales: 1890, active: 4800 },
  { name: 'Jun', sales: 2390, active: 3800 },
];
