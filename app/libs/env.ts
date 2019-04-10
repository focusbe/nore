const inarar = __dirname.indexOf("app.asar") > -1;
const DEBUG = !inarar;
const isproduct = inarar;
export {inarar,DEBUG,isproduct}