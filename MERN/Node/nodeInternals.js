//phases of event loop and thread workers
const fs = require('fs') // 1. Top-level code execution - synchronous module loading
const crypto = require('crypto') //1. Top-level code execution - synchronous module loading
setTimeout(() => console.log('set timeout'), 0); // 3. Timer phase - scheduled for next event loop iteration
setImmediate(() => console.log('set immediate')); // 5. Check phase - executed in current event loop iteration after I/O polling
fs.readFile('file.txt', 'utf-8',  (err,data) => {
    console.log('file read'); // 4. I/O callbacks phase - executed when file read operation completes
    setTimeout(() => console.log('set timeout after file read'), 0); // 7. Timer phase - scheduled for next event loop iteration
    setImmediate(() => console.log('set immediate after file read')); // 6. Check phase - executed immediately after current I/O phase in same iteration
    process.env.UV_THREADPOOL_SIZE = 4; // 8. Configure thread pool size (default is 4)
    const start = Date.now();
    crypto.pbkdf2('password', 'salt1', 100000, 64, 'sha512', (err, data) => {
        console.log(`${Date.now() - start}ms hash generated`); // 8. Thread worker - executed when the hashing operation completes
    });
    crypto.pbkdf2('password', 'salt1', 100000, 64, 'sha512', (err, data) => {
        console.log(`${Date.now() - start}ms hash generated`); // 9. Thread worker - executed when the hashing operation completes
    });
    crypto.pbkdf2('password', 'salt1', 100000, 64, 'sha512', (err, data) => {
        console.log(`${Date.now() - start}ms hash generated`); // 10. Thread worker - executed when the hashing operation completes
    });
    crypto.pbkdf2('password', 'salt1', 100000, 64, 'sha512', (err, data) => {
        console.log(`${Date.now() - start}ms hash generated`); // 11. Thread worker - executed when the hashing operation completes
    });
    crypto.pbkdf2('password', 'salt1', 100000, 64, 'sha512', (err, data) => {
        console.log(`${Date.now() - start}ms hash generated`); // 12. Thread worker - executed when the hashing operation completes
    }); // 4 thread workers execute parallelly 
}); // I/O operation queued in thread pool
console.log("hello world"); // 2. Top-level code execution - runs synchronously before event loop starts
