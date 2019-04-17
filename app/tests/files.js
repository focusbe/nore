// const Files = require("../libs/files");
// async function main(){
//     var dirname = await Files.getAlivpath(__filename);
//     console.log(dirname);
// }
// main();
// const Files = require('../libs/files');
const fs = require('fs-extra');
const path = require('path');
console.log(process.env.HOME);
console.log('This platform is ' + process.platform);
async function main(){
    // var paths = await Files.getTree(__dirname);
    console.log(path.basename('/a/b/'));
    console.log(path.basename('/a/b'));
}
main();