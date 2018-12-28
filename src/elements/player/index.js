import createview from '../createview';

var player =  createview({
    icon:'play',
    label:'视频',
    name:'player',
    props:{
        file:{
            label:'视频',
            type:['url'],
            default:''
        },
        autoplay:{
            label:'是否自动播放',
            type:['bool'],
            default:1
        }
    },
    styles:{
        height:'300px',
        display:'inline-block'
    },
    onRendered:function(vnode){
        
        // alert(1);
        //console.log(vnode);
        //https://videogame.ztgame.com.cn/xx2/20180321/index_180321-152159820245.mp4\
        if(!!vnode&&!!vnode.dom){
            setTimeout(function(){
                
                requirejs(['jquery','gplayer/main'],function($,Gplayer){
                    //console.log(vnode.props.autoplay);
                    $(vnode.dom).gplayer({
                        file:vnode.props.file,
                        auto:parseInt(vnode.props.autoplay),
                        onplay:function(){
                            
                        }
                    });
                });
            },100);
            
        }
        
        //$(vnode.dom).html('<video style="width:100%"  vertical-align: top;'+vnode.props.autoplay+' controls src="'+vnode.props.file+'"></video>');
    }
});
// console.log(player);
export default player;