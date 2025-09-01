// Express creates an HTTP server only
"use strict";
//express is like a handler function with lot more features for initial assumptions
/* 
 * EXPRESS UNDERSTANDING:
 * Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. 
 * Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love. 
 * Express is essentially a sophisticated wrapper around Node.js's built-in HTTP module.
 * At its core, express() returns a function that can handle HTTP requests and responses.
 * 
 * Conceptually, express works like this:
 * 
 * function express() {
 *   // Create an application function that acts as a request handler
 *   function app(req, res, next) {
 *     // This is where the magic happens - routing, middleware execution, etc.
 *     app.handle(req, res, next);
 *   }
 *   
 *   // Add methods and properties to the app function
 *   app.use = function(middleware) { ... };
 *   app.get = function(path, handler) { ... };
 *   app.listen = function(port, callback) {
 *     // Internally creates: require('http').createServer(app).listen(port, callback)
 *   };
 *   
 *   return app;
 * }
 * 
 * The returned 'app' function IS the handler function that gets passed to http.createServer().
 * When you call app.listen(), express internally does:
 * require('http').createServer(app).listen(port)
 * 
 * Express enhances the basic handler with:
 * - Middleware stack management
 * - Route matching and parsing
 * - Request/Response object enhancements
 * - Template engine integration
 * - Static file serving
 * - Error handling
 */
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Logger middleware for HTTP -> morgan
app.use(morgan('dev'));

// Set view engine to EJS
app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Custom middleware
app.use((req, res, next) => {
    console.log("This is a middleware");
    const a = 2;
    const b = 3;
    console.log(a + b);
    next();
});

// Route handlers
app.get('/', (req, res, next) => {
    const a = 5;
    const b = 10;
    console.log(a + b);
    next();
}, (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/cart', (req, res) => {
    res.render('cart');
});

const PORT = 8888;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

console.log({ __dirname, __filename });
