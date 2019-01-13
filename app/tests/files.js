// const Files = require("../libs/files");
// async function main(){
//     var dirname = await Files.getAlivpath(__filename);
//     console.log(dirname);
// }
// main();
const Files = require('../libs/files');
const fs = require('fs-extra');
async function main(){
    var paths = await Files.getTree(__dirname);
    console.log(paths);
}
main();