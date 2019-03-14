import createview from '../createview';
import './index.scss';
var Swiper = createview({
    icon: 'ios-albums',
    label: '幻灯片',
    name: 'swiper',
    styles: {
        position: 'relative',
        width: '100px',
        height: '100px',
        background: '#ccc'
    },
    props: {
        imglist: {
            label: '图片列表',
            type: 'array',
            default: ''
        },
        autoplay: {
            label: '自动播放时间',
            type: ['number'],
            default: 1000
        }
    },
    template: `<div class="swiper-container">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="item in viewprops.imglist"><img :src="item.url" alt=""></div>
        </div>
    </div>`,
    onRendered: function (dom) {
        //alert('容器渲染');
    }
});
export default Swiper;