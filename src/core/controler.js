class Controler{
    constructor(){
        this.triger = [];
        this.method = [];
    }
}

class Callback{
    constructor(){
        
    }
}

class Method{
    constructor(){
        this.desc="默认方法描述,请重写";
    }
    callback(){
        
    }
    runner(arrs){
        this.callback();
    }
}

class Triger{
    constructor(){
        
    }
};

export {Controler,Callback,Method}