# Node JS 
1. Node JS is a Javascript runtime based on V8-Engine of Chromium Open Source of Google Chrome 
2. Spider Monkey first version is the oldest Javascript Engine and Javascript Spider Monkey is implemented in Firefox
3. AppleWebkit is the Javascript engine of Safari browser
4. Drop in Replacement -> A software component that can be substituted for another without requiring changes to the surrounding codebase. At the low level, this means:
    - **Binary Compatibility**: The replacement maintains the same Application Binary Interface (ABI), ensuring function signatures, memory layouts, and calling conventions remain identical
    - **API Compatibility**: All public methods, properties, and events are preserved with identical behavior
    - **Dependency Management**: The replacement handles the same external dependencies and system calls
    - **Memory Footprint**: Similar memory allocation patterns to prevent performance degradation
    - **Runtime Behavior**: Identical execution flow, error handling, and side effects
    - **Configuration Interface**: Same configuration parameters and environment variables
    
    Example: Replacing Node.js with Deno requires code modifications, so it's NOT a drop-in replacement. However, replacing one HTTP library with another that has identical APIs would be a drop-in replacement.
**Real-world Bun vs Node.js Drop-in Replacement Example:**
    
    Bun is designed as a drop-in replacement for Node.js in many scenarios:
    
    ```javascript
    // This Express.js application works identically in both Node.js and Bun
    const express = require('express');
    const app = express();
    
    app.get('/', (req, res) => {
        res.json({ message: 'Hello World' });
    });
    
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
    ```
    
    **What makes Bun a drop-in replacement:**
    - Same `node_modules` and `package.json` structure
    - Compatible with most npm packages
    - Identical CommonJS and ES modules syntax
    - Same built-in APIs (`fs`, `path`, `http`, etc.)
    - Can run existing Node.js applications with `bun run app.js` instead of `node app.js`
    
    **Limitations:** Not 100% compatible - some Node.js-specific APIs and certain npm packages may not work, making it a *near* drop-in replacement rather than perfect.
    **Low-Level Functional Implementation and Optimization in Drop-in Replacements:**

    **Memory Management Optimization:**
    ```c
    // Node.js uses V8's garbage collector
    // Bun uses JavaScriptCore with different GC strategy
    struct MemoryPool {
        void* heap_start;
        size_t heap_size;
        uint32_t gc_threshold;
    };

    // Drop-in replacement must maintain same memory allocation patterns
    void* allocate_compatible(size_t size) {
        // Ensure same alignment and size as original implementation
        return aligned_alloc(8, size); // 8-byte alignment for V8 compatibility
    }
    ```

    **Function Call Optimization:**
    ```javascript
    // Original Node.js implementation
    function readFileSync(path) {
        return binding.fs.readFileSync(path); // Direct C++ binding
    }

    // Drop-in replacement optimization
    function readFileSync(path) {
        // Must maintain identical function signature and behavior
        // But can optimize internal implementation
        return optimized_binding.fs.readFileSync(path); // Faster I/O implementation
    }
    ```

    **Binary Interface Preservation:**
    ```c
    // Original Node.js module structure
    typedef struct {
        void (*init)(v8::Local<v8::Object> exports);
        const char* modname;
        int priv;
        struct node_module* link;
    } node_module;

    // Drop-in replacement MUST use identical structure
    // Even if internal optimization uses different data layout
    ```

    **Event Loop Optimization:**
    ```c
    // Node.js uses libuv event loop
    // Bun uses custom event loop but maintains same API
    struct EventLoop {
        uv_loop_t* uv_loop;     // Original implementation
        int pending_handles;
        void (*run_mode)(int);  // Same function signature required
    };

    // Optimization: Use epoll/kqueue directly instead of libuv
    // But expose identical interface to maintain compatibility
    ```

    **JIT Compilation Compatibility:**
    - **V8 Bytecode**: Node.js compiles JavaScript to V8 bytecode
    - **Replacement Strategy**: Must either interpret V8 bytecode OR recompile source with identical execution semantics
    - **Optimization**: Use faster compiler (like Bun's Zig-based transpiler) while maintaining execution order and side effects


## Node.js Wrapper Functions

    Every JavaScript file in Node.js is automatically wrapped in a function before execution. This wrapper function provides the module system functionality and creates the module scope.

    ### The Wrapper Function Structure

    ```javascript
    (function(exports, require, module, __filename, __dirname) {
        // Your code goes here
        console.log('Hello World');
        // End of your code
    });
    ```

    **What Node.js does internally:**
    1. Reads your JavaScript file
    2. Wraps it in the function shown above
    3. Executes the wrapped function with specific parameters

    ### Wrapper Function Parameters

    #### 1. `exports`
    - **Type**: Object reference
    - **Purpose**: Shorthand reference to `module.exports`
    - **Usage**: Add properties/methods to make them available when module is required

    ```javascript
    // Using exports
    exports.greet = function(name) {
        return `Hello, ${name}!`;
    };

    // Equivalent to: module.exports.greet = function(name) { ... }
    ```

    #### 2. `require`
    - **Type**: Function
    - **Purpose**: Import other modules (built-in, local files, or npm packages)
    - **Returns**: The `module.exports` object of the required module

    ```javascript
    const fs = require('fs');           // Built-in module
    const path = require('path');       // Built-in module
    const express = require('express'); // npm package
    const myModule = require('./utils'); // Local file
    ```

    #### 3. `module`
    - **Type**: Object
    - **Purpose**: Reference to the current module object
    - **Key Properties**:
      - `module.exports`: Object that gets returned when module is required
      - `module.filename`: Absolute path of current module file
      - `module.id`: Module identifier (usually the filename)
      - `module.parent`: Module that required this module
      - `module.children`: Array of modules required by this module

    ```javascript
    console.log(module.id);       // '/path/to/current/file.js'
    console.log(module.parent);   // Module object that required this file
    console.log(module.exports);  // {} (initially empty object)

    // Replacing entire exports
    module.exports = {
        name: 'MyModule',
        version: '1.0.0'
    };
    ```

 #### 4. `__filename`
    - **Type**: String
    - **Purpose**: Absolute path of the current module file
    - **Use Cases**: File operations, logging, dynamic imports

    ```javascript
    console.log(__filename); // '/home/user/project/app.js'

    // Useful for file operations relative to current file
    const configPath = path.join(path.dirname(__filename), 'config.json');
    ```

#### 5. `__dirname`
    - **Type**: String
    - **Purpose**: Absolute path of the directory containing the current module
    - **Use Cases**: Resolving relative paths, serving static files

    ```javascript
    console.log(__dirname); // '/home/user/project'

    // Serving static files in Express
    app.use(express.static(path.join(__dirname, 'public')));

    // Reading files relative to current directory
    const data = fs.readFileSync(path.join(__dirname, 'data.txt'), 'utf8');
    ```

    ### Practical Example

    ```javascript
    // utils.js
    console.log('Module Info:');
    console.log('Filename:', __filename);
    console.log('Directory:', __dirname);
    console.log('Module ID:', module.id);

    // Export using exports shorthand
    exports.add = (a, b) => a + b;
    exports.multiply = (a, b) => a * b;

    // Export using module.exports
    module.exports.divide = (a, b) => {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
    };

    // app.js
    const utils = require('./utils'); // Triggers wrapper function execution

    console.log(utils.add(5, 3));      // 8
    console.log(utils.multiply(4, 7)); // 28
    console.log(utils.divide(10, 2));  // 5
    ```

### Key Points About Wrapper Functions

    1. **Automatic Scope Creation**: Prevents global namespace pollution
    2. **Module Isolation**: Each file gets its own scope with these parameters
    3. **CommonJS Implementation**: This mechanism implements the CommonJS module system
    4. **No Global Variables**: Variables declared in your file are not global due to the wrapper
    5. **Performance**: The wrapper function is created once per module and cached

