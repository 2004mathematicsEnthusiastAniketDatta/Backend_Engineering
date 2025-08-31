// Express creates an HTTP server only
"use strict";

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
    res.send('About Page');
});

app.get('/profile', (req, res) => {
    res.send('Profile Page');
});

app.get('/cart', (req, res) => {
    res.send('Cart Page');
});

const PORT = 8888;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

console.log({ __dirname, __filename });
