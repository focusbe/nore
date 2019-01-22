
const PSD = require('./index');
async function main(){
    let index = parseInt(Math.random()*3+2);
    index = 4;
    let psd = new PSD('C:/Users/liupeng/Desktop/testpsd/mobile/qiuqiu'+index+'.psd','C:/Users/liupeng/Desktop/testpsd/mobile/qiuqiu'+index+'/','');
    let result = await psd.parse();
    let result2 = await psd.parse(true);

    let psd2 = new PSD('C:/Users/liupeng/Desktop/testpsd/mobile/zhoudongyu.psd','C:/Users/liupeng/Desktop/testpsd/mobile/zhoudongyu','');
    let result3 = await psd2.parse();
    let result4 = await psd2.parse(true);
    console.log(result3);
    console.log(result4);
}
function showMem(log) {
    if (typeof (global.gc) == 'function') {
        // console.log('手动gc一次');
        global.gc();
    }
    let rss = parseInt(process.memoryUsage().rss/1024/1024);
    let memused = parseInt(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log('rss":'+rss + 'M');
    console.log('memused":'+memused + 'M');
    memused = null;
}
setInterval(function(){
    //showMem();
},1000);
main();

// paiping(vnodetree, yiweitree, relativeheight, parent) {
//     if (!yiweitree) {
//         yiweitree = [];
//         relativeheight = 0;
//         this.paiping(vnodetree, yiweitree, relativeheight, null);

//         return yiweitree;
//     }
//     let curvnode;
//     let isallRealtive = true;
//     for (let i in vnodetree) {
//         if (
//             !!vnodetree[i].styles &&
//             !!vnodetree[i].styles.position != "relative"
//         ) {
//             isallRealtive = false;
//             break;
//         }
//     }

//     //如果采用绝对定位在网页中反序
//     if (!isallRealtive) {
//         vnodetree = vnodetree.reverse();
//     }
    
//     //一维的x 相对于画布的位置
//     for (let i in vnodetree) {
//         curvnode = vnodetree[i];
//         if (!!parent) {
//             curvnode.styles.x += parent.styles.x;
//             curvnode.styles.y += parent.styles.y;
//             if (parent.styles.display == "none") {
//                 curvnode.styles.display = "none";
//             }
//         }
//         if (!!curvnode.childrens && curvnode.childrens.length > 0) {
//             // if (curvnode.styles.position != 'relative') {
//             //     curvnode.childrens = curvnode.childrens.reverse();
//             // }
//             this.paiping(
//                 curvnode.childrens,
//                 yiweitree,
//                 relativeheight,
//                 curvnode
//             );

//             if (curvnode.styles.position == "relative") {
//                 relativeheight += curvnode.styles.height;
//             }
//         } else if (curvnode.view != 'container') {
//             if (curvnode.view == "my-button") {
//                 if (!!curvnode.props.text) {
//                     curvnode.view = "text";
//                 }
//             }
//             curvnode.styles.y += relativeheight;
//             yiweitree.push(curvnode);
//         }
//     }
//     // console.log(yiweitree);

// }