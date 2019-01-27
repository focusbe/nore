import createview from '../createview';

var container = createview({
    icon: 'md-image',
    tagName: 'img',
    label: '图片',
    name: 'image',
    props: {
        src: {
            label: '图片地址',
            key: 'src',
            type: 'text',
            default: ''
        }
    },
    styles: {
        position: 'relative',
        width: '100px',
        height: '100px',
        background: 'none'
    },
    render: function (dom) {
        //alert('容器渲染');
        return {
            attrs: {
                src: dom.props.img,
                id: dom.props.id
            }
        };
    }
});
export default container;