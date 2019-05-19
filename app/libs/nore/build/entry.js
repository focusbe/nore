
var comList = require.context('__ExtensionDir__', true, /\.vue$/);
var comArr = {};
comList.keys().map(key => {
    let comname;
    let comObj = comList(key);
    if (!!comObj["default"]) {
        comObj = comObj["default"];
    }
    if (!!comObj["name"]) {
        comname = comObj["name"];
    } else {
        comname = key
            .replace("./", "")
            .replace(".vue", "")
            .replace(/\//g, "-");
    }
    comname='extension-'+comname;
    comObj["name"] = comname;
    comArr[comname] = comObj;
    // console.log(comname);
    // console.log(comObj);
    // if(!!comname&&typeof(comObj)=='object'){
    //     Vue.component(comname, comObj);
    // }
});

if(!!Nore){
    Nore.export('__ModuleId__',comObj)
}