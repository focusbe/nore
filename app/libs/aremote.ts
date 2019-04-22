class aRemote{
    static require(lib){
        var handler = {
            get(target, key, proxy){
                
            }
        }
        var libobject = new Proxy({},handler);
        return libobject;
    }
}
class aRemoteMain{
    private static instance:aRemoteMain
    static getInstance(): aRemoteMain {
        if (!aRemoteMain.instance) {
            aRemoteMain.instance = new aRemoteMain()
        }
        return this.instance
    }
    constructor(){
        
    }
}
export default aRemote