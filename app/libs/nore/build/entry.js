
var str = `var comList = require.context('__ExtensionDir__', true, /\.vue$/);
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
            .replace(/\\//g, "-");
    }
    comname='extension-'+comname;
    comObj["name"] = comname;
    comArr[comname] = comObj;
});
export default comObj;`
export default str;