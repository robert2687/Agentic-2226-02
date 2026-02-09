import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { MOCK_PROJECT_TEMPLATES, AGENTS, SYSTEM_PROMPT } from './constants';
import { AgentPhase, ProjectState } from './types';
import { createLog } from './services/simulationService';
import { PythagoraPreview } from './components/PythagoraPreview';
import { AgentVisualization } from './components/Workspace/AgentVisualization';
import { Terminal } from './components/Workspace/Terminal';
import { PreviewFrame } from './components/Workspace/PreviewFrame';
import { CodeEditor } from './components/Workspace/CodeEditor';
import { CommandPalette } from './components/CommandPalette';
import { initialAgents } from './lib/mockData';
import { useAgentWorkflow } from './hooks/useAgentWorkflow';
import { geminiService } from './services/geminiService';
import type { AgentMode } from './services/agentOrchestrator';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
ArrowRight, Sparkles, AlertCircle, Play, Code as CodeIcon, Eye, Zap, Clock, FolderOpen,
MoreVertical, LayoutTemplate, Search, Book, FileText, Key, Cpu, Shield, Trash2, Bell, Save,
Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, X, Copy
} from 'lucide-react';

const SAVED_PROJECTS = [
    { id: 'proj_alpha', name: 'Crypto Arb Bot', lastEdited: '2h ago', status: 'Ready', type: 'Internal Tool', description: 'High-frequency trading bot with sentiment analysis.' },
    { id: 'proj_beta', name: 'SaaS Dashboard', lastEdited: '1d ago', status: 'Building', type: 'Web App', description: 'Next.js 14 Admin panel with stripe integration.' },
    { id: 'proj_gamma', name: 'Marketing AI', lastEdited: '3d ago', status: 'Live', type: 'DB Dashboard', description: 'Content generation engine using Gemini Pro.' },
];

const MOCK_KNOWLEDGE_BASE = [
    { id: 'kb1', title: 'Agentic Patterns in Next.js', category: 'Architecture', readTime: '5 min', excerpt: 'How to structure autonomous agents within a Server Actions paradigm.' },
    { id: 'kb2', title: 'State Management for Swarms', category: 'State', readTime: '8 min', excerpt: 'Using Redux vs Context for high-frequency agent updates.' },
    { id: 'kb3', title: 'Self-Healing Workflows', category: 'DevOps', readTime: '4 min', excerpt: 'Implementing error catching and automated patching pipelines.' },
    { id: 'kb4', title: 'Gemini 3 Pro Integration Guide', category: 'AI Models', readTime: '10 min', excerpt: 'Best practices for prompting and context window management.' },
    { id: 'kb5', title: 'UI/UX for Autonomous Systems', category: 'Design', readTime: '6 min', excerpt: 'Designing trust-building interfaces for non-deterministic apps.' },
    { id: 'kb6', title: 'Security Protocols', category: 'Security', readTime: '7 min', excerpt: 'Sandboxing generated code execution in browser environments.' },
];

