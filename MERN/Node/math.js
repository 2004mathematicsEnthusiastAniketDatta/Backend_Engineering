class Calculator {
    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error("Division by zero is not allowed");
        }
        return a / b;
    }
}
//Default export
module.exports = Calculator;
// Create an instance of Calculator to test the export
// const calc = new Calculator();
//export.add = function(a,b) { return a+b}; 
//export.subtract = function(a,b) { return a-b};
//export.multiply = function(a,b) { return a*b};
//export.divide = function(a,b) { if(b===0) throw new Error("Division by zero"); return a/b; };
//per file only one default export is allowed there may be many exports and name can't be changed
//require('fs') -> node built-in module
//require('./math.js') -> user-defined module and file is present in currrent directory
//require('../math.js') -> file is present in parent directory
//
