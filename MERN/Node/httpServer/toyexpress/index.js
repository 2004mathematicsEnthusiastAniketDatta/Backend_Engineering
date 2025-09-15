const http = require('http');
const url = require('url');
// REST API -> Representational State Transfer API -> Representation of the entities is central to idea.
// Everything in REST API is a Resource
// Client Demands , Server Serves
// JSON is a representation of the resource
// Stateless -> No session on server, each request is independent
// Uniform Interface -> Standardized way of communication between client and server
// Cacheable -> Responses should define themselves as cacheable or not to prevent clients from reusing stale data
// Layered System -> Client cannot ordinarily tell whether it is connected directly to the end server, or to an intermediary along the way
// Code on Demand (optional) -> Servers can temporarily extend or customize the functionality of a client by transferring executable code
// Entity in the application is a resource -> Student , Customer , Message , Video , Article
// Go through fundamentals 
// All the data of the application belongs to some entity type -> External
// All students are stored in on table in the database
// Each student is a resource
// Each student has a unique identifier -> Primary Key
// Each student can be represented in multiple formats -> JSON , XML , HTML
// Each student can have multiple representations -> Full representation , Summary representation
// Each representation can have multiple versions -> v1 , v2
// REST API should be able to handle all these variations
// all messages are stored in some database.
// Storage representation does not matter.
// The client asks for some data of some entity type in some representation and server has to respond
// Representation is central to REST API and client demands a particular representation of the entity in JSON , XML etc.
//Practically we all care about JSON but REST does not restrict us.
//REST empowers clients to demand resource 
// In one of the format the server supports
// Client <-> Server <-> Database -> Internal Representation Tables,Rows, columns
//            External representation
//            JSON
//Once the client has one "representation" , this can request  to updat this.
//The idea is : Everything happens on the data/entity sent by the REST server.
// 1. Create a resource of type ....
// 2. Update a resource 
//3. Delete a resource
//4. Get a resource
//5. List all resources of a particular type
// REST API does not enforce a certain protocol , most commonly implemented over HTTP
//Rest goes very well with HTTP 
// REST is just a specification
// HTTP verbs : GET , PUT , POST , DELETE , PATCH has well-defined meanings.
//So, by seeing a particular verb we could anticipate the purpose
//DELETE -> Delete a resource of type 'user' identified by '1' -> /users/1
// With HTTP verbs we can multiplex
// get a student's details -> GET /students/1
// Instead of having an endpoint like /getStudent 
// update a student's details -> PUT /students/1 instead of having an endpoint like /updateStudent
// create a new student -> POST /students instead of having an endpoint like /createStudent
// delete a student -> DELETE /students/1 instead of having an endpoint like /deleteStudent
// list all students -> GET /students instead of having an endpoint like /listStudents
// HTTP and tooling : Because entire internet works on HTTP, we already have a large set of tooling that would work as is for REST API
// HTTP clients -> CURL , Postman , requests ,etc
// Web Caches  : nginx cache, varnish , ha proxy etc
// HTTP monitoring tools: tracing , packet sniffing
//load balancers : distribute load uniformly
// Security Control : SSL
// Compression
// Downsides of doing REST over HTTP
// 1. Caching : GET requests are cacheable , POST , PUT , DELETE are not cacheable
// 2. Proxies : GET requests can be proxied , POST , PUT , DELETE cannot be proxied
// 3. Firewalls : GET requests can pass through firewalls , POST , PUT , DELETE might be blocked by firewalls
// 4. Idempotency : GET , PUT , DELETE are idempotent , POST is not idempotent
// Idempotent -> Making the same request multiple times has the same effect as making it once
// GET /students/1 -> 5 times -> same effect as making it once
// PUT /students/1 -> 5 times -> same effect as making it once
// DELETE /students/1 -> 5 times -> same effect as making it once
// POST /students -> 5 times -> creates 5 different students
// 5. Safety : GET is safe , POST , PUT , DELETE are not safe
// Safe -> Making the request does not change the state of the server
// GET /students/1 -> does not change the state of the server
// POST /students -> changes the state of the server
// PUT /students/1 -> changes the state of the server
// Consumption is not Easy and not Simple as stubs in RPC
// We would need an HTTP client to make REQ ,
// get response in say  JSON , Convert to Native objects and then consume
// Consumption is  repetitive: Everyone who consumes / adopts REST is writing the same code again . Eg: Serialization , Deserialization to native objects, failures
// timeouts , retries , logging , metrics , tracing, compression etc
// A company may have an internal Standardization and many  would have to either repeat or create a shared internal library.
// Some webservers may not  support all HTTP verbs
// and some may choose to give support only for GET and POST , adopting such servers limit REST potential
// HTTP payloads are huge e.g.: JSON
// may not suit well for low latency applications
// We cannot switch protocols easily TCP->UDP
// Express is a web framework for Node.js
// Along with HTTP Server  this provides handlers for routing , middleware support , enhanced request and response objects.
//  wrapper over Node's HTTP module
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