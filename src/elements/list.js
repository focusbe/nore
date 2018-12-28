var vueViews = require.context('./', true, /^\.\/(.*)\/(index)\.(js)$/);
var viewList = {};

// var imageEl = require('./views/image');
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
// console.log(viewList);
export default viewList