import { useState, useCallback, useRef } from 'react';
import { AgentPhase, LogEntry } from '../types';
import { AgentOrchestrator, AgentMode } from '../services/agentOrchestrator';

export interface UseAgentWorkflowResult
{
    startWorkflow: ( prompt: string, mode?: AgentMode ) => void;
    stopWorkflow: () => void;
    isRunning: boolean;
    currentPhase: AgentPhase | null;
    error: Error | null;
}

/**
 * React hook to manage agent workflow
 */
export function useAgentWorkflow (
    onLog: ( log: LogEntry ) => void,
    onPhaseChange?: ( phase: AgentPhase ) => void
): UseAgentWorkflowResult
{
    const [ isRunning, setIsRunning ] = useState( false );
    const [ currentPhase, setCurrentPhase ] = useState<AgentPhase | null>( null );
    const [ error, setError ] = useState<Error | null>( null );
    const orchestratorRef = useRef<AgentOrchestrator | null>( null );

    const startWorkflow = useCallback( ( prompt: string, mode: AgentMode = 'hybrid' ) =>
    {
        if ( isRunning )
        {
            console.warn( 'Workflow already running' );
            return;
        }

        setIsRunning( true );
        setError( null );
        setCurrentPhase( AgentPhase.PLANNING );

        const orchestrator = new AgentOrchestrator( {
            mode,
            onLog: ( log ) =>
            {
                onLog( log );
            },
            onPhaseChange: ( phase ) =>
            {
                setCurrentPhase( phase );
                onPhaseChange?.( phase );
            },
            onComplete: () =>
            {
                setIsRunning( false );
                setCurrentPhase( AgentPhase.READY );
            },
            onError: ( err ) =>
            {
                setError( err );
                setIsRunning( false );
                onLog( {
                    id: Math.random().toString( 36 ).substr( 2, 9 ),
                    timestamp: new Date().toLocaleTimeString( [], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' } ),
                    agent: 'SYSTEM',
                    message: `Workflow error: ${ err.message }`,
                    type: 'error'
                } );
            }
        } );

        orchestratorRef.current = orchestrator;
        orchestrator.start( prompt );
    }, [ isRunning, onLog, onPhaseChange ] );

    const stopWorkflow = useCallback( () =>
    {
        if ( orchestratorRef.current )
        {
            orchestratorRef.current.stop();
            orchestratorRef.current = null;
        }
        setIsRunning( false );
    }, [] );

    return {
        startWorkflow,
        stopWorkflow,
        isRunning,
        currentPhase,
        error
    };
}
