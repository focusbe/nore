var comList = require.context("./", true, /\.vue$/);

import Vue from "vue";
comList.keys().map(key => {
    let comname;
    let comObj = comList(key);
    if(!!comObj['default']){
        comObj = comObj['default'];
    }
    if(!!comObj['name']){
        comname = comObj['name'];
    }
    else{
        comname = key.replace('./','').replace('.vue','').replace(/\//g,'-');
    }
    // console.log(comname);
    // console.log(comObj);
    if(!!comname&&typeof(comObj)=='object'){
        Vue.component(comname, comObj);
    }
})