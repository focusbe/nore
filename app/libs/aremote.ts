class aRemote{
    static require(lib){
        var libobject = require(lib);
        var handler = {
            get(target, key, proxy){

            }
        }
        libobject = new Proxy(libobject,handler);
        return libobject;
    }
}
export default aRemote