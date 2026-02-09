# Quick Reference Guide - Agentic Studio Pro

## Workflow Execution

### Create an Orchestrator

```typescript
import { AgentOrchestrator } from './services/agentOrchestrator';

const orchestrator = new AgentOrchestrator({
  mode: 'ai' | 'simulation' | 'hybrid',
  onLog: (log) => { /* handle log */ },
  onPhaseChange: (phase) => { /* handle phase change */ },
  onStateUpdate: (state) => { /* handle state update */ },
  onComplete: () => { /* handle completion */ },
  onError: (error) => { /* handle error */ }
});
```

### Start Workflow

```typescript
orchestrator.start('Your project description here');
```

### Stop Workflow

```typescript
orchestrator.stop();
```

## Agent Phases

| Phase | Agent | Purpose | Output |
| --- | --- | --- | --- |
| PLANNING | Planner | Analyze intent, define requirements | Plan with features & data models |
| DESIGNING | Designer | Create design system | Color palette & typography |
| ARCHITECTING | Architect | Scaffold file structure | File tree |
| CODING | Coder | Generate code | Complete files with content |
| PATCHING | Patcher | Fix errors | Surgical code repairs |
| READY | System | Completion | None |

## ProjectState Fields

```typescript
{
  // Core
  id: string
  name: string
  status: AgentPhase
  user_prompt: string
  
  // Agent Outputs
  plan: {
    features: string[]
    dataModels: any[]
    mockDataSchema: object
  }
  
  design_system: {
    colorPalette: object
    typography: object
    theme: string
  }
  
  file_system: Array<{
    path: string
    content: string
    type: 'file' | 'directory'
  }>
  
  // Build Feedback
  terminal_logs: Array<{
    stdout: string[]
    stderr: string[]
    exit_code: number
  }>
  
  // Self-Healing
  iteration_count: number
  max_iterations: number  // Default: 3
}
```

## Event Handlers

### onLog(log: LogEntry)

Called for every log message

```typescript
interface LogEntry {
  id: string
  timestamp: string
  agent: string  // 'PLANNER' | 'DESIGNER' | 'ARCHITECT' | 'CODER' | 'PATCHER' | 'SYSTEM'
  message: string
  type: 'info' | 'success' | 'error' | 'system'
  codeBlock?: string
}
```

### onPhaseChange(phase: AgentPhase)

Called when entering a new phase

```typescript
enum AgentPhase {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  DESIGNING = 'DESIGNING',
  ARCHITECTING = 'ARCHITECTING',
  CODING = 'CODING',
  PATCHING = 'PATCHING',
  READY = 'READY'
}
```

### onStateUpdate(state: ProjectState)

Called after each agent completes its work

### onComplete()

Called when all phases succeed

### onError(error: Error)

Called on fatal errors

## Compilation Service

### Validate Code

```typescript
import { compilationService } from './services/compilationService';

const result = await compilationService.validateCode(projectState);

// result.success: boolean
// result.stdout: string
// result.stderr: string
// result.exit_code: number
// result.errors: Array<{ file, line, column, message, type }>
```

### Check if Error is Recoverable

```typescript
const canRecover = compilationService.isRecoverableError(result);
```

## Agent Prompts

### Build Custom Prompt

```typescript
import { buildAgentPrompt } from './services/agentPrompts';

const prompt = buildAgentPrompt(
  AgentPhase.PLANNING,
  userPrompt,
  projectState
);
```

### Parse Agent Response

```typescript
import { parseAgentResponse } from './services/agentPrompts';

const parsed = parseAgentResponse(rawResponse, AgentPhase.PLANNING);

// parsed.thought: string
// parsed.output: any
// parsed.raw: boolean (if unparseable)
```

## Common Patterns

### Wait for Specific Phase

```typescript
let targetPhaseReached = false;

const orchestrator = new AgentOrchestrator({
  mode: 'ai',
  onLog: () => {},
  onPhaseChange: (phase) => {
    if (phase === AgentPhase.CODING) {
      targetPhaseReached = true;
      console.log('Coding phase reached!');
    }
  },
  onComplete: () => {},
  onError: () => {}
});
```

### Monitor Self-Healing

```typescript
const orchestrator = new AgentOrchestrator({
  mode: 'ai',
  onLog: () => {},
  onPhaseChange: () => {},
  onStateUpdate: (state) => {
    if (state.iteration_count > 0) {
      console.log(`Healing attempt ${state.iteration_count}/${state.max_iterations}`);
      
      const lastLog = state.terminal_logs[state.terminal_logs.length - 1];
      console.log('Last error:', lastLog.stderr[0]);
    }
  },
  onComplete: () => {},
  onError: () => {}
});
```

