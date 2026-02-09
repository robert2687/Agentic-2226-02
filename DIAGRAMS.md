# System Diagrams - Visual Reference

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│          (Command Palette / Workspace / Logs Display)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ User Intent
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT ORCHESTRATOR                          │
│                   (Cyclic State Machine)                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │             ProjectState (Shared Memory)               │    │
│  │  - user_prompt                                         │    │
│  │  - plan                                                │    │
│  │  - design_system                                       │    │
│  │  - file_system                                         │    │
│  │  - terminal_logs                                       │    │
│  │  - iteration_count                                     │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌──────────────────────┐      ┌──────────────────────┐
│  GEMINI AI SERVICE   │      │ COMPILATION SERVICE  │
│  - Chat interface    │      │ - Static analysis    │
│  - Retry logic       │      │ - Error detection    │
│  - Streaming         │      │ - Result parsing     │
└──────────────────────┘      └──────────────────────┘
```

## Agent Pipeline Flow

```text
                    START
                      │
                      ▼
        ┌─────────────────────────┐
        │   Phase 1: PLANNING     │
        │                         │
        │  Agent: PLANNER         │
        │  Input: user_prompt     │
        │  Output: plan{}         │
        │   - features            │
        │   - dataModels          │
        │   - mockDataSchema      │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │   Phase 2: DESIGNING    │
        │                         │
        │  Agent: DESIGNER        │
        │  Input: plan            │
        │  Output: design_system{}│
        │   - colorPalette        │
        │   - typography          │
        │   - theme               │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Phase 3: ARCHITECTING  │
        │                         │
        │  Agent: ARCHITECT       │
        │  Input: plan + design   │
        │  Output: file_system[]  │
        │   - directory structure │
        │   - file paths          │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │    Phase 4: CODING      │
        │                         │
        │  Agent: CODER           │
        │  Input: all previous    │
        │  Output: file contents  │
        │   - Complete code       │
        │   - No placeholders     │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  COMPILATION SERVICE    │
        │                         │
        │  - Static analysis      │
        │  - Syntax checking      │
        │  - Import validation    │
        └────────────┬────────────┘
                     │
            ┌────────┴────────┐
            │                 │
         SUCCESS           FAILURE
            │                 │
            │                 ▼
            │    ┌─────────────────────────┐
            │    │  Phase 5: PATCHING      │
            │    │                         │
            │    │  Agent: PATCHER         │
            │    │  Input: stderr logs     │
            │    │  Output: fixes[]        │
            │    │   - Surgical edits      │
            │    └────────────┬────────────┘
            │                 │
            │                 │ Apply fixes
            │                 │
            │                 ▼
            │    ┌─────────────────────────┐
            │    │   Re-compile            │
            │    │                         │
            │    │  iteration_count++      │
            │    └────────────┬────────────┘
            │                 │
            │        ┌────────┴────────┐
            │        │                 │
            │     SUCCESS      iteration_count >= 3?
            │        │                 │
            │        │              YES│NO
            │        │                 │
            │        │                 └─── (loop back to PATCHING)
            │        │
            └────────┴─────────┐
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Phase 6: READY    │
                    │                     │
                    │  ✅ Complete        │
                    └─────────────────────┘
```

## Self-Healing Loop Detail

```text
┌──────────────────────────────────────────────────────────────┐
│                  SELF-HEALING CYCLE                          │
└──────────────────────────────────────────────────────────────┘

    BUILD FAILS (exit_code !== 0)
            │
            ▼
    ┌──────────────────┐
    │ Capture stderr   │
    │ Capture stdout   │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ Is error recoverable?       │
    │                             │
    │ Check for:                  │
    │ - ENOSPC (out of space)     │
    │ - ENOMEM (out of memory)    │
    │ - Permission denied         │
    └────────┬────────────────────┘
             │
        ┌────┴────┐
        │         │
       NO        YES
        │         │
        │         ▼
        │    ┌──────────────────────┐
        │    │ iteration_count < 3? │
        │    └────────┬─────────────┘
        │             │
        │        ┌────┴────┐
        │        │         │
        │       NO        YES
        │        │         │
        │        │         ▼
        │        │    ┌────────────────────┐
        │        │    │ Activate PATCHER   │
        │        │    │                    │
        │        │    │ Analyze stderr:    │
        │        │    │ - Find error line  │
        │        │    │ - Identify cause   │
        │        │    │ - Generate fix     │
        │        │    └─────────┬──────────┘
        │        │               │
        │        │               ▼
        │        │    ┌────────────────────┐
        │        │    │ Apply surgical fix │
        │        │    │                    │
        │        │    │ - Line-level edit  │
        │        │    │ - Update file      │
        │        │    │ - Preserve context │
        │        │    └─────────┬──────────┘
        │        │               │
        │        │               ▼
        │        │    ┌────────────────────┐
        │        │    │ iteration_count++  │
        │        │    └─────────┬──────────┘
        │        │               │
        │        │               ▼
        │        │         Re-compile ──┐
        │        │               │      │
        │        │          ┌────┴────┐ │
        │        │          │         │ │
        │        │       SUCCESS   FAILURE
        │        │          │         │ │
        │        │          │         └─┘ (loop back if iteration_count < 3)
        │        │          │
        │        └──────────┼─────────────────┐
        │                   │                 │
        ▼                   ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│ FATAL ERROR │    │   SUCCESS   │    │ MAX ITERATIONS  │
