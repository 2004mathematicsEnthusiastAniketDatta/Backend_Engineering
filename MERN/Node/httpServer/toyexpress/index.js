const http = require('http');
const url = require('url');

class ToyExpress {
    constructor() {
        this.routes = [];
        this.middlewares = [];
    }

    // HTTP method handlers
    get(path, handler) {
        this.routes.push({ method: 'GET', path, handler });
    }

    post(path, handler) {
        this.routes.push({ method: 'POST', path, handler });
    }

    put(path, handler) {
        this.routes.push({ method: 'PUT', path, handler });
    }

    delete(path, handler) {
        this.routes.push({ method: 'DELETE', path, handler });
    }

    // Middleware support
    use(pathOrMiddleware, middleware) {
        if (typeof pathOrMiddleware === 'function') {
            this.middlewares.push({ path: '*', handler: pathOrMiddleware });
        } else {
            this.middlewares.push({ path: pathOrMiddleware, handler: middleware });
        }
    }

    // Enhanced request object
    enhanceRequest(req) {
        const parsedUrl = url.parse(req.url, true);
        req.query = parsedUrl.query;
        req.params = {};
        req.path = parsedUrl.pathname;
    }

    // Enhanced response object
    enhanceResponse(res) {
        res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        };

        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        res.send = (data) => {
            if (typeof data === 'object') {
                res.json(data);
            } else {
                res.end(data);
            }
        };
    }

    // Route matching with parameters
    matchRoute(routePath, requestPath) {
        const routeParts = routePath.split('/');
        const requestParts = requestPath.split('/');

        if (routeParts.length !== requestParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = requestParts[i];
            } else if (routeParts[i] !== requestParts[i]) {
                return null;
            }
        }

        return params;
    }

    // Execute middlewares
    async executeMiddlewares(req, res) {
        for (const middleware of this.middlewares) {
            if (middleware.path === '*' || req.path.startsWith(middleware.path)) {
                await new Promise((resolve) => {
                    const next = () => resolve();
                    middleware.handler(req, res, next);
                });
            }
        }
    }

    // Request handler
    async handleRequest(req, res) {
        this.enhanceRequest(req);
        this.enhanceResponse(res);

        try {
            // Execute middlewares
            await this.executeMiddlewares(req, res);

            // Find matching route
            const route = this.routes.find(r => {
                if (r.method !== req.method) return false;
                const params = this.matchRoute(r.path, req.path);
                if (params !== null) {
                    req.params = params;
                    return true;
                }
                return false;
            });

            if (route) {
                route.handler(req, res);
            } else {
                res.status(404).send('Not Found');
            }
        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    }

    // Start server
    listen(port, callback) {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(port, callback);
        return server;
    }
}

// Factory function to create app instance
function createApp() {
    return new ToyExpress();
}

module.exports = createApp;

// Example usage:
const app = createApp();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Toy Express!' });
});

app.get('/users/:id', (req, res) => {
    res.json({ userId: req.params.id, query: req.query });
});

app.post('/users', (req, res) => {
    res.status(201).json({ message: 'User created' });
});

app.listen(3000, () => {
    console.log('Toy Express server running on port 3000');
});