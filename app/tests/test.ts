import { Project, Projects, Page } from '../libs/project';
var project = new Project('test');
async function main(){
    await project.whoIsLatest('index');
}
main();
