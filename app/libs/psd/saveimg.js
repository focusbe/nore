class saveImg{
    constructor(){
        this.pool = [];
        this.oldLength = this.pool.length;

        this.timeout = 3000;
    }
    addimg(imgObj){
        if(!imgObj){
            return;
        }

        this.pool.push(imgObj);
    }
    _checkAndSave(){
        
    }
}
