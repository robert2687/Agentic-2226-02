"use client";

import React, { useEffect, useRef, useState } from "react";
import "./AgenticStudioCompetitive.css";

type PanelId = "pipeline" | "code" | "logs";

type Panel = {
    id: PanelId;
    title: string;
};

const PANELS: Panel[] = [
    { id: "pipeline", title: "Neural Pipeline" },
    { id: "code", title: "Code Surface" },
    { id: "logs", title: "Neural Logs" },
];

const DEFAULT_WIDTHS: Record<PanelId, number> = {
    pipeline: 1,
    code: 1.4,
    logs: 1,
};

const STORAGE_KEY = "agentic-layout-v2";

type StoredState = {
    widths: Record<PanelId, number>;
    order: PanelId[];
    theme: "dark" | "light";
};

interface AgenticStudioProps {
    pipelineContent?: React.ReactNode;
    codeContent?: React.ReactNode;
    logsContent?: React.ReactNode;
    isRunning?: boolean;
}

export default function AgenticStudioCompetitive({
    pipelineContent,
    codeContent,
    logsContent,
    isRunning = false,
}: AgenticStudioProps) {
    const [order, setOrder] = useState<PanelId[]>(PANELS.map((p) => p.id));
    const [widths, setWidths] = useState<Record<PanelId, number>>(DEFAULT_WIDTHS);
    const [collapsed, setCollapsed] = useState<Record<PanelId, boolean>>({
        pipeline: false,
        code: false,
        logs: false,
    });
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [draggingId, setDraggingId] = useState<PanelId | null>(null);
    const [activeTab, setActiveTab] = useState<"code" | "preview" | "tests">(
        "code"
    );
    const panelRefs = useRef<Record<PanelId, HTMLElement | null>>({
        pipeline: null,
        code: null,
        logs: null,
    });

    // Load from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed: StoredState = JSON.parse(raw);
            if (parsed.widths) setWidths(parsed.widths);
            if (parsed.order) setOrder(parsed.order);
            if (parsed.theme) setTheme(parsed.theme);
        } catch {
            // ignore
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const state: StoredState = { widths, order, theme };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [widths, order, theme]);

    const totalWidth = order.reduce((sum, id) => sum + widths[id], 0);

    useEffect(() => {
        const nextTotalWidth = order.reduce((sum, id) => sum + widths[id], 0) || 1;
        order.forEach((id) => {
            const panel = panelRefs.current[id];
            if (!panel) return;
            const widthPercent = (widths[id] / nextTotalWidth) * 100;
            panel.style.setProperty("--panel-basis", `${widthPercent}%`);
        });
    }, [order, widths]);

    const handleResizeStart = (id: PanelId, e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidths = { ...widths };

        const onMove = (ev: MouseEvent) => {
            const delta = ev.clientX - startX;
            const container = document.querySelector(
                ".app-main"
            ) as HTMLElement | null;
            if (!container) return;
            const containerWidth = container.getBoundingClientRect().width || 1;
            const deltaRatio = (delta / containerWidth) * totalWidth;
            setWidths((prev) => ({
                ...prev,
                [id]: Math.max(0.5, startWidths[id] + deltaRatio),
            }));
        };

        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    const toggleCollapse = (id: PanelId) => {
        setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDragStart = (id: PanelId) => {
        setDraggingId(id);
    };

    const handleDragOver = (e: React.DragEvent, overId: PanelId) => {
        e.preventDefault();
        if (!draggingId || draggingId === overId) return;
    };

    const handleDrop = (overId: PanelId) => {
        if (!draggingId || draggingId === overId) return;
        setOrder((prev) => {
            const filtered = prev.filter((id) => id !== draggingId);
            const index = filtered.indexOf(overId);
            filtered.splice(index, 0, draggingId);
            return filtered;
        });
        setDraggingId(null);
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "code":
                return (
                    codeContent || (
                        <pre>
                            <code>{`export default function App() {
  return <div>Ready for S</div>
}`}</code>
                        </pre>
                    )
                );
            case "preview":
                return (
                    <div className="preview-wrapper">
                        <h3 className="preview-title">Live Preview</h3>
                        <div className="preview-box">
                            <div>Ready for S</div>
                        </div>
                    </div>
                );
            case "tests":
                return (
                    <div className="tests-wrapper">
                        <h3 className="tests-title">Test Results</h3>
                        <ul className="tests-list">
                            <li>✓ Component renders without crashing</li>
                            <li>✓ Displays correct text</li>
                            <li>✓ No runtime errors detected</li>
                        </ul>
                    </div>
                );
        }
    };

    const getPanelContent = (id: PanelId) => {
        switch (id) {
            case "pipeline":
                return (
                    pipelineContent || (
                        <>
                            <p>Status: {isRunning ? "Running" : "Stable"}</p>
                            <p>Vectors: 0</p>
                            <details>
                                <summary>Neural Directives</summary>
                                <p>Logic synthesis is deterministic. Complexity O(N log N).</p>
                            </details>
                        </>
                    )
                );
            case "code":
                return (
                    <>
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === "code" ? "active" : ""}`}
                                onClick={() => setActiveTab("code")}
                            >
                                Code
                            </button>
                            <button
                                className={`tab ${activeTab === "preview" ? "active" : ""}`}
                                onClick={() => setActiveTab("preview")}
                            >
                                Preview
                            </button>
                            <button
                                className={`tab ${activeTab === "tests" ? "active" : ""}`}
                                onClick={() => setActiveTab("tests")}
                            >
                                Tests
                            </button>
                        </div>
                        <div className="tab-content">{renderTabContent()}</div>
                    </>
                );
            case "logs":
                return (
                    logsContent || (
                        <>
                            <p>[KERNEL] System operational.</p>
                            <p>[TELEMETRY] Neural load stabilized.</p>
                            <p>[MODE] Competitive logic enabled.</p>
                        </>
                    )
                );
        }
    };

    return (
        <div className={`root root--${theme}`}>
            <div className="app-shell">
                <header className="app-header">
                    <div className="title-group">
                        <h1 className="app-title">Agentic Studio – Competitive Mode</h1>
                        <p className="app-subtitle">
                            Neural pipeline · Code surface · Runtime logs
                        </p>
                    </div>
                    <div className="header-right">
                        <div className="status-group">
                            <span className="status-chip">
                                {isRunning ? "Processing" : "All systems nominal"}
                            </span>
                            <span className="mode-chip">Competitive logic enabled</span>
                        </div>
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === "dark" ? "Light mode" : "Dark mode"}
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    {order.map((id, index) => {
                        const panel = PANELS.find((p) => p.id === id)!;
                        const isLast = index === order.length - 1;
                        return (
                            <section
                                key={id}
                                className={`panel ${collapsed[id] ? "panel--collapsed" : ""} ${draggingId === id ? "panel--dragging" : ""
                                    }`}
                                ref={(node) => {
                                    panelRefs.current[id] = node;
                                }}
                                draggable
                                onDragStart={() => handleDragStart(id)}
                                onDragOver={(e) => handleDragOver(e, id)}
                                onDrop={() => handleDrop(id)}
                            >
                                <div
                                    className="panel-header"
                                    onClick={() => toggleCollapse(id)}
                                >
                                    <span className="panel-title">{panel.title}</span>
                                    <span className="collapse-btn">
                                        {collapsed[id] ? "+" : "−"}
                                    </span>
                                </div>
                                <div className="panel-body">{getPanelContent(id)}</div>
                                {!isLast && (
                                    <div
                                        className="resize-handle"
                                        onMouseDown={(e) => handleResizeStart(id, e)}
                                    />
                                )}
                            </section>
                        );
                    })}
                </main>
            </div>

        </div>
    );
}
