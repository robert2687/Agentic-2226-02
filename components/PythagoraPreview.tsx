import React, { useState, useRef, useEffect } from 'react';
import { AgentPhase, LogEntry, ProjectState } from '../types';
import { useAgentWorkflow } from '../hooks/useAgentWorkflow';
import './PythagoraPreview.css';

interface PythagoraPreviewProps {
    onProjectStateUpdate?: (state: ProjectState) => void;
}

/**
 * Pythagora-Inspired Preview Component
 * Integrates the Pythagora UI design with the agent pipeline
 * Wires prompt input to trigger Planner → Designer → Architect → Coder → Patcher workflow
 */
export const PythagoraPreview: React.FC<PythagoraPreviewProps> = ({ onProjectStateUpdate }) => {
    const [prompt, setPrompt] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [currentPhase, setCurrentPhase] = useState<AgentPhase | null>(null);
    const [projectState, setProjectState] = useState<ProjectState | null>(null);
    const [activeNavItem, setActiveNavItem] = useState('New Project');
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Use the agent workflow hook
    const { startWorkflow, stopWorkflow, isRunning, error } = useAgentWorkflow(
        (log) => {
            setLogs(prev => [...prev, log]);
        },
        (phase) => {
            setCurrentPhase(phase);
        }
    );

    // Auto-scroll to latest logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleGenerateClick = () => {
        if (!prompt.trim()) {
            alert('Please enter a project description');
            return;
        }

        // Clear previous logs and state
        setLogs([]);
        setCurrentPhase(null);

        // Start the agent workflow
        startWorkflow(prompt, 'hybrid');
    };

    const handleQuickAction = (action: string) => {
        const templates: { [key: string]: string } = {
            '📋 From Template': 'Build a React app with user authentication and a responsive dashboard theme.',
            '🔄 Import Code': 'Convert existing React code into a full-featured Next.js application.',
            '📌 Paste Config': 'Create a microservice based on the following OpenAPI specification.'
        };

        setPrompt(templates[action] || '');
    };

    const handleNavClick = (item: string) => {
        setActiveNavItem(item);
        // Handle navigation actions based on the item clicked
        const actionMap: { [key: string]: () => void } = {
            'Browse Templates': () => {
                const template = 'Build a React dashboard with real-time data visualization.';
                setPrompt(template);
            },
            'Competitive Mode': () => {
                setPrompt('Create a competitive AI code generation setup with multiple agent strategies.');
            },
            'Pipeline Config': () => {
                setPrompt('Configure an agent pipeline with custom model selection and execution parameters.');
            },
            'Agent Logs': () => {
                setLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    agent: 'SYSTEM',
                    message: 'Viewing historical agent logs...',
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'system'
                }]);
            },
            'Documentation': () => {
                alert('Opening Documentation...');
            },
            'API Reference': () => {
                alert('Opening API Reference...');
            },
            'Examples': () => {
                setPrompt('Show me examples of agent-based code generation with error self-healing.');
            }
        };

        if (actionMap[item]) {
            actionMap[item]();
        }
    };

    const getPhaseColor = (phase: AgentPhase | string): string => {
        const phaseColors: { [key: string]: string } = {
            [AgentPhase.PLANNING]: '#3b82f6', // blue
            [AgentPhase.DESIGNING]: '#a855f7', // purple
            [AgentPhase.ARCHITECTING]: '#f59e0b', // amber
            [AgentPhase.CODING]: '#ec4899', // pink
            [AgentPhase.PATCHING]: '#ef4444', // red
            [AgentPhase.READY]: '#10b981', // green
        };
        return phaseColors[phase] || '#6b7280';
    };

    const getLogIcon = (type: string): string => {
        const icons: { [key: string]: string } = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'system': '⚙️'
        };
        return icons[type] || '•';
    };

    const phaseNames: { [key: string]: string } = {
        [AgentPhase.PLANNING]: 'Planner',
        [AgentPhase.DESIGNING]: 'Designer',
        [AgentPhase.ARCHITECTING]: 'Architect',
        [AgentPhase.CODING]: 'Coder',
        [AgentPhase.PATCHING]: 'Patcher',
        [AgentPhase.READY]: 'Complete',
    };

    return (
        <div className="pythagora-container">
            {/* SIDEBAR */}
            <aside className="pythagora-sidebar">
                <div className="pythagora-logo">
                    <div className="pythagora-logo-icon">⚛</div>
                    <span>Agentic</span>
                </div>

                <div className="pythagora-nav-section">
                    <div className="pythagora-nav-section-title">Start</div>
                    <button
                        onClick={() => handleNavClick('New Project')}
                        className={`pythagora-nav-item ${activeNavItem === 'New Project' ? 'active' : ''}`}
                    >
                        New Project
                    </button>
                    <button
                        onClick={() => handleNavClick('Browse Templates')}
                        className={`pythagora-nav-item ${activeNavItem === 'Browse Templates' ? 'active' : ''}`}
                    >
                        Browse Templates
                    </button>
                </div>

                <div className="pythagora-nav-section">
                    <div className="pythagora-nav-section-title">Recent</div>
                    <button
                        onClick={() => handleNavClick('Competitive Mode')}
                        className={`pythagora-nav-item ${activeNavItem === 'Competitive Mode' ? 'active' : ''}`}
                    >
                        Competitive Mode
                    </button>
                    <button
                        onClick={() => handleNavClick('Pipeline Config')}
                        className={`pythagora-nav-item ${activeNavItem === 'Pipeline Config' ? 'active' : ''}`}
                    >
                        Pipeline Config
                    </button>
                    <button
                        onClick={() => handleNavClick('Agent Logs')}
                        className={`pythagora-nav-item ${activeNavItem === 'Agent Logs' ? 'active' : ''}`}
                    >
                        Agent Logs
                    </button>
                </div>

                <div className="pythagora-nav-section">
                    <div className="pythagora-nav-section-title">Resources</div>
                    <button
                        onClick={() => handleNavClick('Documentation')}
                        className={`pythagora-nav-item ${activeNavItem === 'Documentation' ? 'active' : ''}`}
                    >
                        Documentation
                    </button>
                    <button
                        onClick={() => handleNavClick('API Reference')}
                        className={`pythagora-nav-item ${activeNavItem === 'API Reference' ? 'active' : ''}`}
                    >
                        API Reference
                    </button>
                    <button
                        onClick={() => handleNavClick('Examples')}
                        className={`pythagora-nav-item ${activeNavItem === 'Examples' ? 'active' : ''}`}
                    >
                        Examples
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="pythagora-main-content">
                {/* LEFT SECTION - Input & Cards */}
                <div className="pythagora-left-section">
                    <div className="pythagora-header">
                        <h1>Start with a prompt.</h1>
                        <p>End with a working solution.</p>
                    </div>

                    {/* CARDS GRID */}
                    <div className="pythagora-cards-grid">
                        <div className="pythagora-card">
                            <div className="pythagora-card-icon">🚀</div>
                            <h3>Web App</h3>
                            <p>Build full-stack applications with AI-assisted architecture and code generation.</p>
                        </div>

                        <div className="pythagora-card">
                            <div className="pythagora-card-icon">⚙️</div>
                            <h3>Internal Tool</h3>
                            <p>Create admin panels, dashboards, and internal tools with pre-built patterns.</p>
                        </div>

                        <div className="pythagora-card">
                            <div className="pythagora-card-icon">📊</div>
                            <h3>Data Pipeline</h3>
                            <p>Design ETL workflows, data validation, and real-time processing systems.</p>
                        </div>

                        <div className="pythagora-card">
                            <div className="pythagora-card-icon">🔧</div>
                            <h3>Microservice</h3>
                            <p>Generate serverless functions, APIs, and containerized microservices.</p>
                        </div>
                    </div>

                    {/* PROMPT SECTION */}
                    <div className="pythagora-prompt-section">
                        <div className="pythagora-prompt-label">What would you like to build?</div>
                        <div className="pythagora-prompt-input-wrapper">
                            <textarea
                                className="pythagora-prompt-input"
                                placeholder="Describe your project: e.g., 'A React todo app with authentication, state management, and a dark theme'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isRunning}
                            />
                            <button
                                className="pythagora-prompt-button"
                                onClick={handleGenerateClick}
                                disabled={isRunning}
                            >
                                {isRunning ? '⏳ Generating...' : '✨ Generate'}
                            </button>
                        </div>

                        <div className="pythagora-quick-actions">
                            <span
                                className="pythagora-quick-action"
                                onClick={() => handleQuickAction('📋 From Template')}
                            >
                                📋 From Template
                            </span>
                            <span
                                className="pythagora-quick-action"
                                onClick={() => handleQuickAction('🔄 Import Code')}
                            >
                                🔄 Import Code
                            </span>
                            <span
                                className="pythagora-quick-action"
                                onClick={() => handleQuickAction('📌 Paste Config')}
                            >
                                📌 Paste Config
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION - Logs & Phase Display */}
                {isRunning && (
                    <div className="pythagora-right-section">
                        {/* Phase Progress */}
                        <div className="pythagora-phase-progress">
                            <h3>Pipeline Progress</h3>
                            <div className="pythagora-phases">
                                {Object.values(AgentPhase).slice(0, 5).map((phase) => {
                                    const isActive = currentPhase === phase;
                                    const phaseKey = phase.toLowerCase();
                                    return (
                                        <div
                                            key={phase}
                                            className={`pythagora-phase-indicator pythagora-phase-${phaseKey} ${
                                                isActive ? 'active' : ''
                                            } ${
                                                [AgentPhase.PLANNING, AgentPhase.DESIGNING, AgentPhase.ARCHITECTING, AgentPhase.CODING].includes(
                                                    currentPhase as AgentPhase
                                                ) &&
                                                Object.values(AgentPhase).indexOf(currentPhase as AgentPhase) >=
                                                    Object.values(AgentPhase).indexOf(phase as AgentPhase)
                                                    ? 'completed'
                                                    : ''
                                            }`}
                                        >
                                            <span className="pythagora-phase-name">
                                                {phaseNames[phase] || phase}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Logs Display */}
                        <div className="pythagora-logs-container">
                            <h3>Agent Logs</h3>
                            <div className="pythagora-logs-list">
                                {logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`pythagora-log-entry pythagora-log-${log.type}`}
                                    >
                                        <span className="pythagora-log-icon">
                                            {getLogIcon(log.type)}
                                        </span>
                                        <div className="pythagora-log-content">
                                            <span className="pythagora-log-agent">{log.agent}</span>
                                            <span className="pythagora-log-time">{log.timestamp}</span>
                                            <p className="pythagora-log-message">{log.message}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>

                        {error && (
                            <div className="pythagora-error-box">
                                <span>❌</span>
                                <p>{error.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
