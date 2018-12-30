class TEST {
    constructor() {

    }
    private a = 1;
    protected bbb = 2;
}
class Child extends TEST {
    constructor() {
        super();
    }
}
const child = new Child();
export default TEST;