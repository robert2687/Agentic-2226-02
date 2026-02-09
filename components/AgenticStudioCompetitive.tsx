"use client";

import React, { useState } from "react";
import "./AgenticStudioCompetitive.css";

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
    const [activeTab, setActiveTab] = useState<"code" | "preview" | "tests">("code");



    const renderTabContent = () => {
        switch (activeTab) {
            case "code":
                return (
                    <pre>
                        <code>{`export default function App() {
  return <div>Ready for S</div>
}`}</code>
                    </pre>
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



    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="title-group">
                    <h1 className="app-title">Agentic Studio – Competitive Mode</h1>
                    <p className="app-subtitle">
                        Neural pipeline · Code surface · Runtime logs
                    </p>
                </div>

                <div className="status-group">
                    <span className="status-chip">
                        {isRunning ? "Processing" : "All systems nominal"}
                    </span>
                    <span className="mode-chip">Competitive logic enabled</span>
                </div>
            </header>

            <main className="app-main">
                {/* LEFT PANEL - Neural Pipeline */}
                <section className="panel">
                    <h2 className="panel-title">Neural Pipeline</h2>
                    <div className="panel-body">
                        {pipelineContent || (
                            <>
                                <p>Status: {isRunning ? "Running" : "Stable"}</p>
                                <p>Vectors: 0</p>
                                <details className="collapse">
                                    <summary>Neural Directives</summary>
                                    <p>Logic synthesis is deterministic. Complexity bounds: O(N log N).</p>
                                </details>
                            </>
                        )}
                    </div>
                </section>

                {/* CENTER PANEL - Code Surface */}
                <section className="panel">
                    <h2 className="panel-title">Code Surface</h2>

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

                    <div className="panel-body code-area">
                        {renderTabContent()}
                    </div>
                </section>

                {/* RIGHT PANEL - Neural Logs */}
                <section className="panel">
                    <h2 className="panel-title">Neural Logs</h2>
                    <div className="panel-body logs">
                        {logsContent || (
                            <>
                                <p>[KERNEL] System operational.</p>
                                <p>[TELEMETRY] Neural load stabilized.</p>
                                <p>[MODE] Competitive logic enabled.</p>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
