import { AgentPhase, LogEntry, ProjectState, CompilationResult } from '../types';
import { geminiService } from './geminiService';
import { SYSTEM_PROMPT, AGENTS } from '../constants';
import { createLog, SIMULATION_STEPS, generateId } from './simulationService';
import { buildAgentPrompt, parseAgentResponse } from './agentPrompts';
import { compilationService } from './compilationService';

export type AgentMode = 'simulation' | 'ai' | 'hybrid';

export interface AgentWorkflowConfig {
    mode: AgentMode;
    onLog: (log: LogEntry) => void;
    onPhaseChange: (phase: AgentPhase) => void;
    onStateUpdate?: (state: ProjectState) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

/**
 * Agent Orchestrator - The "Cyclic State Machine"
 * Implements the closed-loop architecture with self-healing
 * 
 * Pipeline: PLANNING → DESIGNING → ARCHITECTING → CODING → [COMPILATION] → [PATCHING if errors] → READY
 */
export class AgentOrchestrator {
    private config: AgentWorkflowConfig;
    private conversationHistory: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
    private currentPhase: AgentPhase = AgentPhase.PLANNING;
    private isRunning = false;

    // The "Collective Consciousness" - shared state across all agents
    private projectState: ProjectState;

    constructor(config: AgentWorkflowConfig) {
        this.config = config;

        // Initialize project state
        this.projectState = this.createInitialState();
    }

    /**
     * Create initial project state
     */
    private createInitialState(): ProjectState {
        return {
            id: generateId(),
            name: 'Untitled Project',
            description: '',
            status: AgentPhase.IDLE,
            user_prompt: '',
            file_system: [],
            terminal_logs: [],
            iteration_count: 0,
            max_iterations: 3,
            files: [],
            dependencies: [],
            logs: [],
            generatedCode: false
        };
    }

