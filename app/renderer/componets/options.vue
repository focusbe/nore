<template>
    <div class="options_section">
        <ul v-if="optionsValue" class="form_ul">
            <h2>{{title}}</h2>
            <li v-for="(item,key) in options" v-bind:key="item.name" v-if="typeof optionsValue[key] !='undefined'">
                <label for="">{{item.label}}：</label>
                <Select @on-change="(value) => onOptionChange(key,value)" style="width:160px" size="small" v-if="item.type=='select'" v-model="optionsValue[key]">
                    <Option v-for="value in item.values" :value="value.value" :key="value.value">{{value.label}}</Option>
                </Select>
                <!-- <ul v-if="item.type=='array'">
                    <Input v-for="(curvalue,curindex) in item" @on-change="(value) => onOptionChange(key,curindex,value)" v-model="optionsValue[key][curindex]" style="width:160px" v-else type="text" size="small"></Input>
                </ul> -->
                <Input  @on-change="(value) => onOptionChange(key,value)" v-model="optionsValue[key]" style="width:160px" v-else type="text" size="small"></Input>
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
        for(var i in this.options){
            // console.log(i);
            // console.log(this.options);
        }
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
        for(var i in this.options){
            // console.log(i);
            // console.log(this.options[i]);
        }
    },
    watch: {

    },
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

