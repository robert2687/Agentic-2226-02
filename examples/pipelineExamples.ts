/**
 * Example: Using the Agentic Studio Pro Pipeline
 * 
 * This demonstrates the closed-loop architecture with self-healing
 */

import { AgentOrchestrator } from '../services/agentOrchestrator';
import { AgentPhase, LogEntry, ProjectState } from '../types';

// Example 1: Basic Usage
export function basicExample() {
    const orchestrator = new AgentOrchestrator({
        mode: 'ai',  // Use real AI (requires VITE_GEMINI_API_KEY)

        onLog: (log: LogEntry) => {
            console.log(`[${log.timestamp}] ${log.agent}: ${log.message}`);
            if (log.codeBlock) {
                console.log('Code:', log.codeBlock);
            }
        },

        onPhaseChange: (phase: AgentPhase) => {
            console.log(`\n=== PHASE CHANGE: ${phase} ===\n`);
        },

        onStateUpdate: (state: ProjectState) => {
            console.log('Project State Updated:', {
                phase: state.status,
                filesGenerated: state.file_system.length,
                iterationCount: state.iteration_count
            });
        },

        onComplete: () => {
            console.log('\n✅ WORKFLOW COMPLETE\n');
        },

        onError: (error: Error) => {
            console.error('\n❌ WORKFLOW ERROR:', error.message, '\n');
        }
    });

    // Start the workflow
    orchestrator.start('Build a cyberpunk-themed analytics dashboard with revenue tracking');
}

// Example 2: Hybrid Mode (Fallback to Simulation)
export function hybridExample() {
    const orchestrator = new AgentOrchestrator({
        mode: 'hybrid',  // Try AI, fallback to simulation if unavailable

        onLog: (log) => {
            // Color-coded logging
            const colors = {
                info: '\x1b[36m',    // Cyan
                success: '\x1b[32m', // Green
                error: '\x1b[31m',   // Red
                system: '\x1b[90m'   // Gray
            };
            const reset = '\x1b[0m';
            const color = colors[log.type] || '';

            console.log(`${color}[${log.agent}] ${log.message}${reset}`);
        },

        onPhaseChange: (phase) => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`  ENTERING PHASE: ${phase}`);
            console.log(`${'='.repeat(50)}\n`);
        },

        onComplete: () => {
            console.log('\n🎉 Application ready for deployment!\n');
        },

        onError: (error) => {
            console.error(`\n💥 Fatal Error: ${error.message}\n`);
        }
    });

    orchestrator.start('Create a professional SaaS dashboard with user management');
}

// Example 3: Monitoring Self-Healing
export function selfHealingExample() {
    let healingAttempts = 0;

    const orchestrator = new AgentOrchestrator({
        mode: 'ai',

        onLog: (log) => {
            console.log(`[${log.timestamp}] ${log.agent}: ${log.message}`);
        },

        onPhaseChange: (phase) => {
            if (phase === AgentPhase.PATCHING) {
                healingAttempts++;
                console.log(`\n🩹 SELF-HEALING ACTIVATED (Attempt ${healingAttempts})\n`);
            }
        },

        onStateUpdate: (state) => {
            // Monitor iteration count
            if (state.iteration_count > 0) {
                console.log(`Healing Progress: ${state.iteration_count}/${state.max_iterations}`);

                // Check terminal logs for errors
                const lastLog = state.terminal_logs[state.terminal_logs.length - 1];
                if (lastLog && lastLog.stderr.length > 0) {
                    console.log('Latest Error:', lastLog.stderr[0]);
                }
            }
        },

        onComplete: () => {
            console.log(`\n✅ Completed with ${healingAttempts} healing attempts\n`);
        },

        onError: (error) => {
            console.error(`\n❌ Failed after ${healingAttempts} healing attempts\n`);
            console.error('Error:', error.message);
        }
    });

    orchestrator.start('Build an e-commerce product catalog with shopping cart');
}

// Example 4: Simulation Mode (No API Key Required)
export function simulationExample() {
    const orchestrator = new AgentOrchestrator({
        mode: 'simulation',  // Demo mode with pre-scripted responses

        onLog: (log) => {
            console.log(`[${log.agent}] ${log.message}`);
        },

        onPhaseChange: (phase) => {
            console.log(`\n>>> Phase: ${phase}\n`);
        },

        onComplete: () => {
            console.log('\n[SIMULATION] Demo workflow complete\n');
        },

        onError: (error) => {
            console.error('Error:', error);
        }
    });

    orchestrator.start('Demo request');
}

// Example 5: State Persistence
export function statePersistenceExample() {
    let savedState: ProjectState | null = null;

    const orchestrator = new AgentOrchestrator({
        mode: 'ai',

        onLog: (log) => console.log(log.message),
        onPhaseChange: (phase) => console.log(`Phase: ${phase}`),

        onStateUpdate: (state) => {
            // Save state for potential recovery
            savedState = JSON.parse(JSON.stringify(state)); // Deep clone

            // Could persist to localStorage or backend
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('agenticStudioState', JSON.stringify(state));
            }
        },

        onComplete: () => {
            console.log('Final State:', savedState);
        },

        onError: (error) => {
            console.error('Error occurred. Saved state:', savedState);
            // Could implement recovery here
        }
    });

    orchestrator.start('Build a task management app with drag-and-drop');
}

// Run examples (comment/uncomment as needed)
if (typeof window === 'undefined') {
    // Running in Node.js
    console.log('Agentic Studio Pro - Pipeline Examples\n');

    // Uncomment to run:
    // basicExample();
    // hybridExample();
    // selfHealingExample();
    // simulationExample();
    // statePersistenceExample();
}

export default {
    basicExample,
    hybridExample,
    selfHealingExample,
    simulationExample,
    statePersistenceExample
};