const App: React.FC = () => {
    const [projectState, setProjectState] = useState<ProjectState | null>(null);
    const [mainView, setMainView] = useState<'home' | 'projects' | 'workspace' | 'templates' | 'knowledge' | 'agents' | 'settings' | 'pythagora-preview'>('home');
    const [promptInput, setPromptInput] = useState('');
    const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
    const [agentMode, setAgentMode] = useState<AgentMode>('hybrid');

    // Settings State
    const [settings, setSettings] = useState({
        apiKey: 'sk-gemini-pro-xxxxxxxxxxxxxxxx',
        model: 'gemini-3-pro',
        autoHeal: true,
        verbose: false,
        notifications: true
    });

    // Agent workflow hook
    const { startWorkflow, stopWorkflow, isRunning } = useAgentWorkflow(
        (log) => {
            setProjectState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    logs: [...prev.logs, log]
                };
            });
        },
        (phase) => {
            setProjectState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: phase
                };
            });
        }
    );

    const startProject = (initialPrompt?: string) => {
        const promptToUse = initialPrompt || promptInput;
        if (!promptToUse.trim()) return;

        // Initialize Project
        setProjectState({
            id: `proj_${Date.now()}`,
            name: 'Untitled Project',
            description: promptToUse,
            status: AgentPhase.PLANNING,
            files: [],
            dependencies: [],
            logs: [],
            generatedCode: false
        });
        setMainView('workspace');
        setIsFullScreen(false);
        setIsTerminalOpen(true);

        // Start agent workflow with hybrid mode
        startWorkflow(promptToUse, agentMode);
    };

    const openSavedProject = (proj: typeof SAVED_PROJECTS[0]) => {
        setProjectState({
            id: proj.id,
            name: proj.name,
            description: proj.description,
            status: AgentPhase.READY,
            files: [],
            dependencies: [],
            logs: [
                createLog('SYSTEM', `Restored session: ${proj.name}`),
                createLog('ORCHESTRATOR', 'State rehydrated successfully.'),
                createLog('PATCHER', 'System Monitor Active: Watching for Runtime Errors.', 'system')
            ],
            generatedCode: true
        });
        setMainView('workspace');
        setIsFullScreen(false);
        setIsTerminalOpen(true);
    };

    const saveCurrentProject = () => {
        if (!projectState) return;

        // 1. Create Log for user feedback
        const saveLog = createLog('SYSTEM', 'Saving project state to local storage...', 'info');

        const stateToSave = {
            ...projectState,
            logs: [...projectState.logs, saveLog]
        };

        // 2. Update React State to show log
        setProjectState(stateToSave);

        // 3. Persist to LocalStorage
        try {
            localStorage.setItem(`agentic_project_${projectState.id}`, JSON.stringify(stateToSave));

            // Add success log after save
            setTimeout(() => {
                setProjectState(prev => prev ? ({
                    ...prev,
                    logs: [...prev.logs, createLog('SYSTEM', 'Project state saved successfully.', 'success')]
                }) : null);
            }, 500);

        } catch (e) {
            console.error("Failed to save project", e);
            setProjectState(prev => prev ? ({
                ...prev,
                logs: [...prev.logs, createLog('SYSTEM', 'Failed to save: Storage quota exceeded.', 'error')]
            }) : null);
        }
    };

    const handleRefinement = (refinementPrompt: string) => {
        if (!projectState) return;

        // 1. User Log
        setProjectState(prev => prev ? ({
            ...prev,
            logs: [...prev.logs, createLog('USER', `Refine: "${refinementPrompt}"`, 'info')]
        }) : null);

        // 2. Planner Analysis
        setTimeout(() => {
            setProjectState(prev => prev ? ({
                ...prev,
                status: AgentPhase.PLANNING,
                logs: [...prev.logs, createLog('PLANNER', 'Analyzing refinement request against current constraints...', 'info')]
            }) : null);
        }, 500);

        // 3. Coder Implementation
        setTimeout(() => {
            setProjectState(prev => prev ? ({
                ...prev,
                status: AgentPhase.CODING,
                logs: [...prev.logs, createLog('CODER', 'Regenerating components with new specifications...', 'info')]
            }) : null);
        }, 1000);

        // 4. Success / Ready
        setTimeout(() => {
            setProjectState(prev => prev ? ({
                ...prev,
                status: AgentPhase.READY,
                logs: [...prev.logs, createLog('SYSTEM', 'Refinement applied successfully. Hot-reloading...', 'success')]
            }) : null);
        }, 1800);
    };

    const triggerRuntimeError = () => {
        if (!projectState) return;

        // 1. Log the Error
        setProjectState((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                status: AgentPhase.PATCHING,
                logs: [
                    ...prev.logs,
                    createLog('STDERR', 'Uncaught TypeError: Cannot read properties of undefined (reading "map")', 'error')
                ]
            };
        });

        // 2. Patcher Analysis
        setTimeout(() => {
            setProjectState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    logs: [
                        ...prev.logs,
                        createLog('PATCHER', 'Detected Runtime Crash. Analyzing React Component Stack...', 'info')
                    ]
                };
            });
        }, 1500);

        // 3. Patcher Fix
        setTimeout(() => {
            setProjectState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    logs: [
                        ...prev.logs,
                        createLog('PATCHER', 'Applying Surgical Edit to src/context/AppContext.tsx.', 'success', `// Fix: Added safety check for undefined arrays
return {
  ...state,
  // Added optional chaining
  chartData: state.chartData?.map(d => ...) || []
};`)
                    ]
                };
            });
        }, 3500);

        // 4. Restore
        setTimeout(() => {
            setProjectState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: AgentPhase.READY,
                    logs: [
                        ...prev.logs,
                        createLog('SYSTEM', 'Hot-reload completed. Application stable.', 'system')
                    ]
                };
            });
        }, 5000);
    };

    const handleCommand = (action: string, id?: string) => {
        if (action === 'heal_all') {
            if (projectState) {
                setProjectState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        logs: [...prev.logs, createLog('COMMAND', 'Executing manual system heal...', 'system')]
                    };
                });
                triggerRuntimeError();
            }
        }
        if (action === 'deploy') {
            if (projectState) {
                setProjectState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        logs: [...prev.logs, createLog('COMMAND', 'Deploying to Vercel Production...', 'success')]
                    };
                });
            }
        }
        if (action === 'restart') {
            if (projectState) {
                setProjectState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        logs: [...prev.logs, createLog('COMMAND', 'Restarting active agents...', 'system')]
                    };
                });
            }
        }
    };

    const loadExample = () => {
        setPromptInput("I want to build a high-end Portfolio Dashboard for AI Researchers. It should feel like a 'command center' (Dark mode, Slate-900). Start with the PLANNING phase.");
    };

    const renderWorkspacePanel = () => (
        <div className="p-4 h-full flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex justify-between items-center px-2 shrink-0">
                <div className="flex p-1 bg-surface border border-border rounded-lg">
                    <button
                        onClick={() => setActiveView('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === 'preview' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Eye size={14} /> Preview
                    </button>
                    <button
                        onClick={() => setActiveView('code')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === 'code' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <CodeIcon size={14} /> Code
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {activeView === 'preview' && (
                        <div className="bg-black/40 backdrop-blur text-white/50 text-xs px-2 py-1 rounded border border-white/10 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Localhost:3000
                        </div>
                    )}

                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="text-gray-400 hover:text-white p-1.5 hover:bg-white/10 rounded-md transition-colors"
                        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeView === 'preview' ? (
                    <PreviewFrame
                        status={projectState!.status}
                        onTriggerError={triggerRuntimeError}
                        onRefine={handleRefinement}
                    />
                ) : (
                    <CodeEditor />
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-gray-200 overflow-hidden font-sans">
            {!isFullScreen && (
                <Sidebar
                    currentView={mainView as 'home' | 'projects' | 'workspace' | 'templates' | 'knowledge' | 'agents' | 'settings'}
                    onNavigate={(view) => setMainView(view as any)}
                    hasActiveProject={!!projectState}
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            )}

            <main className="flex-1 flex flex-col min-w-0 relative">

                {/* VIEW: HOME */}
                {mainView === 'home' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background">
                        <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-bold tracking-tight text-white">How do you want to start?</h2>
                                <p className="text-gray-400">Choose a template or describe your dream application.</p>
                            </div>

                            {/* Template Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MOCK_PROJECT_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => {
                                            setPromptInput(`Build a ${tpl.title}`);
                                            // Optionally auto-start or just populate
                                        }}
                                        className={`p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group flex flex-col h-full
                      ${promptInput.includes(tpl.title)
                                                ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                                : 'bg-surface border-border hover:border-gray-600'
                                            }`}
                                    >
                                        <tpl.icon className={`mb-3 ${promptInput.includes(tpl.title) ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`} size={24} />
                                        <h3 className="font-semibold text-gray-200">{tpl.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{tpl.description}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="bg-surface border border-border rounded-2xl p-2 shadow-2xl ring-4 ring-black/20 relative overflow-hidden group/input">
                                {/* Example Prompt Button */}
                                <div className="absolute top-2 right-2 z-10">
                                    <button
                                        onClick={loadExample}
                                        className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                                    >
                                        <Zap size={10} />
                                        Try Example: AI Dashboard
                                    </button>
                                </div>

                                <textarea
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    placeholder="Describe your app... (e.g. 'A dashboard for sales data with charts')"
                                    className="w-full bg-transparent text-lg p-4 resize-none outline-none text-white placeholder:text-gray-600 h-32 font-medium"
                                />
                                <div className="flex justify-between items-center px-4 pb-2">
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-border/50 px-2 py-1 rounded text-gray-400">Next.js 14</span>
                                        <span className="text-xs bg-border/50 px-2 py-1 rounded text-gray-400">Tailwind</span>
                                        <span className="text-xs bg-border/50 px-2 py-1 rounded text-gray-400">Shadcn UI</span>
                                    </div>
                                    <button
                                        onClick={() => startProject()}
                                        disabled={!promptInput}
                                        className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                                    >
                                        <Sparkles size={18} />
                                        Generate App
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-surface/50 p-3 rounded-lg border border-border/50">
                                <AlertCircle size={14} className="mt-0.5 text-accent" />
                                <p>
                                    <strong className="text-gray-300">Closed-Loop System:</strong> This environment uses a Patcher Agent to automatically fix runtime errors.
                                    If the code fails to compile, the system will self-heal without human intervention.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: PROJECTS LIST */}
                {mainView === 'projects' && (
                    <div className="flex-1 p-8 bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-5xl mx-auto">
                            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Saved Projects</h2>
                                    <p className="text-gray-400 mt-2">Resume work on your agentic applications.</p>
                                </div>
                                <button onClick={() => setMainView('home')} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                    <Zap size={16} /> New Project
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {SAVED_PROJECTS.map((proj) => (
                                    <div key={proj.id} className="group bg-surface border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={16} className="text-gray-500 hover:text-white cursor-pointer" />
                                        </div>

                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                            <FolderOpen size={20} />
                                        </div>

                                        <h3 className="font-bold text-lg text-gray-200 mb-1">{proj.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{proj.description}</p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Clock size={12} />
                                                <span>{proj.lastEdited}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${proj.status === 'Ready' || proj.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {proj.status}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => openSavedProject(proj)}
                                            className="mt-4 w-full bg-border hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                                        >
                                            Open Editor
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: TEMPLATES */}
                {mainView === 'templates' && (
                    <div className="flex-1 p-8 bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-5xl mx-auto">
                            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Project Templates</h2>
                                    <p className="text-gray-400 mt-2">Jumpstart your development with pre-configured stacks.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {MOCK_PROJECT_TEMPLATES.map((tpl) => (
                                    <div key={tpl.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col group">
                                        <div className="h-32 bg-gradient-to-br from-indigo-900/40 to-slate-900 border-b border-border p-6 flex items-center justify-center">
                                            <tpl.icon className="text-indigo-400 w-16 h-16 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-gray-200 mb-2">{tpl.title}</h3>
                                            <p className="text-sm text-gray-400 mb-6 flex-1">{tpl.description}</p>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    Next.js 14 App Router
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                                    Tailwind CSS + Shadcn
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    TypeScript Strict
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => startProject(`Build a ${tpl.title}`)}
                                                className="mt-6 w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                            >
                                                <Zap size={16} /> Use Template
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Coming Soon Card */}
                                <div className="bg-surface/30 border border-border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-gray-600 gap-4 min-h-[300px]">
                                    <LayoutTemplate size={48} className="opacity-20" />
                                    <div className="text-center">
                                        <h3 className="font-medium mb-1">More Coming Soon</h3>
                                        <p className="text-xs max-w-[200px]">Community templates and integrations are on the roadmap.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: KNOWLEDGE BASE */}
                {mainView === 'knowledge' && (
                    <div className="flex-1 p-8 bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-8 border-b border-border pb-6">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h2>
                                <p className="text-gray-400 mt-2">Architectural patterns and guides for agentic systems.</p>
                                <div className="mt-6 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Search documentation..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_KNOWLEDGE_BASE.map((item) => (
                                    <div key={item.id} className="group bg-surface border border-border p-5 rounded-xl hover:border-primary/50 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{item.category}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} /> {item.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white mb-2 flex items-center gap-2">
                                            <FileText size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-400">{item.excerpt}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: AGENTS */}
                {mainView === 'agents' && (
                    <div className="flex-1 p-8 bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-8 border-b border-border pb-6">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Agent Swarm</h2>
                                <p className="text-gray-400 mt-2">Meet the autonomous units powering your development lifecycle.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.values(AGENTS).map((agent) => (
                                    <div key={agent.id} className="group bg-surface border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all relative overflow-hidden">
                                        {/* Background Gradient */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${agent.color.split('-')[1]}-500/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />

                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className={`p-3 rounded-xl bg-surface border border-border ${agent.color} group-hover:scale-110 transition-transform duration-300`}>
                                                <agent.icon size={24} />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-medium text-green-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                ONLINE
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-100 mb-1">{agent.name}</h3>
                                        <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">{agent.role}</p>

                                        <div className="space-y-2 mb-6">
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <div className={`h-full w-[90%] bg-${agent.color.split('-')[1]}-500/50 rounded-full`} />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Load</span>
                                                <span>{Math.floor(Math.random() * 30) + 10}%</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-2 rounded-lg border border-border bg-black/20 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                            View Logs
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: SETTINGS */}
                {mainView === 'settings' && (
                    <div className="flex-1 p-8 bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-8 border-b border-border pb-6 flex items-end justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">System Configuration</h2>
                                    <p className="text-gray-400 mt-2">Manage global preferences for the Agentic Studio environment.</p>
                                </div>
                                <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Section: API & Models */}
                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                                            <Key size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-200">API & Models</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Gemini API Key</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={settings.apiKey}
                                                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                                    aria-label="Gemini API Key"
                                                    placeholder="sk-gemini-pro-xxxxxxxxxxxxxxxx"
                                                    className="w-full bg-black/30 border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors font-mono"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    <Shield size={14} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">Key is stored locally in browser session.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Default Model</label>
                                            <select
                                                value={settings.model}
                                                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                                aria-label="Default Model"
                                                className="w-full bg-black/30 border border-border rounded-lg py-2 px-4 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors"
                                            >
                                                <option value="gemini-3-pro">Gemini 3.0 Pro (Recommended)</option>
                                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Agent Mode</label>
                                            <select
                                                value={agentMode}
                                                onChange={(e) => setAgentMode(e.target.value as AgentMode)}
                                                aria-label="Agent Mode"
                                                className="w-full bg-black/30 border border-border rounded-lg py-2 px-4 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors"
                                            >
                                                <option value="hybrid">Hybrid (Auto-detect)</option>
                                                <option value="ai">AI Only (Requires API Key)</option>
                                                <option value="simulation">Demo Mode (No API)</option>
                                            </select>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {agentMode === 'hybrid' && 'Uses AI if available, falls back to demo'}
                                                {agentMode === 'ai' && geminiService.isAvailable() ? '✓ AI Ready' : agentMode === 'ai' ? '⚠️ API key required' : ''}
                                                {agentMode === 'simulation' && 'Running in offline demo mode'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Agent Behavior */}
                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                            <Cpu size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-200">Swarm Behavior</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-black/20">
                                            <div>
                                                <div className="font-medium text-gray-300 text-sm">Autonomous Healing</div>
                                                <div className="text-xs text-gray-500">Allow Patcher agent to modify files without manual approval.</div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, autoHeal: !settings.autoHeal })}
                                                aria-label="Toggle Autonomous Healing"
                                                className={`w-10 h-5 rounded-full relative transition-colors ${settings.autoHeal ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.autoHeal ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-black/20">
                                            <div>
                                                <div className="font-medium text-gray-300 text-sm">Verbose Logging</div>
                                                <div className="text-xs text-gray-500">Show internal reasoning chains in terminal (Debug mode).</div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, verbose: !settings.verbose })}
                                                aria-label="Toggle Verbose Logging"
                                                className={`w-10 h-5 rounded-full relative transition-colors ${settings.verbose ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.verbose ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-black/20">
                                            <div>
                                                <div className="font-medium text-gray-300 text-sm">System Notifications</div>
                                                <div className="text-xs text-gray-500">Alert when build completes or critical error occurs.</div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                                                aria-label="Toggle System Notifications"
                                                className={`w-10 h-5 rounded-full relative transition-colors ${settings.notifications ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.notifications ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Danger Zone */}
                                <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">
                                            Reset simulation state and clear all local project data.
                                        </div>
                                        <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <Trash2 size={16} /> Reset All Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: PYTHAGORA PREVIEW */}
                {mainView === 'pythagora-preview' && (
                    <PythagoraPreview onProjectStateUpdate={setProjectState} />
                )}

                {/* VIEW: WORKSPACE */}
                {mainView === 'workspace' && projectState ? (
                    <div className="flex flex-col h-full animate-in fade-in duration-500">
                        {/* Command Palette (Hidden until Cmd+K) */}
                        <CommandPalette agents={initialAgents} onAction={handleCommand} />

                        {/* Top Bar */}
                        {!isFullScreen && (
                            <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-semibold text-white">{projectState.name}</h2>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-border text-gray-400 border border-gray-700">
                                        {projectState.status === AgentPhase.READY ? 'Running' : 'Building...'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <Sparkles size={12} className="text-blue-400" />
                                        <span className="text-[10px] font-medium text-blue-300 uppercase tracking-wide">Gemini 3 Pro</span>
                                    </div>

                                    {/* Terminal Toggle */}
                                    <button
                                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                                        className={`text-xs px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${isTerminalOpen ? 'bg-surface border-border text-gray-400 hover:text-white' : 'bg-primary/10 border-primary/20 text-primary'}`}
                                        title={isTerminalOpen ? "Collapse Terminal" : "Expand Terminal"}
                                    >
                                        {isTerminalOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                                        <span className="hidden lg:inline">{isTerminalOpen ? 'Hide Terminal' : 'Show Terminal'}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsSystemPromptOpen(true)}
                                        className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 border border-gray-700 transition-colors"
                                    >
                                        System Prompt
                                    </button>
                                    {/* Save Button */}
                                    <button
                                        onClick={saveCurrentProject}
                                        className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20 transition-colors flex items-center gap-1.5"
                                    >
                                        <Save size={12} />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProjectState(null);
                                            setMainView('home');
                                        }}
                                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded border border-red-500/20 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </header>
                        )}

                        {/* Agent Status Bar */}
                        {!isFullScreen && <AgentVisualization currentPhase={projectState.status} />}

                        {/* Resizable Split View */}
                        <div className="flex-1 flex overflow-hidden">
                            {isFullScreen ? (
                                <div className="flex-1 bg-[#121214]">
                                    {renderWorkspacePanel()}
                                </div>
                            ) : (
                                <Group orientation="horizontal">
                                    {/* Left: Terminal / Logic */}
                                    {isTerminalOpen && (
                                        <>
                                            <Panel defaultSize={35} minSize={20} id="terminal-panel" order={1} className="flex flex-col border-r border-border bg-[#09090b]">
                                                <div className="p-4 h-full flex flex-col gap-4">
                                                    <div className="flex items-center justify-between shrink-0">
                                                        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                            <ArrowRight size={14} /> Agent Stream
                                                        </h3>
                                                    </div>
                                                    <div className="flex-1 min-h-0">
                                                        <Terminal logs={projectState.logs} />
                                                    </div>
                                                </div>
                                            </Panel>

                                            <Separator className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize flex items-center justify-center group z-10">
                                                <div className="h-8 w-1 rounded-full bg-gray-600 group-hover:bg-white transition-colors"></div>
                                            </Separator>
                                        </>
                                    )}

                                    {/* Right: Preview / Code */}
                                    <Panel defaultSize={65} minSize={30} id="preview-panel" order={2} className="bg-[#121214]">
                                        {renderWorkspacePanel()}
                                    </Panel>
                                </Group>
                            )}
                        </div>
                    </div>
                ) : mainView === 'workspace' && (
                    // Fallback if workspace is selected but state is null (shouldn't happen often)
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="mb-4">No active session.</p>
                            <button onClick={() => setMainView('home')} className="text-primary hover:underline">Return Home</button>
                        </div>
                    </div>
                )}

                {/* System Prompt Modal */}
                {isSystemPromptOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0e0e11] border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-zoom-in">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-white/5">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-purple-400" />
                                    System Instructions
                                </h3>
                                <button
                                    onClick={() => setIsSystemPromptOpen(false)}
                                    aria-label="Close system prompt"
                                    className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-0 bg-[#09090b]">
                                <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed selection:bg-purple-500/30">
                                    {SYSTEM_PROMPT}
                                </pre>
                            </div>
                            <div className="p-4 border-t border-slate-800 bg-[#0e0e11] flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(SYSTEM_PROMPT);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Copy size={16} /> Copy to Clipboard
                                </button>
                                <button
                                    onClick={() => setIsSystemPromptOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;