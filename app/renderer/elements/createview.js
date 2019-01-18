

function createview(compon){
    var defaultCompon = {
        tagName:'div',
        icon:'',
        label:'',
        name:'',
        props:{
            
        },
        styles:{
            display:{
                group:'positionsize',
                label:'显示方式',
                type:'select',
                values:[{
                    label:'块级元素',
                    value:'block'
                },{
                    label:'行内快',
                    value:'inline-block'
                },{
                    label:'隐藏',
                    value:'none'
                }],
                default:'block',
            },
            overflow:{
                group:'positionsize',
                label:'超出',
                type:'select',
                values:[{
                    label:'隐藏',
                    value:'hidden'
                },{
                    label:'显示',
                    value:'visible'
                },{
                    label:'滚动',
                    value:'scroll'
                }],
                default:'hidden',
            },
            background:{
                group:'pageconfig',
                label:'背景',
                type:['image','color'],
                default:''
            },
            opacity:{
                group:'pageconfig',
                label:'透明度',
                type:'slider',
                values:[0,100],
                default:1
            },
            position:{
                group:'positionsize',
                label:'位置属性',
                type:'select',
                values:[{
                    label:'顺序排列',
                    value:'relative'
                },{
                    label:'在父容器浮动',
                    value:'absolute'
                },{
                    label:'在窗口浮动',
                    value:'fixed'
                }],
                default:'relative'
            },
            width:{
                group:'positionsize',
                label:'宽度',
                type:'number',
                default:'100'
            },
            height:{
                group:'positionsize',
                label:'高度',
                type:'number',
                default:'100'
            },
            x:{
                group:'positionsize',
                label:'X坐标',
                type:'number',
                default:'0'
            },
            y:{
                group:'positionsize',
                label:'Y坐标',
                type:'number',
                default:'0'
            },
            
            xalign:{
                group:'positionsize',
                label:'水平起始位置',
                type:'select',
                show:"STYLES.position!='relative'",
                values:[{
                    label:'左',
                    value:'left'
                },{
                    label:'中',
                    value:'center'
                },{
                    label:'右',
                    value:'right'
                }],
                default:'left'
            },
            yalign:{
                group:'positionsize',
                label:'垂直起始位置',
                type:'select',
                show:"STYLES.position!='relative'",
                values:[{
                    label:'上',
                    value:'top'
                },{
                    label:'中',
                    value:'center'
                },{
                    label:'下',
                    value:'bottom'
                }],
                default:'top'
            }
        },
        onRendered:function(){
            
        },
        render:function(){
            return {

            };
        }
    }

    function mergeStyles (styles,common){
        for(var i in styles){
            if(!!common[i]){
                //在common里有的css属性
                if(typeof(styles[i])!='object'){
                    common[i]['default'] = styles[i];
                }
                else{
                    common[i] = styles[i];
                }
                //delete styles[i];
            }
            else if(typeof(styles[i])!='object'){
                
                console.error('组件：'+compon.name+'请按照{name,type,default}格式定义样式'+i);
            }
            else{
                common[i] = styles[i];
            }
        }
    }
    
    function getStyleGroups(stylesObj,groups){
        var result = {};
        for(var i in stylesObj){
            if(typeof(stylesObj[i])=='object'){
                if(!stylesObj[i]['group']){
                    stylesObj[i] = 'other';
                }
                var groupname  =stylesObj[i]['group'];
                var grouplabel;
                if(!!defaultCompon.styleGroups[groupname]){
                    grouplabel = defaultCompon['styleGroups'][groupname]['label'];
                    if(!result[groupname]){
                        result[groupname] = {grouplabel:grouplabel,styles:{}};
                    }
                    result[groupname]['styles'][i] = stylesObj[i];
                }
                else{
                    console.error('没有样式分类：'+groupname);
                }
            }
            else{

                console.error('组件：'+compon.name+'请按照{name,type,default}格式定义样式'+i);
            }
        }
        return result;
    }
    mergeStyles(compon.styles,defaultCompon.styles);
    compon.styles= defaultCompon.styles
    var props = Object.assign({},defaultCompon.props,compon.props);
    compon.props = props;
    return Object.assign(defaultCompon,compon);
}
export default createview;
