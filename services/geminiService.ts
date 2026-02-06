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

export interface RetryConfig
{
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
}

/**
 * Gemini AI Service
 * Handles communication with Google's Gemini API
 * Includes streaming support, retry logic, and enhanced error handling
 */
export class GeminiService
{
    private apiKey: string | null;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private retryConfig: RetryConfig = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000
    };

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
     * Send a prompt to Gemini and get a response with retry logic
     */
    async sendPrompt (
        systemPrompt: string,
        userPrompt: string,
        conversationHistory: GeminiMessage[] = []
    ): Promise<GeminiResponse>
    {
        if ( !this.apiKey )
        {
            throw new Error( 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.' );
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

        return this.retryWithBackoff( async () =>
        {
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
                    throw new Error( this.formatErrorMessage( error, response.status ) );
                }

                const data = await response.json();
                const text = data.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text || '';

                if ( !text )
                {
                    throw new Error( 'Empty response from Gemini API' );
                }

                return {
                    text,
                    phase: this.extractPhase( text )
                };
            } catch ( error )
            {
                if ( error instanceof Error )
                {
                    throw error;
                }
                throw new Error( 'Unknown error occurred while communicating with Gemini API' );
            }
        } );
    }

    /**
     * Stream a response from Gemini with real-time updates
     */
    async *streamPrompt (
        systemPrompt: string,
        userPrompt: string,
        conversationHistory: GeminiMessage[] = []
    ): AsyncGenerator<string, void, unknown>
    {
        if ( !this.apiKey )
        {
            throw new Error( 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.' );
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
                `${ this.baseUrl }/models/gemini-pro:streamGenerateContent?key=${ this.apiKey }`,
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
                throw new Error( this.formatErrorMessage( error, response.status ) );
            }

            const reader = response.body?.getReader();
            if ( !reader )
            {
                throw new Error( 'Failed to get response stream' );
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while ( true )
            {
                const { done, value } = await reader.read();
                if ( done ) break;

                buffer += decoder.decode( value, { stream: true } );
                const lines = buffer.split( '\n' );
                buffer = lines.pop() || '';

                for ( const line of lines )
                {
                    if ( line.trim() === '' ) continue;

                    try
                    {
                        const data = JSON.parse( line );
                        const text = data.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text;
                        if ( text )
                        {
                            yield text;
                        }
                    } catch ( e )
                    {
                        // Skip invalid JSON lines
                        continue;
                    }
                }
            }
        } catch ( error )
        {
            if ( error instanceof Error )
            {
                throw error;
            }
            throw new Error( 'Unknown error occurred during streaming' );
        }
    }

    /**
     * Retry logic with exponential backoff
     */
    private async retryWithBackoff<T> ( fn: () => Promise<T> ): Promise<T>
    {
        let lastError: Error | null = null;
        let delay = this.retryConfig.initialDelay;

        for ( let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++ )
        {
            try
            {
                return await fn();
            } catch ( error )
            {
                lastError = error instanceof Error ? error : new Error( 'Unknown error' );

                // Don't retry on authentication errors
                if ( lastError.message.includes( 'API key' ) || lastError.message.includes( '401' ) )
                {
                    throw lastError;
                }

                // Last attempt, throw the error
                if ( attempt === this.retryConfig.maxRetries )
                {
                    throw lastError;
                }

                // Wait before retrying
                await new Promise( resolve => setTimeout( resolve, delay ) );
                delay = Math.min( delay * 2, this.retryConfig.maxDelay );
            }
        }

        throw lastError || new Error( 'Retry failed' );
    }

    /**
     * Format error messages for better user experience
     */
    private formatErrorMessage ( error: any, status: number ): string
    {
        const message = error.error?.message || error.message || 'Unknown error';

        switch ( status )
        {
            case 400:
                return `Invalid request: ${ message }`;
            case 401:
                return 'Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.';
            case 403:
                return 'API access forbidden. Please check your API key permissions.';
            case 429:
                return 'Rate limit exceeded. Please try again in a moment.';
            case 500:
            case 503:
                return 'Gemini API is temporarily unavailable. Please try again later.';
            default:
                return `Gemini API error (${ status }): ${ message }`;
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
}

// Singleton instance
export const geminiService = new GeminiService();
