<template>
    <div class="options_section">
        <ul v-if="optionsValue" class="form_ul">
            <h2>{{title}}</h2>
            <li v-for="(item,key) in options" v-bind:key="item.name" v-if="shouldShow(item)&&typeof(optionsValue[key])!='undefined'&&item.type!='hidden'">
                <label for="">{{item.label}}：</label>
                <Select @on-change="(value) => onOptionChange(key,value)" style="width:160px" size="small" v-if="item.type=='select'" v-model="optionsValue[key]">
                    <Option v-for="value in item.values" :value="value.value" :key="value.value">{{value.label}}</Option>
                </Select>
                <Input  @on-change="(value) => onOptionChange(key,value)" v-model="optionsValue[key]" style="width:160px" v-if="item.type!='select'" type="text" size="small"></Input>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        optionName: {
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
    updated: function() {

    },
    watch: {

    },
    methods: {
        shouldShow(item){
            if(typeof(item.show)=='undefined'){
                return true;
            }
            if(!!item.show){
                item.show = item.show.replace('STYLES','this.optionsValue');
                var result;
                try {
                    result = eval(item.show);
                    // console.log(this.optionsValue);
                    // console.log(item.show);
                } catch (error) {
                    return false;
                }
                return result;
            }
            return true;
        }, 
        onOptionChange: function(key, value) {
            if (typeof value == "object") {
                value = value.target.value;
            }
            this.$emit("onChange", this.$props.optionsValue);
        }
    }
};
</script>

