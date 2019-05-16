var comList = require.context("./", true,  /^\.\/(.+)\/index\.js/);
var comarr = {};
comList.keys().map(key => {
    console.log(key);
    let comname;
    let comObj = comList(key);
    if(!!comObj['default']){
        comObj = comObj['default'];
    }
    if(!!comObj['name']){
        comname = comObj['name'];
    }
    else{
        comname = key.replace('./','').replace('/index.js','').replace(/\//g,'-');
    }
    // console.log(comname);
    // console.log(comObj);
    if(!!comname&&typeof(comObj)=='object'){
        comarr[comname] = comObj
    }
})
export default comarr;