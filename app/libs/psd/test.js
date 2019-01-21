
const PSD = require('./index');
async function main(){

    let psd = new PSD('/Users/liu/Desktop/qiuqiu.psd','/Users/liu/Desktop/qiuqiu','');
    let result = await psd.parse();
    result = null;
    psd = null;
    
}
function showMem(){
    //global.gc();
    let memused = parseInt(process.memoryUsage().heapUsed/1024/1024);
    console.log(memused+'M');
    memused = null;
};
setInterval(function(){
    showMem();
},1000);
main();