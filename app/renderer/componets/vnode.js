import viewList from "../elements/list.js";
import Vue from "vue";
import workspace from "./workspace.vue";
import $ from "jquery";
Vue.component("vnoderender", {
    methods: {},
    components: {
        // <my-component> 将只在父组件模板中可用
        'workspace':workspace
    },
    mounted: function() {
        if (this.ismouseDown) {
            return;
        }
        var viewdata = this.viewdata;
        this.viewdata.onRendered({
            dom: this.$el,
            props: this.viewprops
        });
    },
    updated: function() {
        if (this.ismouseDown) {
            return;
        }
        var viewdata = this.viewdata;
        this.viewdata.onRendered({
            dom: this.$el,
            props: this.viewprops
        });
    },
    
    render: function(createElement) {
        var viewdata = this.viewdata;
        var slots = [this.$slots.default];

        if(!!this.isoptioning){
            slots.push(createElement('workspace'));
        }
        this.vuenode = createElement(
            this.viewdata.tagName,
            this.viewdata.render({props: this.viewprops }),
            slots
        );
        return this.vuenode;
    },
    methods:{
        getDom(){
            return this.$el;
        }
    },
    props: {
        viewdata: {
            type: Object,
            required: true
        },
        ismouseDown: {
            type: Boolean
        },
        isoptioning:{
            type: Boolean
        },
        viewprops: {
            type: Object
        }
    }
});

class Styles{
    
}

class vnode {
    constructor(view, styles, props) {
        this.name = view.name;
        if(view=='root'){
            this.name = 'root';
        }
        this.view = view;
        this.domid = (new Date()).valueOf();
        this.styles = styles;
        this.props = props;
        this.childrens = [];
        this.parent = undefined;
        this.isoptioning = false;
        this.init();
    }

    push(child) {
        child.parent = this;
        this.childrens.push(child);
    }
    remove(child) {
        var index = this.childrens.findIndex(item => item === child);
        if (index >= 1) {
            return this.childrens.splice(index, 1);
        }
        return -1;
    }
    init(){
        if(!this.styles){
            this.styles = {};
        }
        if(!this.props){
            this.props = {};
        }
        var styles = {};
        var props = {};
        var curView = viewList[this.name];
        for(var i in curView.styles){
            if(typeof(curView.styles[i]['default'])=='undefined'){
                curView.styles[i]['default'] = null;
            }
            styles[i] = curView.styles[i]['default'];
        }

        for(var i in curView.props){
            if(typeof(curView.props[i]['default'])=='undefined'){
                curView.props[i]['default'] = null;
            }
            props[i] = curView.props[i]['default'];
        }  
        this.styles = Object.assign(styles,this.styles);
        this.props = Object.assign(props,this.props);
    }
    changeStyles(styles){
        this.styles = styles;
    }
    changeProps(props){
        this.props = props;
    }
    toJson(){
        var curJson = {};
        curJson.view = this.view;
        curJson.styles = this.styles;
        curJson.props = this.props;
        curJson.domid = this.domid;
        curJson.childrens = [];
        for(var i in this.childrens){
            curJson.childrens.push(this.childrens[i].toJson());
        }
        return curJson;
    }
    
    getModulslist(modulelist){
        if(!modulelist){
            modulelist = [];
        }
        //console.log(modulelist.indexOf(this.view.filepath));
        if(!!this.view&&this.view.filename&& modulelist.indexOf(this.name)<0){
            modulelist.push(this.view.filename);
        }
        for(var i in this.childrens){
            this.childrens[i].getModulslist(modulelist);
        }
        return modulelist;
    }

    getStyles(){
        var styles =Object.assign({},this.styles);
        if(!!styles['position']){
            var position = styles['position'];
            switch(position){
                case 'relative':
                styles['margin-left'] = styles.x;
                styles['marginTop'] = styles.y;
                    break;
                case 'absolute':
                case 'fixed':
                    styles['absolute'] = 'absolute';
                    if(styles.xalign=='left'){
                        styles['left'] = styles.x;
                    }
                    else if(styles.xalign=='right'){
                        styles['right'] = -parseInt(styles.x)+'px';
                        styles['left'] = 'auto';
                    }
                    else if(styles.xalign=='center'){
                        styles['margin-left'] = styles.x;
                        styles['left'] = '50%';
                    }

                    if(styles.yalign=='top'){
                        styles['top'] = this.styles.y;
                    }
                    else if(styles.yalign=='center'){
                        styles['margin-top'] = this.styles.y;
                        styles['top'] = '50%';
                    }
                    else if(styles.yalign=='bottom'){
                        styles['bottom'] = -parseInt(this.styles.y)+'px';
                    }

            }
            for(var i in styles){
                if(!isNaN(styles[i])){
                    if(i=='left'||i=='top'||i=='width'||i=='height')
                    styles[i] = styles[i]+'px';
                }
            }
            return styles;
        }
    }
    getVueNode(){
        return this.vuenode;
    }
    render(createElement, canvas) {
        var self = this;
        var styles = this.getStyles();
        this.vuenode = createElement(
            "vnoderender",
            {
                style: styles,
                props: {
                    viewdata: this.view,
                    viewprops:this.props,
                    ismouseDown:canvas.isdmousedown,
                    isoptioning:!!this.isoptioning
                },
                attrs: {
                    class:this.props.className||"",
                    id: this.domid
                },
                nativeOn: {
                    click: function(event) {
                        canvas.changeCurVnode(self);
                        //canvas.changeCurParent(this);
                        event.cancelBubble = true;
                    },
                    mousedown: function(event) {
                        if(self.view=='root'){
                            return;
                        }
                        canvas.changeCurVnode(self);
                        //canvas.changeCurParent(this);
                        canvas.mouseDown(event, self);
                        event.cancelBubble = true;
                    }
                }
            },
            this.childrens.map(function(currentValue) {
                return currentValue.render(createElement, canvas);
            })
        );
        
        this.vuenode.viewname = this.name;
        return this.vuenode;
    }
}
export { vnode };
