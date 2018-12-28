function Position(x,y){
    this.x = x;
    this.y = y;
}
Position.prototype = {
    add:function(obj){
        this.x+=obj.x;
        this.y+=obj.y;
        return this;
    },
    sub:function(obj){
        this.x-=obj.x;
        this.y-=obj.y;
        return this;
    }
}

export {Position}