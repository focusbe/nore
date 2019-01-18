import createview from '../createview';
var container =  createview({
    icon:'md-text',
    label:'文字',
    name:'text',
    tagName: 'p',
    defaultStyle:{
        position:'relative',
        width:'100px',
        height:'100px',
        padding:'0',
        textAlign:'center',
        color:'',
        background:'#ccc'
    },
    props: {
        text: {
            label: '文字',
            key: 'text',
            type: 'text',
            default: '按钮'
        },
        href: {
            label: '链接',
            key: 'href',
            type: 'url',
            default: '#'
        }
    },
    render(dom){
        return {
            attrs:
            {
                class: dom.props.class,
                id: dom.props.id
            },
            domProps: {
                innerHTML: dom.props.text
            }
        };
    },
    onRendered:function(dom){
        //alert('容器渲染');
    }
});
export default container;