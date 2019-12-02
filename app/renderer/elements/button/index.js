import createview from '../createview';
var Button = createview({
    tagName: 'a',
    icon: 'ios-link',
    label: '按钮',
    name: 'my-button',
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
            default: 'javascript:void(0)'
        }
    },

    styles: {
        position: 'relative',
        width: '100px',
        height: '30px',
        lineHeight: {
            label: '行高',
            type: 'number',
            default: 2
        },
        textAlign: {
            label: '文字居中',
            type: 'select',
            values: [{
                label: '居中',
                value: 'center'
            }, {
                label: '居左',
                value: 'left'
            }, {
                label: '居右',
                value: 'right'
            }],
            default: 'left'
        },
        color: {
            label: '文字颜色',
            type: 'color',
            default: '#ccc'
        },
        background: '#999'
    },
    render: function (dom) {
        return {
            attrs: {
                href: dom.props.href,
                class: dom.props.class,
                id: dom.props.id
            },
            scopedSlots: {
                default: props => createElement('span', props.text)
            }
        };
    },
    onRendered: function (dom) {

    }
});
export default Button;