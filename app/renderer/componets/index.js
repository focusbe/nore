var comList = require.context("./", true, /\.vue$/);
// var viewList = {};
// var curElement;
comList.keys().map(key => {
    console.log(comList(key));
    // if(typeof(vueViews(key)['default'])=='object'){
    //     curElement = vueViews(key)['default'];
    //     curElement.filename = key.replace('./','').replace('/index.js','');
    // }
    // else{
    //     curElement = vueViews(key);
    // }
    // //console.log(curElement);
    // if(!!curElement['name']){
    //     viewList[curElement['name']] = curElement;
    // }
})
//export default viewList