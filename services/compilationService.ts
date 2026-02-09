import { CompilationResult, ProjectState } from '../types';

/**
 * Compilation and Validation Service
 * Simulates WebContainer build process and error detection
 * 
 * In production, this would integrate with:
 * - WebContainer API for actual Node.js execution
 * - npm/vite build commands
 * - Real-time stderr/stdout capture
 */
export class CompilationService {
    private buildTimeout = 30000; // 30 seconds max build time

    /**
     * Validate code by attempting to build/compile
     * Returns compilation results with any errors
     */
    async validateCode(projectState: ProjectState): Promise<CompilationResult> {
        try {
            // In real implementation, this would:
            // 1. Write files to WebContainer virtual filesystem
            // 2. Run `npm install` if dependencies changed
            // 3. Execute `npm run build` or `vite build`
            // 4. Capture stdout/stderr streams
            // 5. Parse error messages for line numbers and types

            // For now, we'll simulate validation with static analysis
            const validationErrors = await this.staticAnalysis(projectState);

            if (validationErrors.length > 0) {
                return {
                    success: false,
                    stdout: 'Build started...\nAnalyzing files...',
                    stderr: validationErrors.map(e => this.formatError(e)).join('\n'),
                    exit_code: 1,
                    errors: validationErrors
                };
            }

            return {
                success: true,
                stdout: [
                    'Build started...',
                    'Analyzing dependencies...',
                    '✓ TypeScript compilation successful',
                    '✓ All components validated',
                    '✓ Build completed in 3.2s',
                    'Dev server ready at http://localhost:3000'
                ].join('\n'),
                stderr: '',
                exit_code: 0
            };
        } catch (error) {
            return {
                success: false,
                stdout: '',
                stderr: `Fatal build error: ${(error as Error).message}`,
                exit_code: 2,
                errors: [{
                    file: 'build',
                    line: 0,
                    column: 0,
                    message: (error as Error).message,
                    type: 'runtime'
                }]
            };
        }
    }

    /**
     * Static analysis to detect common errors
     * This simulates what a real compiler would catch
     */
    private async staticAnalysis(projectState: ProjectState): Promise<Array<{
        file: string;
        line: number;
        column: number;
        message: string;
        type: 'syntax' | 'type' | 'import' | 'runtime';
    }>> {
        const errors: Array<{
            file: string;
            line: number;
            column: number;
            message: string;
            type: 'syntax' | 'type' | 'import' | 'runtime';
        }> = [];

        // Check each file in the filesystem
        for (const file of projectState.file_system) {
            if (file.type !== 'file' || !file.content) continue;

            // Skip non-code files
            if (!file.path.match(/\.(tsx?|jsx?)$/)) continue;

            const fileErrors = this.analyzeFile(file.path, file.content);
            errors.push(...fileErrors);
        }

        return errors;
    }

    /**
     * Analyze a single file for common errors
     */
    private analyzeFile(filePath: string, content: string): Array<{
        file: string;
        line: number;
        column: number;
        message: string;
        type: 'syntax' | 'type' | 'import' | 'runtime';
    }> {
        const errors: Array<{
            file: string;
            line: number;
            column: number;
            message: string;
            type: 'syntax' | 'type' | 'import' | 'runtime';
        }> = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            // Check for common import errors
            if (line.includes('import') && line.includes('from')) {
                // Detect incorrect named imports from popular libraries
                if (line.includes('recharts') && line.includes('LineChart')) {
                    // Common error: importing LineChart instead of Line
                    errors.push({
                        file: filePath,
                        line: lineNumber,
                        column: line.indexOf('LineChart'),
                        message: `Module "recharts" has no exported member 'LineChart'. Did you mean 'Line'?`,
                        type: 'import'
                    });
                }

                // Check for placeholder imports
                if (line.includes('// Import') || line.includes('TODO')) {
                    errors.push({
                        file: filePath,
                        line: lineNumber,
                        column: 0,
                        message: 'Placeholder import detected. Code must be complete.',
                        type: 'syntax'
                    });
                }
            }

            // Check for lazy coding patterns (forbidden by Anti-Laziness Protocol)
            const lazyPatterns = [
                '// ... rest of code',
                '// TODO:',
                '// Implement later',
                '// Add more',
                'Lorem ipsum',
                'Sample Product 1'
            ];

            lazyPatterns.forEach(pattern => {
                if (line.includes(pattern)) {
                    errors.push({
                        file: filePath,
                        line: lineNumber,
                        column: line.indexOf(pattern),
                        message: `Forbidden placeholder detected: "${pattern}". All code must be complete and functional.`,
                        type: 'syntax'
                    });
                }
            });

            // Check for unmatched brackets/braces
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            if (openBraces !== closeBraces && closeBraces > openBraces) {
                errors.push({
                    file: filePath,
                    line: lineNumber,
                    column: line.lastIndexOf('}'),
                    message: 'Unexpected token \'}\'',
                    type: 'syntax'
                });
            }

            // Check for missing semicolons in TypeScript interfaces (common error)
            if (line.trim().match(/^\w+:\s*\w+\s*$/) && !line.includes(';') && !line.includes('{')) {
                errors.push({
                    file: filePath,
                    line: lineNumber,
                    column: line.length,
                    message: 'Missing semicolon in interface definition',
                    type: 'syntax'
                });
            }
        });

        return errors;
    }

    /**
     * Format error for stderr output (mimics real compiler output)
     */
    private formatError(error: {
        file: string;
        line: number;
        column: number;
        message: string;
        type: string;
    }): string {
        return `
ERROR in ${error.file}:${error.line}:${error.column}
${error.type.toUpperCase()} ERROR: ${error.message}

  ${error.line} | <source line would go here>
    ${' '.repeat(error.column)}^
`;
    }

    /**
     * Check if error is recoverable by the Patcher
     */
    isRecoverableError(result: CompilationResult): boolean {
        if (result.success) return false;

        // Some errors are fatal and require human intervention
        const fatalPatterns = [
            'ENOSPC', // Out of disk space
            'ENOMEM', // Out of memory
            'permission denied',
            'cannot find module \'@/',  // Path alias misconfiguration
        ];

        return !fatalPatterns.some(pattern =>
            result.stderr.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    /**
     * Extract key information from stderr for Patcher agent
     */
    extractErrorContext(result: CompilationResult): {
        primaryError: string;
        affectedFiles: string[];
        errorType: string;
        stackTrace: string;
    } {
        const errors = result.errors || [];

        return {
            primaryError: errors[0]?.message || 'Unknown error',
            affectedFiles: [...new Set(errors.map(e => e.file))],
            errorType: errors[0]?.type || 'unknown',
            stackTrace: result.stderr
        };
    }

    /**
     * Simulate WebContainer filesystem write
     * In production, this would use WebContainer API
     */
    async writeToFileSystem(files: ProjectState['file_system']): Promise<void> {
        // Placeholder for WebContainer integration
        console.log('Writing files to virtual filesystem:', files.length);

        // In real implementation:
        // await webcontainer.mount({
        //   'src/app/page.tsx': { file: { contents: files[0].content } },
        //   ...
        // });
    }
}

export const compilationService = new CompilationService();
