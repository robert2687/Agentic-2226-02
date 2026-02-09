import React from 'react';
import {
    Home,
    Settings,
    LayoutGrid,
    FileCode,
    Database,
    Users,
    ChevronRight,
    Cpu,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles
} from 'lucide-react';

interface SidebarProps {
    currentView: 'home' | 'projects' | 'workspace' | 'templates' | 'knowledge' | 'agents' | 'settings';
    onNavigate: (view: 'home' | 'projects' | 'workspace' | 'templates' | 'knowledge' | 'agents' | 'settings' | 'pythagora-preview') => void;
    hasActiveProject: boolean;
    isOpen: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, hasActiveProject, isOpen, onToggle }) => {
    return (
        <div className={`${isOpen ? 'w-64' : 'w-[70px]'} border-r border-border bg-surface flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out`}>
            {/* Header */}
            <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} h-[60px]`}>
                {isOpen ? (
                    <>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <div className="whitespace-nowrap">
                                <h1 className="font-bold text-gray-100 tracking-tight">Agentic Studio</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pro Edition</p>
                            </div>
                        </div>
                        <button onClick={onToggle} className="text-gray-500 hover:text-white transition-colors" title="Toggle sidebar">
                            <PanelLeftClose size={18} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shrink-0 cursor-pointer" onClick={onToggle}>
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                    </div>
                )}
            </div>

            {!isOpen && (
                <div className="flex justify-center pb-4 border-b border-border/50">
                    <button onClick={onToggle} className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded" title="Toggle sidebar">
                        <PanelLeftOpen size={16} />
                    </button>
                </div>
            )}

            <div className="px-3 py-4 space-y-6 flex-1 overflow-y-auto overflow-x-hidden">
                {/* Workspace Section */}
                <div>
                    {isOpen && <div className="text-xs font-semibold text-gray-500 mb-2 px-3 animate-fade-in">WORKSPACE</div>}
                    <nav className="space-y-1">
                        <NavItem
                            icon={<Home size={20} />}
                            label="Home"
                            active={currentView === 'home'}
                            onClick={() => onNavigate('home')}
                            collapsed={!isOpen}
                        />
                        <NavItem
                            icon={<LayoutGrid size={20} />}
                            label="Projects"
                            active={currentView === 'projects'}
                            onClick={() => onNavigate('projects')}
                            collapsed={!isOpen}
                        />
                        {hasActiveProject && (
                            <NavItem
                                icon={<Cpu size={20} />}
                                label="Active Session"
                                active={currentView === 'workspace'}
                                onClick={() => onNavigate('workspace')}
                                collapsed={!isOpen}
                            />
                        )}
                        <NavItem
                            icon={<FileCode size={20} />}
                            label="Templates"
                            active={currentView === 'templates'}
                            onClick={() => onNavigate('templates')}
                            collapsed={!isOpen}
                        />
                        <NavItem
                            icon={<Sparkles size={20} />}
                            label="Pythagora"
                            active={currentView === 'pythagora-preview'}
                            onClick={() => onNavigate('pythagora-preview')}
                            collapsed={!isOpen}
                        />
                    </nav>
                </div>

                {/* Resources Section */}
                <div>
                    {isOpen && <div className="text-xs font-semibold text-gray-500 mb-2 px-3 animate-fade-in">RESOURCES</div>}
                    <nav className="space-y-1">
                        <NavItem
                            icon={<Database size={20} />}
                            label="Knowledge Base"
                            active={currentView === 'knowledge'}
                            onClick={() => onNavigate('knowledge')}
                            collapsed={!isOpen}
                        />
                        <NavItem
                            icon={<Users size={20} />}
                            label="Agents"
                            active={currentView === 'agents'}
                            onClick={() => onNavigate('agents')}
                            collapsed={!isOpen}
                        />
                    </nav>
                </div>
            </div>

            <div className="mt-auto p-3 border-t border-border">
                <button
                    onClick={() => onNavigate('settings')}
                    className={`flex items-center gap-3 transition-colors w-full px-3 py-2.5 rounded-md ${currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${!isOpen ? 'justify-center' : ''}`}
                    title={!isOpen ? "Settings" : ""}
                >
                    <Settings size={20} />
                    {isOpen && <span className="text-sm font-medium animate-fade-in">Settings</span>}
                </button>
            </div>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; collapsed?: boolean }> = ({ icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group ${active ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? label : ""}
    >
        <span className="shrink-0">{icon}</span>
        {!collapsed && (
            <>
                <span className="truncate animate-fade-in">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto opacity-50 shrink-0" />}
            </>
        )}
    </button>
);