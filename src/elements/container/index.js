import createview from '../createview';

var container =  createview({
    icon:'ios-box',
    label:'容器',
    name:'container',
    styles:{
        position:'relative',
        width:'200px',
        height:'200px',
        background:'#ccc'
    },
    onRendered:function(dom){
        //alert('容器渲染');
    }
});
export default container;