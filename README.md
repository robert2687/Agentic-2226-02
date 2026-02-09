# Agentic Studio Pro

The Architecture of Intent in Browser-Native Development

Agentic Studio Pro represents a fundamental shift from "open-loop" AI-assisted coding to a **Closed-Loop, Self-Healing Autonomous Architecture**. Instead of generating code that "fires into the void," this system validates every output through compilation, automatically detects errors, and repairs itself through a specialized agent swarm.

## 🚀 Key Features

- **🔄 Closed-Loop Validation**: Every code generation is compiled and validated, with automatic error detection
- **🤖 Specialized Agent Swarm**: Planner → Designer → Architect → Coder → Patcher pipeline
- **🩹 Self-Healing**: Up to 3 automatic repair attempts when build errors occur
- **🎨 Design-First**: Every app has a professional design system (no generic UIs)
- **📊 Mock Data Mandate**: All generated apps include 20+ realistic data records (no "Lorem Ipsum")
- **⚡ Zero Placeholders**: Anti-Laziness Protocol enforces complete, functional code

## 🏗️ Architecture Overview

```txt
User Intent → PLANNER → DESIGNER → ARCHITECT → CODER → COMPILATION
                                                            │
                                                            ├─(Success)─→ READY ✅
                                                            │
                                                            └─(Errors)──→ PATCHER
                                                                            │
                                                                            └─→ Re-compile (max 3x)
```

**[Read Full Architecture Documentation →](./ARCHITECTURE.md)**

## 📋 Prerequisites

- **Node.js** 18+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to `http://localhost:5173`

## 💡 Usage

### Basic Example

```typescript
import { AgentOrchestrator } from './services/agentOrchestrator';

const orchestrator = new AgentOrchestrator({
  mode: 'ai',  // or 'simulation' or 'hybrid'
  
  onLog: (log) => console.log(`[${log.agent}] ${log.message}`),
  onPhaseChange: (phase) => console.log(`Phase: ${phase}`),
  onComplete: () => console.log('Done!'),
  onError: (error) => console.error(error)
});

// Start building an app
orchestrator.start('Build a cyberpunk analytics dashboard with revenue tracking');
```

### Modes

- **`ai`**: Uses Gemini API for real agent execution (requires API key)
- **`simulation`**: Demo mode with pre-scripted responses (no API key needed)
- **`hybrid`**: Tries AI first, falls back to simulation if unavailable

**[View More Examples →](./examples/pipelineExamples.ts)**

## 🤖 The Agent Pipeline

### 1. PLANNER (Product Manager)

- Analyzes user intent
- Defines features and data models
- Generates realistic mock data (20+ records)

### 2. DESIGNER (Visual Expert)

- Performs "Vibe Check" (extracts aesthetic keywords)
- Creates Tailwind-based design system
- Defines color palette and typography

### 3. ARCHITECT (File System Manager)

- Scaffolds Next.js 14 App Router structure
- Creates directory tree
- Ensures proper entry points

### 4. CODER (Senior Engineer)

- Generates COMPLETE, FUNCTIONAL code
- Enforces Anti-Laziness Protocol (no placeholders)
- Integrates design tokens
- Uses Shadcn/UI components

### 5. PATCHER (Self-Healing Medic)

- Analyzes compilation errors
- Applies surgical fixes (line-level edits)
- Re-compiles and validates
- Max 3 attempts before requesting human help

## 🔧 Project Structure

```text
src/
├── services/
│   ├── agentOrchestrator.ts      # Main orchestration engine
│   ├── agentPrompts.ts           # Specialized agent prompts
│   ├── compilationService.ts     # Build validation & error detection
│   ├── geminiService.ts          # Gemini API integration
│   └── simulationService.ts      # Demo mode simulation
├── components/
│   ├── AgentCard.tsx             # Agent visualization
│   ├── CommandPalette.tsx        # Command interface
│   └── Workspace/                # Main workspace UI
├── hooks/
│   └── useAgentWorkflow.ts       # React hook for workflow
├── types.ts                      # TypeScript definitions
└── constants.tsx                 # System prompts & config
```

## 📊 ProjectState (The "Collective Consciousness")

All agents share a unified state object:

```typescript
interface ProjectState {
  user_prompt: string;              // Original intent
  plan: { features, dataModels };   // Planner output
  design_system: { colors, fonts }; // Designer output
  file_system: FileNode[];          // Architect + Coder output
  terminal_logs: BuildLog[];        // Compilation feedback
  iteration_count: number;          // Self-healing attempts
}
```

This prevents hallucination drift and ensures deterministic execution.

## 🎨 Design Philosophy

### Mock Data Mandate

❌ **Bad**: Empty tables, "Lorem Ipsum", "Sample Product 1"
✅ **Good**: Realistic data with names, prices, dates, categories

### Anti-Laziness Protocol

❌ **Forbidden**:

```typescript
// ... rest of code
// TODO: Implement later
// Add more logic here
```

✅ **Required**: Complete, copy-pasteable, functional code

### Design-First Approach

Every app gets:

- Professional color palette (Tailwind classes)
- Typography system (Inter/Geist + JetBrains Mono)
- Semantic design tokens
- Consistent spacing/layout

## 🔍 Self-Healing Example

```text
1. CODER generates code with import error:
   import { LineChart } from 'recharts';  ❌ Wrong!

2. COMPILATION detects error:
   stderr: Module "recharts" has no exported member 'LineChart'

3. PATCHER analyzes and fixes:
   - Before: import { LineChart } from 'recharts';
   - After:  import { Line } from 'recharts';  ✅

4. Re-compile → Success!
```

## 🚦 Error Recovery

### Recoverable Errors (Patcher can fix)

- Import errors (wrong named exports)
- Type errors (missing annotations)
- Syntax errors (unmatched brackets)
- Missing dependencies

### Fatal Errors (Require human help)

- Out of disk space
- Permission denied
- Path misconfiguration

**Safety Valve**: Max 3 healing attempts to prevent infinite loops

## 📈 Roadmap

- [ ] WebContainer integration (browser-native Node.js execution)
- [ ] Real-time agent output streaming
- [ ] Advanced error pattern recognition
- [ ] Multi-file diff visualization
- [ ] GitHub export functionality
- [ ] Team collaboration features

## 🤝 Contributing

Contributions welcome! Please read [ARCHITECTURE.md](./ARCHITECTURE.md) first to understand the system design.

## 📄 License

MIT

## 🔗 Links

- **Full Architecture Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Usage Examples**: [examples/pipelineExamples.ts](./examples/pipelineExamples.ts)
- **Gemini API**: <https://aistudio.google.com/app/apikey>

---

**Built with the Architecture of Intent** 🚀
