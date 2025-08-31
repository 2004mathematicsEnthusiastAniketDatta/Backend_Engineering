const fs = require('fs');
const math = require('./math')
class FileOperations {
    constructor(filePath) {
        this.filePath = filePath;
    }

    readFile() {
        return fs.readFileSync(this.filePath, 'utf-8');
    }

    writeFile(data) {
        fs.writeFileSync(this.filePath, data);
    }
}
const fileOps = new FileOperations('example.txt');
console.log({__dirname, __filename});
fileOps.writeFile('Hello, world!');
console.log(fileOps.readFile());
const ob = new math();
console.log(ob.add(5, 3));
console.log(ob.subtract(5, 3));
console.log(ob.multiply(5, 3));
console.log(ob.divide(5, 3));

// function __require(id) {
// //.. if id starts with . , search user's directory in code
// //    if (id.startsWith('.')) {
// //        const filePath = path.join(__dirname, id);
// //        return require(filePath);
// //    }
// //    return require(id);
// //otherwise search in own internal module
// if not found search in node_modules
// otherwise throw error
// }


