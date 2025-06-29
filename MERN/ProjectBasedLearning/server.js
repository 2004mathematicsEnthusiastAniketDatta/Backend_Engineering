// server.js - CodeMind Backend
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demo (replace with SQLite in production)
const projects = new Map();
const chatHistory = new Map();

// AI Agent Classes
class ContextManager {
    constructor() {
        this.projectContext = new Map();
    }

    updateContext(projectId, files) {
        this.projectContext.set(projectId, {
            files,
            lastUpdated: Date.now(),
            structure: this.analyzeProjectStructure(files)
        });
    }

    analyzeProjectStructure(files) {
        const structure = {
            languages: new Set(),
            frameworks: [],
            patterns: [],
            dependencies: []
        };

        Object.entries(files).forEach(([filename, content]) => {
            const ext = path.extname(filename).toLowerCase();
            
            // Detect languages
            if (ext === '.js') structure.languages.add('javascript');
            if (ext === '.py') structure.languages.add('python');
            if (ext === '.html') structure.languages.add('html');
            
            // Detect frameworks (simple pattern matching)
            if (content.includes('import React') || content.includes('from react')) {
                structure.frameworks.push('React');
            }
            if (content.includes('import Vue') || content.includes('vue')) {
                structure.frameworks.push('Vue');
            }
            if (content.includes('express') || content.includes('app.listen')) {
                structure.frameworks.push('Express');
            }
        });

        return {
            ...structure,
            languages: Array.from(structure.languages)
        };
    }

    getContext(projectId) {
        return this.projectContext.get(projectId);
    }
}

class CodeAnalyzer {
    static analyzeCode(code, language) {
        const analysis = {
            complexity: 'low',
            issues: [],
            suggestions: [],
            metrics: {
                lines: code.split('\n').length,
                functions: 0,
                classes: 0
            }
        };

        // Basic analysis patterns
        if (language === 'javascript') {
            analysis.metrics.functions = (code.match(/function\s+\w+/g) || []).length;
            analysis.metrics.functions += (code.match(/\w+\s*=\s*\(/g) || []).length;
            analysis.metrics.classes = (code.match(/class\s+\w+/g) || []).length;

            // Check for potential issues
            if (code.includes('eval(')) {
                analysis.issues.push('Potential security risk: eval() usage');
            }
            if (code.includes('document.write')) {
                analysis.issues.push('Avoid document.write for better performance');
            }
            if (!code.includes('try') && code.includes('JSON.parse')) {
                analysis.suggestions.push('Consider adding error handling for JSON.parse');
            }
        }

        return analysis;
    }
}

class TaskPlanner {
    static breakdownTask(task, context) {
        const steps = [];
        const taskLower = task.toLowerCase();

        if (taskLower.includes('create') || taskLower.includes('build')) {
            steps.push('Analyze requirements');
            steps.push('Design architecture');
            steps.push('Generate code structure');
            steps.push('Implement functionality');
            steps.push('Add error handling');
            steps.push('Test and validate');
        } else if (taskLower.includes('debug') || taskLower.includes('fix')) {
            steps.push('Identify error location');
            steps.push('Analyze error context');
            steps.push('Generate fix suggestions');
            steps.push('Implement solution');
            steps.push('Validate fix');
        } else if (taskLower.includes('optimize') || taskLower.includes('improve')) {
            steps.push('Analyze current code');
            steps.push('Identify bottlenecks');
            steps.push('Suggest optimizations');
            steps.push('Implement improvements');
            steps.push('Measure performance');
        }

        return steps;
    }
}

class AIAgent {
    constructor() {
        this.contextManager = new ContextManager();
        this.isProcessing = false;
    }

    async processRequest(request, projectId, currentFile, currentCode) {
        if (this.isProcessing) {
            return { error: 'AI is currently processing another request' };
        }

        this.isProcessing = true;
        
        try {
            // Update context
            const context = this.contextManager.getContext(projectId) || {};
            
            // Analyze current code
            const analysis = CodeAnalyzer.analyzeCode(currentCode, this.getLanguageFromFile(currentFile));
            
            // Plan task
            const steps = TaskPlanner.breakdownTask(request, context);
            
            // Generate response based on request type
            const response = await this.generateResponse(request, analysis, context, steps);
            
            return {
                response,
                analysis,
                steps,
                suggestions: this.generateSuggestions(request, analysis)
            };
            
        } finally {
            this.isProcessing = false;
        }
    }

