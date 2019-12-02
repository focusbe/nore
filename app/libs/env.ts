const inarar = __dirname.indexOf("app.asar") > -1;
const path = require("path");
const DEBUG = !inarar;
const isproduct = inarar;
let homepath = process.env.HOME || "/";
let configFolder = path.resolve(homepath, inarar ? ".norecode" : ".norecode_dev");
export { inarar, DEBUG, isproduct, configFolder };
