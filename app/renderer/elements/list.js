var vueViews = require.context("./", true, /^\.\/(.*)\/(index|main)\.(js|vue)$/);
var viewList = {};
var curElement;
vueViews.keys().map(key => {
    if(typeof(vueViews(key)['default'])=='object'){
        curElement = vueViews(key)['default'];
        curElement.filename = key.replace('./','').replace('/index.js','');
    }
    else{
        curElement = vueViews(key);
    }
    //console.log(curElement);
    if(!!curElement['name']){
        viewList[curElement['name']] = curElement;
    }
})
export default viewList