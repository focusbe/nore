class Point {
    public x:number = 0;
    public y:number = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    public addSize(size: Size) {
        var newPoint = new Point(this.x + size.width, this.y + size.height);
        return newPoint;
    }
    public static relative(point1: Point, point2: Point) {
        var newPoint = new Point(point1.x - point2.x, point1.y - point2.y);
        return newPoint;
    }
    public static getSize(point1: Point, point2: Point){
        var size = new Size(point2.x - point1.x, point2.y - point1.y);
        return size;
    }
    public static min(point1: Point, point2: Point){
        let tempoint = new Point(Math.min(point1.x,point2.x),Math.min(point1.y,point2.y));
        return tempoint;
    }
    public static max(point1: Point, point2: Point){
        let tempoint = new Point(Math.max(point1.x,point2.x),Math.max(point1.y,point2.y));
        return tempoint;
    }
}
class Size {
    public width:number = 0;
    public height:number = 0;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Rectangle {
    public startPoint: Point;
    public size: Size;
    public endPoint: Point;
    constructor(x, y = null, width = null, height = null) {
        if(typeof x =='object'&&!y){
            //从样式初始化
            this.startPoint = new Point(x.left,x.top);
            this.size = new Size(x.width,x.height);
            this.endPoint = this.startPoint.addSize(this.size);
        }
        else if(x instanceof Point&&y instanceof Point){
            //从初始位置和结束位置初始化
            this.size = Point.getSize(x,y);
            this.startPoint = x;
            this.endPoint = y;
        }
        else if(x instanceof Point && y instanceof Size){
            //从初始位置和大小
            this.size = y;
            this.startPoint = x;
            this.endPoint = this.startPoint.addSize(y);
        }
        else{
            //从初始位置和大小
            this.startPoint = new Point(x, y);
            this.size = new Size(width, height);
            this.endPoint = this.startPoint.addSize(this.size);
        }
        
    }
    public toStyles(){
        return {
            width:this.size.width,
            height:this.size.height,
            left:this.startPoint.x,
            top:this.startPoint.y
        }
    }
    public static intersection(rec1: Rectangle,rec2: Rectangle) {
        let start = Point.max(rec1.startPoint,rec2.startPoint);
        let end = Point.min(rec1.endPoint,rec2.endPoint);
        let newrec = new Rectangle(start,end);
        return newrec;
    }
}

export {Point,Size,Rectangle}