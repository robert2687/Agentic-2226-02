import { AgentPhase, LogEntry } from '../types';

// Check if Gemini API key is available
const getApiKey = (): string | null =>
{
    return import.meta.env.VITE_GEMINI_API_KEY ||
        ( typeof process !== 'undefined' && process.env?.GEMINI_API_KEY ) ||
        null;
};

export interface GeminiMessage
{
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GeminiResponse
{
    text: string;
    phase?: AgentPhase;
}

/**
 * Gemini AI Service
 * Handles communication with Google's Gemini API
 */
export class GeminiService
{
    private apiKey: string | null;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    constructor()
    {
        this.apiKey = getApiKey();
    }

    /**
     * Check if API is available
     */
    isAvailable (): boolean
    {
        return this.apiKey !== null && this.apiKey.length > 0;
    }

    /**
     * Send a prompt to Gemini and get a response
     */
    async sendPrompt (
        systemPrompt: string,
        userPrompt: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<GeminiResponse>
    {
        if ( !this.apiKey )
        {
            throw new Error( 'Gemini API key not configured' );
        }

        const messages: GeminiMessage[] = [
            {
                role: 'user',
                parts: [ { text: systemPrompt } ]
            },
            ...conversationHistory,
            {
                role: 'user',
                parts: [ { text: userPrompt } ]
            }
        ];

        try
        {
            const response = await fetch(
                `${ this.baseUrl }/models/gemini-pro:generateContent?key=${ this.apiKey }`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify( {
                        contents: messages,
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048,
                        },
                    } ),
                }
            );

            if ( !response.ok )
            {
                const error = await response.json();
                throw new Error( `Gemini API error: ${ error.error?.message || response.statusText }` );
            }

            const data = await response.json();
            const text = data.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text || '';

            return {
                text,
                phase: this.extractPhase( text )
            };
        } catch ( error )
        {
            console.error( 'Gemini API error:', error );
            throw error;
        }
    }

    /**
     * Extract agent phase from response
     */
    private extractPhase ( text: string ): AgentPhase | undefined
    {
        const phaseMatch = text.match( /\[PHASE:\s*(\w+)\]/i );
        if ( phaseMatch )
        {
            const phase = phaseMatch[ 1 ].toUpperCase();
            return AgentPhase[ phase as keyof typeof AgentPhase ];
        }
        return undefined;
    }

    /**
     * Stream a response from Gemini (for future implementation)
     */
    async *streamPrompt (
        systemPrompt: string,
        userPrompt: string
    ): AsyncGenerator<string, void, unknown>
    {
        if ( !this.apiKey )
        {
            throw new Error( 'Gemini API key not configured' );
        }

        // For now, just yield the full response
        // TODO: Implement actual streaming when Gemini streaming API is available
        const response = await this.sendPrompt( systemPrompt, userPrompt );
        yield response.text;
    }
}

// Singleton instance
export const geminiService = new GeminiService();
