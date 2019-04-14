import viewList from "../elements/list.js";
import Vue from "vue";
import workspace from "./workspace.vue";
import $ from "jquery";
import Util from "../../libs/util";
import path from "path"
Vue.component("vnoderender", {
    methods: {},
    template: '<component :is="component" :viewprops="viewprops" :viewdata="viewdata" v-if="component"><slot></slot><workspace v-if="isoptioning"></workspace></component>',
    components: {
        // <my-component> 将只在父组件模板中可用
        'workspace': workspace
    },

    created() {
        this.component = this.createCom();
    },
    mounted: function () {
        if (this.ismouseDown) {
            return;
        }
        var viewdata = this.viewdata;

        this.viewdata.onRendered({
            dom: this.$el,
            props: this.viewprops
        });
    },
    updated: function () {
        if (this.ismouseDown) {
            return;
        }
        //this.component = this.createCom();
        var viewdata = this.viewdata;
        this.viewdata.onRendered({
            dom: this.$el,
            props: this.viewprops
        });
    },
    data() {
        return {
            component: null,
            componentCache: {}
        }
    },

    methods: {
        getDom() {
            return this.$el;
        },
        createCom() {
            var self = this;
            if (!!this.componentCache[this.viewdata.name]) {
                return this.componentCache[this.viewdata.name];
            }
            let temCom;
            var rendered = this.viewdata.render({
                props: this.viewprops
            });

            if (!!this.viewdata.template || typeof (rendered) == 'string') {
                let template;
                if (!!this.viewdata.template) {
                    template = this.viewdata.template;
                } else {
                    template = rendered;
                }
                temCom = Vue.extend({
                    created: function () {
                        //console.log(this);
                    },
                    props: {
                        viewprops: null
                    },
                    template: template
                });
            } else {
                temCom = Vue.extend({
                    created: function () {
                        //console.log(this);
                    },
                    components: {
                        // <my-component> 将只在父组件模板中可用
                        'workspace': workspace
                    },
                    props: {
                        viewdata: null,
                        viewprops: null
                    },
                    render: function (createElement) {
                        if (!this.viewdata) {
                            return null;
                        }
                        var slots = [self.$slots.default];
                        if (!!self.isoptioning) {
                            slots.push(createElement('workspace'));
                        }
                        return createElement(
                            this.viewdata.tagName,
                            this.viewdata.render({
                                props: this.viewprops
                            }),
                            slots
                        );
                    }
                });
            }
            this.componentCache[this.viewdata.name] = temCom;
            // let renderres = this.viewdata.render();
            return temCom;
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
        isoptioning: {
            type: Boolean
        },
        viewprops: {
            type: Object
        }
    }
});

class vnode {
    constructor(viewname, styles, props, isssr, assetUrl) {
        if (!viewname) {
            return;
        }
        if (!props) {
            props = {};
        }
        if (!viewList[viewname]) {
            props.tagName = viewname;
            viewname = 'htmltag'
        }

        this.name = viewname;
        // if (view == 'root') {
        //     this.name = 'root';
        // }
        // this.view = view;
        if (!props.id) {
            props.id = 'vnode_' + (Util.createId());
        }
        this.styles = styles;
        this.props = props;
        this.childrens = [];
        this.parent = undefined;
        this.isoptioning = false;
        this.isssr = isssr;
        if (!!assetUrl && assetUrl[assetUrl.length - 1] != '/') {
            assetUrl += '/';
        }
        this.assetUrl = assetUrl;
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
    init() {
        if (!this.styles) {
            this.styles = {};
        }
        if (!this.props) {
            this.props = {};
        }
        var styles = {};
        var props = {};
        var curView = viewList[this.name];
        // if (this.isssr) {
        //     this.styles = {};
        // } else {
        for (var i in curView.styles) {
            if (typeof (curView.styles[i]['default']) == 'undefined') {
                curView.styles[i]['default'] = null;
            }
            styles[i] = curView.styles[i]['default'];
        }

        for (var i in curView.props) {
            if (typeof (curView.props[i]['default']) == 'undefined') {
                curView.props[i]['default'] = null;
            }
            props[i] = curView.props[i]['default'];
        }
        this.styles = Object.assign(styles, this.styles);
        // }

        this.props = Object.assign(props, this.props);
    }
    changeStyles(styles) {
        this.styles = styles;
    }
    changeProps(props) {
        this.props = props;
    }
    toJson() {
        var curJson = {};
        var curView;
        console.log(this);

        if (!this.name) {
            return null;
        }
        curView = viewList[this.name];
        if (!curView) {
            return;
        }
        //if (typeof (this.view) == 'string') {
        //     curJson.view = this.view;
        //     curView = viewList[this.view];
        // } else {
        //     curJson.view = this.view.name;
        //     curView = this.view;
        // }
        curJson.view = this.name;
        var curStyle = this.quchong('styles');
        if (!!curStyle) {
            curJson.styles = curStyle;
        }
        var curProps = this.quchong('props');
        if (!!curProps) {
            curJson.props = curProps;
        }
        curJson.childrens = [];
        for (var i in this.childrens) {
            curJson.childrens.push(this.childrens[i].toJson());
        }
        return curJson;
    }
    quchong(prop) {
        var curView;
        //if (typeof (this.view) == 'string') {
        if(!this.name)
        curView = viewList[this.name];
        // } else {
        //     curView = this.view;
        // }
        var res = null;
        for (var i in this[prop]) {
            if (typeof (curView[prop][i]) != 'undefined' && typeof (curView[prop][i].default) != 'undefined') {
                if (this[prop][i] !== curView[prop][i].default) {
                    if (!res) {
                        res = {};
                    }
                    res[i] = this[prop][i];
                }
            } else {
                if (!res) {
                    res = {};
                }
                res[i] = this[prop][i];
            }
        }
        return res;
    }

    getModulslist(modulelist) {
        if (!modulelist) {
            modulelist = [];
        }
        var curView = this.getView();
        if(!curView){
            return modulelist;
        }
        //console.log(modulelist.indexOf(this.view.filepath));
        if (!!curView && curView.filename && modulelist.indexOf(this.name) < 0) {
            modulelist.push(this.view.filename);
        }
        for (var i in this.childrens) {
            this.childrens[i].getModulslist(modulelist);
        }
        return modulelist;
    }
    getView(){
        if(!this.name){
            return false;
        }
        if(!!viewList[this.name]){
            return viewList[this.name];
        }
        return false
    }
    getStyles() {
        var styles = Object.assign({}, this.styles);
        if (!!styles['position']) {
            var position = styles['position'];
            switch (position) {
                case 'relative':
                    styles['marginTop'] = styles.y;
                    if (styles.xalign == 'left') {
                        styles['margin-left'] = styles.x;
                    } else if (styles.xalign == 'right') {
                        styles['margin-right'] = -parseInt(styles.x) + 'px';
                    } else if (styles.xalign == 'center') {
                        styles['margin-left'] = parseInt(styles.x) - styles.width / 2 + 'px';
                        styles['left'] = '50%';
                    }
                    break;
                case 'absolute':
                case 'fixed':
                    if (this.isssr) {
                        styles['position'] = 'absolute';
                    }
                    if (styles.xalign == 'left') {
                        styles['left'] = styles.x;
                    } else if (styles.xalign == 'right') {
                        styles['right'] = -parseInt(styles.x) + 'px';
                        styles['left'] = 'auto';
                    } else if (styles.xalign == 'center') {
                        styles['margin-left'] = parseInt(styles.x) - styles.width / 2 + 'px';
                        styles['left'] = '50%';
                    }

                    if (styles.yalign == 'top') {
                        styles['top'] = this.styles.y;
                    } else if (styles.yalign == 'center') {
                        styles['margin-top'] = parseInt(styles.y) - styles.height / 2 + 'px';
                        styles['top'] = '50%';
                    } else if (styles.yalign == 'bottom') {
                        styles['bottom'] = -parseInt(this.styles.y) + 'px';
                    }

            }
            for (var i in styles) {
                if (i == 'x' || i == 'y' || i == 'xalign' || i == 'yalign') {
                    delete styles[i];
                }
                if (!!this.assetUrl) {
                    if (Util.isPath(styles[i])) {

                        styles[i] = this.assetUrl + styles[i];
                    }
                }
                if (!isNaN(styles[i])) {
                    if (i == 'left' || i == 'top' || i == 'width' || i == 'height')
                        styles[i] = styles[i] + 'px';
                }
            }
            return styles;
        }
    }
    getProps() {
        var props = Object.assign({}, this.props);
        if (!!this.assetUrl) {
            for (var i in props) {
                if (!!this.assetUrl) {
                    if (Util.isPath(props[i])) {
                        props[i] = this.assetUrl + props[i];

                    }
                }
            }
        }

        return props;
    }
    getVueNode() {
        return this.vuenode;
    }
    render(createElement, canvas) {
        var self = this;
        var styles = this.getStyles();
        var viewprops = this.getProps();

        if (!this.view) {
            return null;
        }

        if (!this.props) {
            this.props = {};
        }
        this.vuenode = createElement(
            "vnoderender", {
                style: styles,
                props: {
                    viewdata: this.view,
                    viewprops: viewprops,
                    ismouseDown: canvas.isdmousedown,
                    isoptioning: !!this.isoptioning
                },
                attrs: {
                    class: (this.props.class || "") + ' vnodeDom',
                    id: this.props.id
                },
                nativeOn: {
                    click: function (event) {
                        canvas.changeCurVnode(self);
                        //canvas.changeCurParent(this);
                        event.cancelBubble = true;
                    },
                    mousedown: function (event) {
                        if (self.view == 'root' || self.view.name == 'root') {
                            return;
                        }
                        canvas.changeCurVnode(self);
                        //canvas.changeCurParent(this);
                        canvas.mouseDown(event, self);
                        event.cancelBubble = true;
                    }
                }
            },
            this.childrens.map(function (currentValue) {
                return currentValue.render(createElement, canvas);
            })
        );

        this.vuenode.viewname = this.name;
        return this.vuenode;
    }
}
export {
    vnode
};