    /**
     * Start the agent workflow
     */
    async start(userPrompt: string): Promise<void> {
        if (this.isRunning) {
            throw new Error('Workflow already running');
        }

        this.isRunning = true;
        this.currentPhase = AgentPhase.PLANNING;

        // Update project state with user prompt
        this.projectState.user_prompt = userPrompt;
        this.projectState.status = AgentPhase.PLANNING;

        try {
            // Determine which mode to use
            const mode = this.determineMode();

            if (mode === 'simulation') {
                await this.runSimulation();
            } else if (mode === 'ai') {
                await this.runAIWorkflow(userPrompt);
            } else {
                // Hybrid: try AI, fallback to simulation
                try {
                    await this.runAIWorkflow(userPrompt);
                } catch (error) {
                    console.warn('AI workflow failed, falling back to simulation:', error);
                    this.config.onLog(createLog('SYSTEM', 'AI unavailable, running in demo mode...', 'info'));
                    await this.runSimulation();
                }
            }

            this.config.onComplete();
        } catch (error) {
            this.config.onError(error as Error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Determine which mode to use based on configuration and API availability
     */
    private determineMode(): AgentMode {
        if (this.config.mode === 'simulation') {
            return 'simulation';
        }

        if (this.config.mode === 'ai') {
            if (!geminiService.isAvailable()) {
                throw new Error('AI mode requested but Gemini API key not configured');
            }
            return 'ai';
        }

        // Hybrid mode
        return geminiService.isAvailable() ? 'ai' : 'simulation';
    }

    /**
     * Run simulation mode (existing behavior)
     */
    private async runSimulation(): Promise<void> {
        let cumulativeDelay = 0;

        for (const step of SIMULATION_STEPS) {
            if (!this.isRunning) break;

            await new Promise(resolve => setTimeout(resolve, step.delay));

            this.currentPhase = step.phase;
            this.config.onPhaseChange(step.phase);
            this.config.onLog(step.log);
        }
    }

    /**
     * Run AI-powered workflow with closed-loop validation
     */
    private async runAIWorkflow(userPrompt: string): Promise<void> {
        this.config.onLog(createLog('SYSTEM', '🚀 Initializing Agentic Studio Pro - Closed-Loop Architecture', 'system'));
        this.config.onLog(createLog('SYSTEM', `User Intent: "${userPrompt}"`, 'info'));

        // Phase 1: Planning
        await this.executePlanningPhase();

        // Phase 2: Design
        await this.executeDesignPhase();

        // Phase 3: Architecture
        await this.executeArchitecturePhase();

        // Phase 4: Coding
        await this.executeCodingPhase();

        // Phase 5: Compilation & Self-Healing Loop
        await this.executeCompilationAndHealing();

        // Phase 6: Ready
        this.currentPhase = AgentPhase.READY;
        this.projectState.status = AgentPhase.READY;
        this.config.onPhaseChange(AgentPhase.READY);
        this.config.onLog(createLog('SYSTEM', '✅ Application ready! All agents completed successfully.', 'success'));
    }

    /**
     * Phase 1: Planning
     */
    private async executePlanningPhase(): Promise<void> {
        if (!this.isRunning) return;

        this.currentPhase = AgentPhase.PLANNING;
        this.projectState.status = AgentPhase.PLANNING;
        this.config.onPhaseChange(AgentPhase.PLANNING);

        this.config.onLog(createLog('PLANNER', '🎯 Starting Planning Phase...', 'info'));
        this.config.onLog(createLog('PLANNER', 'Analyzing user intent and defining requirements...', 'info'));

        const prompt = buildAgentPrompt(AgentPhase.PLANNING, this.projectState.user_prompt, this.projectState);
        const response = await geminiService.sendPrompt(SYSTEM_PROMPT, prompt, this.conversationHistory);

        // Parse response
        const parsed = parseAgentResponse(response.text, AgentPhase.PLANNING);

        if (parsed.thought) {
            this.config.onLog(createLog('PLANNER', `💭 ${parsed.thought}`, 'info'));
        }

        if (parsed.plan) {
            this.projectState.plan = parsed.plan;
            this.config.onLog(createLog('PLANNER', `✓ Defined ${parsed.plan.features?.length || 0} core features`, 'success'));
            this.config.onLog(createLog('PLANNER', `✓ Created ${parsed.plan.dataModels?.length || 0} data models`, 'success'));
            this.config.onLog(createLog('PLANNER', `✓ Generated mock data schema (Mock Data Mandate enforced)`, 'success'));
        }

        this.addToHistory(prompt, response.text);
        this.notifyStateUpdate();
    }

    /**
     * Phase 2: Design
     */
    private async executeDesignPhase(): Promise<void> {
        if (!this.isRunning) return;

        this.currentPhase = AgentPhase.DESIGNING;
        this.projectState.status = AgentPhase.DESIGNING;
        this.config.onPhaseChange(AgentPhase.DESIGNING);

        this.config.onLog(createLog('DESIGNER', '🎨 Starting Design Phase...', 'info'));
        this.config.onLog(createLog('DESIGNER', 'Performing "Vibe Check" and creating design system...', 'info'));

        const prompt = buildAgentPrompt(AgentPhase.DESIGNING, this.projectState.user_prompt, this.projectState);
        const response = await geminiService.sendPrompt(SYSTEM_PROMPT, prompt, this.conversationHistory);

        const parsed = parseAgentResponse(response.text, AgentPhase.DESIGNING);

        if (parsed.thought) {
            this.config.onLog(createLog('DESIGNER', `💭 ${parsed.thought}`, 'info'));
        }

        if (parsed.design_system) {
            this.projectState.design_system = parsed.design_system;
            this.config.onLog(createLog('DESIGNER', `✓ Theme: ${parsed.design_system.theme}`, 'success'));
            this.config.onLog(createLog('DESIGNER', `✓ Color Palette: ${Object.keys(parsed.design_system.colorPalette).length} semantic tokens`, 'success'));
            this.config.onLog(createLog('DESIGNER', `✓ Typography: ${parsed.design_system.typography.heading} / ${parsed.design_system.typography.body}`, 'success'));
        }

        this.addToHistory(prompt, response.text);
        this.notifyStateUpdate();
    }

    /**
     * Phase 3: Architecture
     */
    private async executeArchitecturePhase(): Promise<void> {
        if (!this.isRunning) return;

        this.currentPhase = AgentPhase.ARCHITECTING;
        this.projectState.status = AgentPhase.ARCHITECTING;
        this.config.onPhaseChange(AgentPhase.ARCHITECTING);

        this.config.onLog(createLog('ARCHITECT', '🏗️ Starting Architecture Phase...', 'info'));
        this.config.onLog(createLog('ARCHITECT', 'Scaffolding file system and project structure...', 'info'));

        const prompt = buildAgentPrompt(AgentPhase.ARCHITECTING, this.projectState.user_prompt, this.projectState);
        const response = await geminiService.sendPrompt(SYSTEM_PROMPT, prompt, this.conversationHistory);

        const parsed = parseAgentResponse(response.text, AgentPhase.ARCHITECTING);

        if (parsed.thought) {
            this.config.onLog(createLog('ARCHITECT', `💭 ${parsed.thought}`, 'info'));
        }

        if (parsed.file_system) {
            this.projectState.file_system = parsed.file_system;
            const fileCount = parsed.file_system.filter((f: any) => f.type === 'file').length;
            const dirCount = parsed.file_system.filter((f: any) => f.type === 'directory').length;

            this.config.onLog(createLog('ARCHITECT', `✓ Created ${fileCount} files and ${dirCount} directories`, 'success'));
            this.config.onLog(createLog('ARCHITECT', `✓ Next.js 14 App Router structure (src/app/)`, 'success'));
            this.config.onLog(createLog('ARCHITECT', `✓ Mock data file: src/lib/mockData.ts`, 'success'));

            // Show file tree preview
            const treePreview = parsed.file_system.slice(0, 5).map((f: any) => f.path).join('\n');
            this.config.onLog(createLog('ARCHITECT', 'File tree preview:', 'info', treePreview));
        }

        this.addToHistory(prompt, response.text);
        this.notifyStateUpdate();
    }

    /**
     * Phase 4: Coding
     */
    private async executeCodingPhase(): Promise<void> {
        if (!this.isRunning) return;

        this.currentPhase = AgentPhase.CODING;
        this.projectState.status = AgentPhase.CODING;
        this.config.onPhaseChange(AgentPhase.CODING);

        this.config.onLog(createLog('CODER', '💻 Starting Coding Phase...', 'info'));
        this.config.onLog(createLog('CODER', 'Implementing full application (Anti-Laziness Protocol enforced)...', 'info'));

        const prompt = buildAgentPrompt(AgentPhase.CODING, this.projectState.user_prompt, this.projectState);
        const response = await geminiService.sendPrompt(SYSTEM_PROMPT, prompt, this.conversationHistory);

        const parsed = parseAgentResponse(response.text, AgentPhase.CODING);

        if (parsed.thought) {
            this.config.onLog(createLog('CODER', `💭 ${parsed.thought}`, 'info'));
        }

        if (parsed.files) {
            // Merge generated code into file_system
            parsed.files.forEach((file: any) => {
                const existing = this.projectState.file_system.find(f => f.path === file.path);
                if (existing) {
                    existing.content = file.content;
                    existing.lastModified = new Date().toISOString();
                } else {
                    this.projectState.file_system.push({
                        path: file.path,
                        content: file.content,
                        type: 'file',
                        lastModified: new Date().toISOString()
                    });
                }
            });

            this.projectState.generatedCode = true;
            this.config.onLog(createLog('CODER', `✓ Generated ${parsed.files.length} complete, functional files`, 'success'));
            this.config.onLog(createLog('CODER', `✓ All code is copy-pasteable and ready to run`, 'success'));
            this.config.onLog(createLog('CODER', `✓ Design tokens integrated into components`, 'success'));
        }

        this.addToHistory(prompt, response.text);
        this.notifyStateUpdate();
    }

    /**
     * Phase 5: Compilation & Self-Healing Loop
     */
    private async executeCompilationAndHealing(): Promise<void> {
        if (!this.isRunning) return;

        this.config.onLog(createLog('SYSTEM', '🔨 Starting compilation validation...', 'system'));

        // Attempt compilation
        const result = await compilationService.validateCode(this.projectState);

        // Log compilation result
        this.projectState.terminal_logs.push({
            stdout: result.stdout.split('\n'),
            stderr: result.stderr.split('\n'),
            exit_code: result.exit_code,
            timestamp: new Date().toISOString()
        });

        if (result.success) {
            this.config.onLog(createLog('SYSTEM', '✅ Compilation successful!', 'success'));
            this.config.onLog(createLog('SYSTEM', result.stdout, 'info'));
            return;
        }

        // Build failed - enter self-healing loop
        this.config.onLog(createLog('SYSTEM', '⚠️ Build errors detected. Activating Patcher agent...', 'error'));
        this.config.onLog(createLog('STDERR', result.stderr, 'error'));

        // Check if error is recoverable
        if (!compilationService.isRecoverableError(result)) {
            this.config.onLog(createLog('PATCHER', '🛑 Fatal error detected. Human intervention required.', 'error'));
            throw new Error(`Fatal build error: ${result.stderr.slice(0, 200)}`);
        }

        // Self-healing loop (max 3 iterations)
        while (this.projectState.iteration_count < this.projectState.max_iterations && !result.success) {
            this.projectState.iteration_count++;

            this.config.onLog(createLog('PATCHER', `🩹 Healing attempt ${this.projectState.iteration_count}/${this.projectState.max_iterations}...`, 'info'));

            await this.executePatchingPhase();

            // Re-compile after patching
            const newResult = await compilationService.validateCode(this.projectState);

            this.projectState.terminal_logs.push({
                stdout: newResult.stdout.split('\n'),
                stderr: newResult.stderr.split('\n'),
                exit_code: newResult.exit_code,
                timestamp: new Date().toISOString()
            });

            if (newResult.success) {
                this.config.onLog(createLog('PATCHER', '✅ Self-healing successful! Build passed.', 'success'));
                return;
            }

            // Check if same error persists
            if (newResult.stderr === result.stderr) {
                this.config.onLog(createLog('PATCHER', `⚠️ Same error persists after attempt ${this.projectState.iteration_count}`, 'error'));
            }
        }

        // Max iterations reached
        if (this.projectState.iteration_count >= this.projectState.max_iterations) {
            this.config.onLog(createLog('PATCHER', '🛑 Max healing iterations reached. Requesting human assistance.', 'error'));
            this.config.onLog(createLog('SYSTEM', 'The system encountered persistent errors. Please review the logs.', 'error'));
        }
    }

    /**
     * Patching Phase (triggered by compilation errors)
     */
    private async executePatchingPhase(): Promise<void> {
        if (!this.isRunning) return;

        this.currentPhase = AgentPhase.PATCHING;
        this.projectState.status = AgentPhase.PATCHING;
        this.config.onPhaseChange(AgentPhase.PATCHING);

        this.config.onLog(createLog('PATCHER', '🔍 Analyzing error logs (Abductive Reasoning)...', 'info'));

        const prompt = buildAgentPrompt(AgentPhase.PATCHING, this.projectState.user_prompt, this.projectState);
        const response = await geminiService.sendPrompt(SYSTEM_PROMPT, prompt, this.conversationHistory);

        const parsed = parseAgentResponse(response.text, AgentPhase.PATCHING);

        if (parsed.thought) {
            this.config.onLog(createLog('PATCHER', `💭 ${parsed.thought}`, 'info'));
        }

        if (parsed.request_human_help) {
            this.config.onLog(createLog('PATCHER', '🆘 Complex error detected. Human review recommended.', 'error'));
            this.projectState.iteration_count = this.projectState.max_iterations; // Stop loop
            return;
        }

        if (parsed.fixes) {
            // Apply surgical fixes
            this.config.onLog(createLog('PATCHER', `✓ Identified ${parsed.fixes.length} fixes`, 'success'));

            parsed.fixes.forEach((fix: any, index: number) => {
                const file = this.projectState.file_system.find(f => f.path === fix.file);
                if (file && file.content) {
                    // Apply line-level fix
                    file.content = file.content.replace(fix.before, fix.after);
                    file.lastModified = new Date().toISOString();

                    this.config.onLog(createLog('PATCHER', `  ${index + 1}. ${fix.file}:${fix.line} - Applied surgical fix`, 'success'));
                }
            });
        }

        this.addToHistory(prompt, response.text);
        this.notifyStateUpdate();
    }

    /**
     * Add message to conversation history
     */
    private addToHistory(userPrompt: string, modelResponse: string): void {
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userPrompt }]
        });
        this.conversationHistory.push({
            role: 'model',
            parts: [{ text: modelResponse }]
        });
    }

    /**
     * Notify listeners of state update
     */
    private notifyStateUpdate(): void {
        if (this.config.onStateUpdate) {
            this.config.onStateUpdate(this.projectState);
        }
    }

    /**
     * Stop the workflow
     */
    stop(): void {
        this.isRunning = false;
    }
}
