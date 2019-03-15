import createview from '../createview';

var container = createview({
    icon: 'md-code-working',
    tagName: '',
    label: '原生标签',
    name: 'htmltag',
    props: {
        tagName: {
            label: '标签名',
            type: 'text',
            default: 'div'
        }
    },
    styles: {
        position: 'relative',
        width: '100px',
        height: '100px',
        background: 'red'
    },
    render: function (dom) {
        //alert('容器渲染');
        var tagname = dom.props.tagName;
        return `
            <${dom.props.tagName}><slot></slot></${dom.props.tagName}>
        `;
    }
});
export default container;