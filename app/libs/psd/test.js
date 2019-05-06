const PSD = require("psdpaser");
import mypsd from "./index";
async function main() {
    var psd = PSD.fromFile("C:\\Users\\liupeng\\Desktop\\xinbing\\slogan.psd");
    // psd.parse();
    // let tree = psd.tree();
    // console.log(psd.tree().export());

    // var testLayer1 = tree._children[0]._children[0]._children[1];
    // var testLayer2 = tree._children[0]._children[1];
    // var testLayer3 = tree._children[0]._children[3];
    // console.log(testLayer1);
    // console.log(testLayer2);
    // console.log(testLayer3);
    // testLayer1.layer.image.saveMaskAsPng("C:\\Users\\liupeng\\Desktop\\xinbing\\slogan1.png");
    // testLayer2.layer.image.saveMaskAsPng("C:\\Users\\liupeng\\Desktop\\xinbing\\slogan2.png");
    // testLayer3.layer.image.saveMaskAsPng("C:\\Users\\liupeng\\Desktop\\xinbing\\slogan3.png");
    var mpsd = new mypsd('C:\\Users\\liupeng\\Desktop\\xinbing\\slogan.psd', "C:\\Users\\liupeng\\Desktop\\xinbing\\slogan");
    var errorarr = await mpsd.getErrorLayer();
    console.log(errorarr);
}
// function showMem(log) {
//     if (typeof (global.gc) == 'function') {
//         // console.log('手动gc一次');
//         global.gc();
//     }
//     let rss = parseInt(process.memoryUsage().rss/1024/1024);
//     let memused = parseInt(process.memoryUsage().heapUsed / 1024 / 1024);
//     console.log('rss":'+rss + 'M');
//     console.log('memused":'+memused + 'M');
//     memused = null;
// }
// setInterval(function(){
//     //showMem();
// },1000);
main();
