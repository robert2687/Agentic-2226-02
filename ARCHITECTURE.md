# Agentic Studio Pro - Architecture Documentation

## Overview

Agentic Studio Pro implements a **Closed-Loop, Self-Healing Architecture** for autonomous software development. Unlike traditional "open-loop" AI coding assistants that generate code without validation, this system integrates compilation validation and automatic error correction into the development pipeline.

## Core Principles

### 1. Closed-Loop Validation

Every code generation cycle includes compilation validation. If errors are detected, the Patcher agent automatically attempts repairs, creating a self-healing feedback loop.

### 2. Specialized Agent Swarm

Instead of a monolithic AI, the system deploys specialized agents:

- **Planner**: Product Manager persona
- **Designer**: Visual/UX expert
- **Architect**: File system manager
- **Coder**: Senior engineer (Anti-Laziness Protocol enforced)
- **Patcher**: Self-healing medic (Abductive Reasoning)

### 3. The "Collective Consciousness" (ProjectState)

All agents share a single source of truth—the `ProjectState` object—preventing hallucination drift and ensuring deterministic execution.

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    USER INTENT                               │
│              "Build an e-commerce dashboard"                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AGENT ORCHESTRATOR                          │
│              (Cyclic State Machine)                          │
└─────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│  PLANNER     │────────────────▶│ ProjectState │
│  (Phase 1)   │                 │  (Shared)    │
└──────┬───────┘                 └──────┬───────┘
       │                                │
       ▼                                ▼
┌──────────────┐                 ┌──────────────┐
│  DESIGNER    │────────────────▶│ Design System│
│  (Phase 2)   │                 │  (Tokens)    │
└──────┬───────┘                 └──────────────┘
       │
       ▼
┌──────────────┐
│  ARCHITECT   │────────────────▶ File System
│  (Phase 3)   │                  Structure
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    CODER     │────────────────▶ Full Code
│  (Phase 4)   │                  Implementation
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│     COMPILATION SERVICE                 │
│  (WebContainer / Build Validation)      │
└─────────────┬───────────────────────────┘
              │
              ├──(Success)──▶ READY ✅
              │
              └──(Errors)───▶ PATCHER (Phase 5)
                                  │
                                  │ (Surgical Fixes)
                                  │
                                  └──▶ Re-compile
                                        │
                                        ├──Max iterations? ──▶ Request Human Help
                                        └──Success? ──▶ READY ✅
```

## Pipeline Phases

### Phase 1: PLANNING

**Agent**: Planner (Product Manager)

**Responsibilities**:

- Translate natural language into technical specifications
- Define data models (TypeScript interfaces)
- **Enforce Mock Data Mandate**: Generate 20+ realistic records (no "Lorem Ipsum")

**Input**: User prompt
**Output**: Plan object with features, dataModels, technicalRequirements, mockDataSchema

**Example Output**:

```json
{
  "features": [
    "Product CRUD with search and filters",
    "Revenue analytics with charts",
    "User role management (Admin/User)"
  ],
  "dataModels": [
    {
      "name": "Product",
      "fields": [
        {"name": "id", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "price", "type": "number"},
        {"name": "stock", "type": "number"}
      ]
    }
  ],
  "mockDataSchema": {
    "products": [
      {"id": "prod_001", "title": "Ergonomic Keyboard", "price": 129.99, "stock": 45}
    ]
  }
}
```

### Phase 2: DESIGNING

**Agent**: Visual Designer (The Aesthete)

**Responsibilities**:

- Perform "Vibe Check" (extract aesthetic keywords from user intent)
- Create design system with Tailwind CSS classes
- Define semantic color tokens and typography

**Input**: User prompt + Plan
**Output**: Design system with colorPalette, typography, spacing, theme

**Vibe Translation Examples**:

| User Input      | Theme Output | Primary Color | Background |
| --------------- | ------------ | ------------- | ---------- |
| "Cyberpunk"     | cyberpunk    | cyan-500      | slate-950  |
| "Professional"  | professional | blue-600      | slate-50   |
| "Cozy"          | cozy         | amber-400     | stone-100  |

### Phase 3: ARCHITECTING

**Agent**: Architect (File System Manager)

**Responsibilities**:

- Scaffold Next.js 14 App Router file structure
- **Aesthetic Pre-seeding**: Assume Shadcn/UI components exist
- Create required directories and file paths

**Input**: Plan + Design System
**Output**: File system array with paths and types

**Standard Structure**:

```text
src/
  app/
    layout.tsx
    page.tsx
  components/
    Dashboard/
      StatsCard.tsx
  context/
    AppContext.tsx
  lib/
    mockData.ts (MANDATORY)
    utils.ts
