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

export default aRemote