import React from 'react';
import AgenticStudioCompetitive from './components/AgenticStudioCompetitive';

/**
 * Preview page for the Agentic Studio Competitive Mode component
 * This demonstrates the simplified grid-based layout with 3 panels
 */
export default function CompetitivePreview() {
    return (
        <div className="competitive-preview-container">
            <AgenticStudioCompetitive
                isRunning={false}
            />
        </div>
    );
}
