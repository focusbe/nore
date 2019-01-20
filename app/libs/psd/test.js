
const PSD = require('./index');
async function main(){
    let psd = new PSD('/Users/liu/Desktop/qiuqiu.psd','/Users/liu/Desktop/qiuqiu','');
    let result = await psd.parse();
    // result = null;
    // psd = null;
    console.log(result);
}
function showMem(){
    //global.gc();
    let memused = process.memoryUsage();
    console.log(memused);
    memused = null;
};
setInterval(function(){
    showMem();
},1000);
main();