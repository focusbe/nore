import createview from '../createview';

var container =  createview({
    icon:'images',
    label:'幻灯片',
    name:'swiper',
    defaultStyle:{
        position:'relative',
        width:'100px',
        height:'100px',
        padding:'0',
        textAlign:'center',
        color:'',
        background:'#ccc'
    },
    onRendered:function(dom){
        //alert('容器渲染');
    }
});
export default container;