class Util{
	static isPath(str){
		
		if(typeof(str)=='string'&&str.indexOf('/')>-1&&str.indexOf('.')>-1&&str.indexOf('//')==-1)
		{
			return true;
		}
		return false;
	}
}
export default Util