    async generateResponse(request, analysis, context, steps) {
        const requestLower = request.toLowerCase();
        
        if (requestLower.includes('generate') || requestLower.includes('create')) {
            return this.generateCode(request, context);
        } else if (requestLower.includes('explain')) {
            return this.explainCode(analysis, context);
        } else if (requestLower.includes('debug') || requestLower.includes('fix')) {
            return this.debugCode(analysis, steps);
        } else if (requestLower.includes('optimize')) {
            return this.optimizeCode(analysis);
        } else {
            return this.generalHelp(request, analysis);
        }
    }

    generateCode(request, context) {
        // This would integrate with actual LLM API
        return {
            code: `// Generated based on: ${request}\n// TODO: Implement actual LLM integration\n\nfunction generatedFunction() {\n    // Your generated code here\n    console.log('Generated by CodeMind AI');\n}`,
            explanation: 'This is a template for the code you requested. In the full implementation, this would be generated by an LLM based on your specific requirements.'
        };
    }

    explainCode(analysis, context) {
        return {
            explanation: `Your code has ${analysis.metrics.lines} lines with ${analysis.metrics.functions} functions. ` +
                        `The complexity is ${analysis.complexity}. ` +
                        (analysis.issues.length > 0 ? `Issues found: ${analysis.issues.join(', ')}` : 'No major issues detected.'),
            structure: analysis.metrics
        };
    }

    debugCode(analysis, steps) {
        return {
            issues: analysis.issues,
            fixes: analysis.issues.map(issue => `Fix: ${issue}`),
            steps: steps
        };
    }

    optimizeCode(analysis) {
        return {
            optimizations: analysis.suggestions,
            performance: `Current metrics: ${analysis.metrics.lines} lines, ${analysis.metrics.functions} functions`,
            recommendations: ['Consider code splitting', 'Add caching', 'Optimize loops']
        };
    }

    generalHelp(request, analysis) {
        return {
            help: `I can help you with: "${request}". Your current code has ${analysis.metrics.lines} lines.`,
            capabilities: [
                'Code generation and completion',
                'Debugging and error fixing', 
                'Code explanation and documentation',
                'Performance optimization',
                'Architecture suggestions'
            ]
        };
    }

    generateSuggestions(request, analysis) {
        const suggestions = [];
        
        if (analysis.issues.length > 0) {
            suggestions.push('Fix identified issues');
        }
        
        if (analysis.metrics.functions > 10) {
            suggestions.push('Consider breaking down into modules');
        }
        
        if (analysis.metrics.lines > 100) {
            suggestions.push('Add documentation');
        }
        
        return suggestions;
    }

    getLanguageFromFile(filename) {
        const ext = path.extname(filename).toLowerCase();
        const langMap = {
            '.js': 'javascript',
            '.py': 'python',
            '.html': 'html',
            '.css': 'css',
            '.md': 'markdown'
        };
        return langMap[ext] || 'plaintext';
    }
}

// Initialize AI Agent
const aiAgent = new AIAgent();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle project context updates
    socket.on('updateContext', (data) => {
        const { projectId, files } = data;
        aiAgent.contextManager.updateContext(projectId, files);
        socket.emit('contextUpdated', { success: true });
    });

    // Handle AI requests
    socket.on('aiRequest', async (data) => {
        const { request, projectId, currentFile, currentCode, chatId } = data;
        
        try {
            const result = await aiAgent.processRequest(request, projectId, currentFile, currentCode);
            
            socket.emit('aiResponse', {
                chatId,
                success: true,
                ...result
            });
            
        } catch (error) {
            socket.emit('aiResponse', {
                chatId,
                success: false,
                error: error.message
            });
        }
    });

    // Handle file operations
    socket.on('saveFile', async (data) => {
        const { projectId, filename, content } = data;
        
        try {
            // In production, save to actual file system or database
            if (!projects.has(projectId)) {
                projects.set(projectId, new Map());
            }
            
            projects.get(projectId).set(filename, content);
            
            socket.emit('fileSaved', { success: true, filename });
            
        } catch (error) {
            socket.emit('fileSaved', { success: false, error: error.message });
        }
    });

    // Handle code analysis requests
    socket.on('analyzeCode', (data) => {
        const { code, language } = data;
        const analysis = CodeAnalyzer.analyzeCode(code, language);
        socket.emit('codeAnalysis', analysis);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const project = projects.get(projectId);
    
    if (project) {
        res.json(Object.fromEntries(project));
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🧠 CodeMind Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🌐 Web interface: http://localhost:${PORT}`);
});

module.exports = { app, server, io };