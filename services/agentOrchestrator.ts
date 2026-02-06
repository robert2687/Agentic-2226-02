import { AgentPhase, LogEntry, ProjectState } from '../types';
import { geminiService } from './geminiService';
import { SYSTEM_PROMPT, AGENTS } from '../constants';
import { createLog, SIMULATION_STEPS } from './simulationService';

export type AgentMode = 'simulation' | 'ai' | 'hybrid';

export interface AgentWorkflowConfig
{
    mode: AgentMode;
    onLog: ( log: LogEntry ) => void;
    onPhaseChange: ( phase: AgentPhase ) => void;
    onComplete: () => void;
    onError: ( error: Error ) => void;
}

/**
 * Agent Orchestrator
 * Manages the workflow of agents through different phases
 */
export class AgentOrchestrator
{
    private config: AgentWorkflowConfig;
    private conversationHistory: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
    private currentPhase: AgentPhase = AgentPhase.PLANNING;
    private isRunning = false;

    constructor( config: AgentWorkflowConfig )
    {
        this.config = config;
    }

    /**
     * Start the agent workflow
     */
    async start ( userPrompt: string ): Promise<void>
    {
        if ( this.isRunning )
        {
            throw new Error( 'Workflow already running' );
        }

        this.isRunning = true;
        this.currentPhase = AgentPhase.PLANNING;

        try
        {
            // Determine which mode to use
            const mode = this.determineMode();

            if ( mode === 'simulation' )
            {
                await this.runSimulation();
            } else if ( mode === 'ai' )
            {
                await this.runAIWorkflow( userPrompt );
            } else
            {
                // Hybrid: try AI, fallback to simulation
                try
                {
                    await this.runAIWorkflow( userPrompt );
                } catch ( error )
                {
                    console.warn( 'AI workflow failed, falling back to simulation:', error );
                    this.config.onLog( createLog( 'SYSTEM', 'AI unavailable, running in demo mode...', 'info' ) );
                    await this.runSimulation();
                }
            }

            this.config.onComplete();
        } catch ( error )
        {
            this.config.onError( error as Error );
        } finally
        {
            this.isRunning = false;
        }
    }

    /**
     * Determine which mode to use based on configuration and API availability
     */
    private determineMode (): AgentMode
    {
        if ( this.config.mode === 'simulation' )
        {
            return 'simulation';
        }

        if ( this.config.mode === 'ai' )
        {
            if ( !geminiService.isAvailable() )
            {
                throw new Error( 'AI mode requested but Gemini API key not configured' );
            }
            return 'ai';
        }

        // Hybrid mode
        return geminiService.isAvailable() ? 'ai' : 'simulation';
    }

    /**
     * Run simulation mode (existing behavior)
     */
    private async runSimulation (): Promise<void>
    {
        let cumulativeDelay = 0;

        for ( const step of SIMULATION_STEPS )
        {
            if ( !this.isRunning ) break;

            await new Promise( resolve => setTimeout( resolve, step.delay ) );

            this.currentPhase = step.phase;
            this.config.onPhaseChange( step.phase );
            this.config.onLog( step.log );
        }
    }

    /**
     * Run AI-powered workflow
     */
    private async runAIWorkflow ( userPrompt: string ): Promise<void>
    {
        const phases: AgentPhase[] = [
            AgentPhase.PLANNING,
            AgentPhase.DESIGNING,
            AgentPhase.ARCHITECTING,
            AgentPhase.CODING,
            AgentPhase.READY
        ];

        this.config.onLog( createLog( 'SYSTEM', 'Initializing AI-powered agent workflow...', 'system' ) );

        for ( const phase of phases )
        {
            if ( !this.isRunning ) break;

            this.currentPhase = phase;
            this.config.onPhaseChange( phase );

            await this.executePhase( phase, userPrompt );
        }
    }

