<template>
    <div class="work_area">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</template>
<style lang="scss">
.work_area {
    position: static;

    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    width: 0;
    height: 0;
    overflow: visible;
    border: 1px solid rgb(0, 0, 0);
    div {
        position: absolute;
        width: 4px;
        height: 4px;
        background-color: transparent;
        border: 1px solid rgb(0, 0, 0);
    }
    div:nth-child(0) {
        right: 0;
        top: 50%;
        margin-top: -2px;
    }
    div:nth-child(1) {
        right: 0;
        top: 0;
    }
    div:nth-child(2) {
        left: 50%;
        margin-left: -2px;
        top: 0;
    }
    div:nth-child(3) {
        left: 0;
        top: 50%;
        margin-top: -2px;
    }
    div:nth-child(4) {
        right: 0;
        top: 50%;
        margin-top: -2px;
    }
    div:nth-child(7) {
        left: 0;
        bottom: 0;
    }
    div:nth-child(5) {
        right: 0;
        bottom: 0;
    }
    div:nth-child(6) {
        left: 50%;
        margin-left: -2px;
        bottom: 0;
    }
}
</style>

<script>
export default {
    name:'worksapce',
    props: {
        styles: {
            type: String,
            require: true
        },
        title: {
            type: String,
            require: true
        },
        optionsValue: {
            type: Object,
            require: true,
            default: null
        },
        options: {
            type: Object,
            require: true
        }
    },
    created: function() {
        //this.getOptionsValue();
    },
    data: function() {
        return {
            //optionsValue: {}
        };
    },
    render: function() {},
    mounted: function() {
        //alert(1);
    },
    updated: function() {},
    watch: {},
    methods: {
        onOptionChange: function(key, value) {
            if (typeof value == "object") {
                value = value.target.value;
            }
            this.$emit("onChange", this.$props.optionsValue);
        }
    }
};
</script>