```

### Phase 4: CODING

**Agent**: Coder (Senior Engineer)

**Responsibilities**:

- Generate COMPLETE, FUNCTIONAL code for all files
- **Anti-Laziness Protocol**: NO placeholders (`// ... rest of code`, `TODO`)
- Inject design tokens directly into components
- Import mock data from `src/lib/mockData.ts`

**Input**: Plan + Design System + File Structure
**Output**: Array of files with full content

**Quality Requirements**:

- ✅ Every file must be copy-pasteable and work immediately
- ✅ Use Shadcn/UI components (`<Card>`, `<Button>`)
- ✅ Integrate design system tokens (`bg-cyan-500`)
- ✅ Functional logic, not hollow components
- ❌ NO placeholder comments
- ❌ NO "Lorem Ipsum" text

### Phase 5: COMPILATION & SELF-HEALING

**Service**: Compilation Service + Patcher Agent

**Compilation Process**:

1. Write files to virtual filesystem (WebContainer)
2. Run `npm run build` or equivalent
3. Capture stderr/stdout
4. Parse error messages

**If Build Fails**:

1. Activate Patcher agent
2. Patcher analyzes stderr using **Abductive Reasoning**
3. Apply **Surgical Fixes** (line-level edits, not full rewrites)
4. Re-compile
5. Repeat up to 3 times (Safety Valve)

**Patcher Output Example**:

```json
{
  "thought": "The error shows 'LineChart' is not exported. The correct import is 'Line'.",
  "fixes": [
    {
      "file": "src/components/Dashboard/RevenueChart.tsx",
      "line": 23,
      "before": "import { LineChart } from 'recharts';",
      "after": "import { Line } from 'recharts';"
    }
  ]
}
```

### Phase 6: READY

All agents completed successfully. Application is deployed and ready.

## ProjectState Structure

The **ProjectState** is the "collective consciousness" shared by all agents:

```typescript
interface ProjectState {
  // Metadata
  id: string;
  name: string;
  description: string;
  status: AgentPhase;
  
  // User intent
  user_prompt: string;
  
  // Phase outputs
  plan?: {
    features: string[];
    dataModels: any[];
    technicalRequirements: string[];
    mockDataSchema: Record<string, any>;
  };
  
  design_system?: {
    colorPalette: { primary, secondary, accent, background, text };
    typography: { heading, body, code };
    spacing: Record<string, string>;
    theme: 'cyberpunk' | 'cozy' | 'professional' | ...;
  };
  
  file_system: {
    path: string;
    content?: string;
    type: 'file' | 'directory';
    lastModified?: string;
  }[];
  
  // Compilation feedback
  terminal_logs: {
    stdout: string[];
    stderr: string[];
    exit_code?: number;
    timestamp: string;
  }[];
  
  // Self-healing tracking
  iteration_count: number;
  max_iterations: number;
}
```

## Error Handling & Recovery

### Recoverable Errors

The Patcher can fix:

- Import errors (e.g., wrong named exports)
- Type errors (missing type annotations)
- Syntax errors (unmatched brackets, missing semicolons)
- Missing dependencies

### Fatal Errors (Require Human Intervention)

- Out of disk space (ENOSPC)
- Out of memory (ENOMEM)
- Permission denied
- Path alias misconfiguration

### Safety Valve

After 3 failed healing attempts, the system stops and requests human help to prevent infinite token consumption.

## Usage Example

```typescript
import { AgentOrchestrator } from './services/agentOrchestrator';

const orchestrator = new AgentOrchestrator({
  mode: 'ai', // or 'simulation' or 'hybrid'
  onLog: (log) => console.log(log),
  onPhaseChange: (phase) => console.log(`Phase: ${phase}`),
  onStateUpdate: (state) => console.log('State updated:', state),
  onComplete: () => console.log('Workflow complete!'),
  onError: (error) => console.error('Error:', error)
});

orchestrator.start('Build a cyberpunk e-commerce dashboard with product management');
```

## Key Innovations

1. **No Empty Apps**: Mock Data Mandate ensures every generated app has realistic data
2. **Design-First**: Every component uses professional design tokens
3. **Zero Placeholders**: Anti-Laziness Protocol forbids incomplete code
4. **Self-Healing**: Automatic error detection and repair (up to 3 attempts)
5. **Deterministic**: Shared ProjectState prevents hallucination drift

## Future Enhancements

- [ ] WebContainer integration for real browser-native execution
- [ ] Real-time streaming of agent outputs
- [ ] Advanced error pattern recognition
- [ ] Multi-file diff visualization
- [ ] Export to GitHub repository
- [ ] Team collaboration features
