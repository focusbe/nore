const inarar = __dirname.indexOf("app.asar") > -1;
const DEBUG = !inarar;
const isproduct = inarar;
let homepath = process.env.HOME || "/";
let configFolder = homepath + inarar ? ".norecode" : ".norecode_dev";
export { inarar, DEBUG, isproduct, configFolder };
