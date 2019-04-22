import createview from '../createview';

var container =  createview({
    tagName:'div',
    icon:'root',
    label:'根容器',
    name:'root',
    hidden:true,
    props:[
        
    ],
    styles:{
        position:'relative',
        width:'100%',
        height:'100%',
        overflow:{
            label:'超出显示',
            type:'hidden',
            default:'hidden'
        },
        opacity:{
            type:'hidden'
        },
        xalign:{
            type:'hidden'
        },
        yalign:{
            type:'hidden'
        },
        x:{
            type:'hidden'
        },
        y:{
            type:'hidden'
        },
        anchorx:{
            type:'hidden'
        },
        anchory:{
            type:'hidden'
        }
    },
    onRendered:function(dom){
        //alert('容器渲染');
    }
});
export default container;