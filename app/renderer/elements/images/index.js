import createview from '../createview';

var container =  createview({
    icon:'image',
    tagName:'img',
    label:'图片',
    name:'image',
    styles:{
        position:'relative',
        width:'100px',
        height:'100px',
        background:'#ccc'
    },
    onRendered:function(dom){
        //alert('容器渲染');
    }
});
export default container;