│             │    │   ✅        │    │ REQUEST HUMAN   │
│ Stop & Log  │    │   READY     │    │ INTERVENTION    │
└─────────────┘    └─────────────┘    └─────────────────┘
```

## Data Flow

```text
┌───────────────────────────────────────────────────────────────┐
│                          USER INPUT                           │
│  "Build a cyberpunk e-commerce dashboard with analytics"     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AgentOrchestrator.start()                    │
│                                                                 │
│  Initialize ProjectState:                                      │
│  {                                                              │
│    id: "abc123",                                                │
│    user_prompt: "Build a cyberpunk...",                        │
│    status: PLANNING,                                            │
│    iteration_count: 0,                                          │
│    max_iterations: 3                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNER Execution                            │
│                                                                 │
│  Prompt: buildAgentPrompt(PLANNING, prompt, state)            │
│  ↓                                                             │
│  Gemini API Call                                               │
│  ↓                                                             │
│  Response: { plan: { features: [...], dataModels: [...] } }   │
│  ↓                                                             │
│  Update ProjectState.plan                                      │
│  ↓                                                             │
│  Emit: onStateUpdate(state)                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGNER Execution                           │
│                                                                 │
│  Input: ProjectState.plan                                      │
│  ↓                                                             │
│  Prompt: buildAgentPrompt(DESIGNING, prompt, state)           │
│  ↓                                                             │
│  Gemini API Call                                               │
│  ↓                                                             │
│  Response: { design_system: { colorPalette: {...}, ... } }    │
│  ↓                                                             │
│  Update ProjectState.design_system                             │
│  ↓                                                             │
│  Emit: onStateUpdate(state)                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                          [Similar flow for ARCHITECT and CODER]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COMPILATION SERVICE                            │
│                                                                 │
│  Input: ProjectState.file_system                               │
│  ↓                                                             │
│  For each file:                                                │
│    - Run static analysis                                       │
│    - Check imports                                             │
│    - Validate syntax                                           │
│  ↓                                                             │
│  Result: { success: true/false, stderr: "...", exit_code: 0/1 }│
│  ↓                                                             │
│  Update ProjectState.terminal_logs.push(result)                │
└─────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                 SUCCESS           FAILURE
                    │                 │
                    │                 ▼
                    │    ┌──────────────────────────┐
                    │    │  PATCHER Execution        │
                    │    │                          │
                    │    │  Input: stderr logs      │
                    │    │  ↓                       │
                    │    │  Analyze errors          │
                    │    │  ↓                       │
                    │    │  Generate fixes          │
                    │    │  ↓                       │
                    │    │  Apply to file_system    │
                    │    │  ↓                       │
                    │    │  iteration_count++       │
                    │    │  ↓                       │
                    │    │  Re-compile              │
                    │    └──────────┬───────────────┘
                    │               │
                    └───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         READY STATE                             │
│                                                                 │
│  Final ProjectState:                                           │
│  {                                                              │
│    status: READY,                                               │
│    plan: {...},                                                 │
│    design_system: {...},                                        │
│    file_system: [                                               │
│      { path: "src/app/page.tsx", content: "...", type: "file" }│
│    ],                                                           │
│    terminal_logs: [ { exit_code: 0, ... } ],                   │
│    generatedCode: true                                          │
│  }                                                              │
│  ↓                                                             │
│  Emit: onComplete()                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction

```text
┌─────────────────────────────────────────────────────────────┐
│                      Browser UI Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  App.tsx                                                    │
│    │                                                        │
│    ├─► CommandPalette.tsx                                  │
│    │     └─► Triggers workflow                             │
│    │                                                        │
│    ├─► Workspace/                                          │
│    │     ├─► AgentVisualization.tsx (Shows agent status)   │
│    │     ├─► CodeEditor.tsx (Displays generated files)     │
│    │     └─► Terminal.tsx (Shows logs)                     │
│    │                                                        │
│    └─► Layout/Sidebar.tsx                                  │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Uses Hook
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   React Hook Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  useAgentWorkflow.ts                                        │
│    │                                                        │
│    ├─► Creates AgentOrchestrator                           │
│    ├─► Manages workflow state                              │
│    ├─► Exposes: startWorkflow(), stopWorkflow()            │
│    └─► Returns: isRunning, currentPhase, error             │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Instantiates
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 Service Layer                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  agentOrchestrator.ts (Main)                                │
│    │                                                        │
│    ├─► Uses: geminiService.ts                              │
│    ├─► Uses: compilationService.ts                         │
│    ├─► Uses: agentPrompts.ts                               │
│    ├─► Uses: simulationService.ts                          │
│    │                                                        │
│    └─► Maintains: ProjectState                             │
│                   conversationHistory                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Calls External APIs
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Google Gemini API                                          │
│    - Model: gemini-pro                                      │
│    - Temperature: 0.7                                       │
│    - Max tokens: 2048                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow Timeline

```text
Time  Event                    Trigger                    Handler
─────────────────────────────────────────────────────────────────────
0ms   User submits prompt      Button click               startWorkflow()
                                                          ↓
10ms  Workflow starts          orchestrator.start()       onPhaseChange(PLANNING)
                                                          onLog("Starting...")
                                                          ↓
500ms PLANNER activates        executePhase(PLANNING)     onLog("Analyzing...")
                                                          ↓
1.5s  Gemini responds          API callback               parseAgentResponse()
                                                          onStateUpdate(state)
                                                          onLog("Plan created")
                                                          ↓
2s    DESIGNER activates       executePhase(DESIGNING)    onPhaseChange(DESIGNING)
                                                          ↓
3.5s  Design complete          API callback               onStateUpdate(state)
                                                          ↓
4s    ARCHITECT activates      executePhase(ARCHITECTING) onPhaseChange(ARCHITECTING)
                                                          ↓
5.5s  Architecture complete    API callback               onStateUpdate(state)
                                                          ↓
6s    CODER activates          executePhase(CODING)       onPhaseChange(CODING)
                                                          onLog("Generating code...")
                                                          ↓
8s    Code generation done     API callback               onStateUpdate(state)
                                                          ↓
8.5s  Compilation starts       validateCode()             onLog("Compiling...")
                                                          ↓
9s    Build error found        CompilationResult          onLog("Error detected")
                                                          onPhaseChange(PATCHING)
                                                          ↓
9.5s  PATCHER activates        executePhase(PATCHING)     onLog("Analyzing errors...")
                                                          ↓
11s   Fix applied              parsePatcherResponse()     onStateUpdate(state)
                                                          onLog("Applied fix")
                                                          ↓
11.5s Re-compile               validateCode()             onLog("Re-compiling...")
                                                          ↓
12s   Build succeeds           CompilationResult          onPhaseChange(READY)
                                                          onLog("Success!")
                                                          onComplete()
```

## State Transitions

```text
┌────────┐
│  IDLE  │ (Initial state)
└───┬────┘
    │ orchestrator.start()
    ▼
┌──────────┐
│ PLANNING │ → ProjectState.plan populated
└────┬─────┘
     │ executePlanningPhase() completes
     ▼
┌───────────┐
│ DESIGNING │ → ProjectState.design_system populated
└────┬──────┘
     │ executeDesignPhase() completes
     ▼
┌──────────────┐
│ ARCHITECTING │ → ProjectState.file_system structure created
└──────┬───────┘
       │ executeArchitecturePhase() completes
       ▼
┌────────┐
│ CODING │ → ProjectState.file_system content added
└───┬────┘
    │ executeCodingPhase() completes
    ▼
┌─────────────────┐
│  COMPILATION    │ (Not a phase, internal process)
└────┬────────────┘
     │
     ├─(success)──────────────────┐
     │                            │
     ├─(failure)                  │
     │                            │
     ▼                            │
┌──────────┐                      │
│ PATCHING │ (Self-healing)       │
└────┬─────┘                      │
     │                            │
     │ (max 3 iterations)         │
     │                            │
     ├─(fixed)────────────────────┤
     │                            │
     ├─(max reached)              │
     │      └─► onError()         │
     │                            │
     └────────────────────────────┘
                                  │
                                  ▼
                            ┌─────────┐
                            │  READY  │ → onComplete()
                            └─────────┘
```

---

## Legend

```text
┌─────┐
│ Box │  = Component / State / Process
└─────┘

  ─►    = Direct flow
  ↓     = Sequential step
  │     = Continuation
  
┌──┴──┐  = Decision point (branching)
```