    /**
     * Execute a specific phase with AI
     */
    private async executePhase ( phase: AgentPhase, userPrompt: string ): Promise<void>
    {
        const agentName = this.getAgentForPhase( phase );
        const agentPrompt = this.buildAgentPrompt( phase, userPrompt );

        this.config.onLog( createLog( agentName, `Starting ${ phase.toLowerCase() } phase...`, 'info' ) );

        try
        {
            const response = await geminiService.sendPrompt(
                SYSTEM_PROMPT,
                agentPrompt,
                this.conversationHistory
            );

            // Add to conversation history
            this.conversationHistory.push( {
                role: 'user',
                parts: [ { text: agentPrompt } ]
            } );
            this.conversationHistory.push( {
                role: 'model',
                parts: [ { text: response.text } ]
            } );

            // Parse and log the response
            this.parseAndLogResponse( agentName, response.text );

            this.config.onLog( createLog( agentName, `Completed ${ phase.toLowerCase() } phase.`, 'success' ) );
        } catch ( error )
        {
            this.config.onLog( createLog( agentName, `Error in ${ phase.toLowerCase() }: ${ ( error as Error ).message }`, 'error' ) );
            throw error;
        }
    }

    /**
     * Get the agent name for a specific phase
     */
    private getAgentForPhase ( phase: AgentPhase ): string
    {
        switch ( phase )
        {
            case AgentPhase.PLANNING:
                return 'PLANNER';
            case AgentPhase.DESIGNING:
                return 'DESIGNER';
            case AgentPhase.ARCHITECTING:
                return 'ARCHITECT';
            case AgentPhase.CODING:
                return 'CODER';
            case AgentPhase.PATCHING:
                return 'PATCHER';
            default:
                return 'SYSTEM';
        }
    }

    /**
     * Build a prompt for a specific agent phase
     */
    private buildAgentPrompt ( phase: AgentPhase, userPrompt: string ): string
    {
        const agentName = this.getAgentForPhase( phase );

        switch ( phase )
        {
            case AgentPhase.PLANNING:
                return `[${ agentName }] Analyze this user request and create a detailed plan:\n\n"${ userPrompt }"\n\nDefine:\n1. Core features\n2. Data models\n3. Technical requirements\n\nRespond with [PHASE: PLANNING] at the start.`;

            case AgentPhase.DESIGNING:
                return `[${ agentName }] Based on the plan, create a design system:\n\n1. Color palette (Tailwind classes)\n2. Typography (fonts)\n3. Component style guide\n\nRespond with [PHASE: DESIGNING] at the start.`;

            case AgentPhase.ARCHITECTING:
                return `[${ agentName }] Define the project architecture:\n\n1. Folder structure\n2. File organization\n3. Technology stack\n\nRespond with [PHASE: ARCHITECTING] at the start.`;

            case AgentPhase.CODING:
                return `[${ agentName }] Generate the implementation plan:\n\n1. Key components to build\n2. State management approach\n3. API integration points\n\nRespond with [PHASE: CODING] at the start.`;

            default:
                return `[${ agentName }] Complete the ${ phase } phase for: "${ userPrompt }"`;
        }
    }

    /**
     * Parse AI response and create appropriate logs
     */
    private parseAndLogResponse ( agentName: string, response: string ): void
    {
        // Split response into logical chunks
        const lines = response.split( '\n' ).filter( line => line.trim() );

        // Log key points (first few lines or bullet points)
        const keyPoints = lines.slice( 0, 3 );
        keyPoints.forEach( point =>
        {
            if ( point.trim() )
            {
                this.config.onLog( createLog( agentName, point.trim(), 'info' ) );
            }
        } );

        // If there's code, log it separately
        const codeMatch = response.match( /```[\s\S]*?```/ );
        if ( codeMatch )
        {
            const code = codeMatch[ 0 ].replace( /```\w*\n?/g, '' ).trim();
            this.config.onLog( createLog( agentName, 'Generated code:', 'success', code ) );
        }
    }

    /**
     * Stop the workflow
     */
    stop (): void
    {
        this.isRunning = false;
    }
}