### Access Generated Files

```typescript
const orchestrator = new AgentOrchestrator({
  mode: 'ai',
  onLog: () => {},
  onPhaseChange: () => {},
  onStateUpdate: (state) => {
    // Access file system
    const files = state.file_system.filter(f => f.type === 'file');
    
    files.forEach(file => {
      console.log(`File: ${file.path}`);
      console.log(`Content: ${file.content?.slice(0, 100)}...`);
    });
  },
  onComplete: () => {},
  onError: () => {}
});
```

## Error Handling

### Recoverable Errors

- Import errors (wrong named exports)
- Type errors (missing annotations)
- Syntax errors (brackets, semicolons)

### Fatal Errors

- ENOSPC (out of disk space)
- ENOMEM (out of memory)
- Permission denied
- Path misconfiguration

### Safety Mechanisms

- Max 3 healing iterations
- Automatic fallback to simulation (hybrid mode)
- Detailed error logging

## Environment Setup

### Required Environment Variables

```env
# .env.local
VITE_GEMINI_API_KEY=your_api_key_here
```

### Get Gemini API Key

1. Visit <https://aistudio.google.com/app/apikey>
2. Create a new API key
3. Copy to `.env.local`

## Testing

### Simulation Mode (No API Key)

```typescript
const orchestrator = new AgentOrchestrator({
  mode: 'simulation',
  // ... handlers
});

orchestrator.start('Test project');
```

### Hybrid Mode (Automatic Fallback)

```typescript
const orchestrator = new AgentOrchestrator({
  mode: 'hybrid',  // Tries AI, falls back to simulation
  // ... handlers
});
```

## TypeScript Tips

### Import Types

```typescript
import {
  AgentPhase,
  LogEntry,
  ProjectState,
  CompilationResult,
  AgentResponse
} from './types';
```

### Type-Safe State Updates

```typescript
onStateUpdate: (state: ProjectState) => {
  // TypeScript will autocomplete state properties
  console.log(state.plan?.features);
  console.log(state.design_system?.colorPalette);
}
```

## Debugging

### Enable Verbose Logging

```typescript
onLog: (log) => {
  console.log(`[${log.timestamp}] [${log.type.toUpperCase()}] ${log.agent}: ${log.message}`);
  
  if (log.codeBlock) {
    console.log('Code Block:\n', log.codeBlock);
  }
}
```

### Track Agent Thoughts

```typescript
// Agent responses include a "thought" field
// This is logged automatically but can be extracted:

const response = await geminiService.sendPrompt(...);
const parsed = parseAgentResponse(response.text, phase);

if (parsed.thought) {
  console.log('Agent Reasoning:', parsed.thought);
}
```

### Inspect Conversation History

The orchestrator maintains a conversation history between agents. To debug:

```typescript
// Inside AgentOrchestrator class:
console.log(this.conversationHistory);
```

## Performance Tips

1. **Use Hybrid Mode**: Faster fallback to simulation if API fails
2. **Limit State Updates**: Only listen to necessary events
3. **Cache API Responses**: Gemini service has built-in retry logic
4. **Monitor Iteration Count**: Stop early if healing fails repeatedly

## Common Issues

### "Gemini API key not configured"

- Ensure `.env.local` exists with `VITE_GEMINI_API_KEY`
- Restart dev server after adding `.env.local`

### "Workflow already running"

- Call `orchestrator.stop()` before starting new workflow
- Create new orchestrator instance for each run

### Self-healing never completes

- Check `max_iterations` (default 3)
- Review stderr logs for patterns
- May require human intervention

### Empty design_system or plan

- Agent may have returned unstructured response
- Check `parsed.raw === true`
- Review agent prompt formatting

## Best Practices

1. **Always handle onError**: Catch and log all workflow errors
2. **Use onStateUpdate for persistence**: Save ProjectState periodically
3. **Implement retry logic**: Network issues may cause transient failures
4. **Log all phases**: Track workflow progress for debugging
5. **Validate user prompts**: Ensure clear, actionable intent
6. **Monitor iteration_count**: Alert users if healing is needed
7. **Test in simulation first**: Validate workflow without API calls

## Resources

- Full Architecture: [ARCHITECTURE.md](../ARCHITECTURE.md)
- Examples: [examples/pipelineExamples.ts](../examples/pipelineExamples.ts)
- Types Reference: [types.ts](../types.ts)
- Agent Prompts: [services/agentPrompts.ts](../services/agentPrompts.ts)
