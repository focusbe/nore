// function getPages() {
    var pages = require.context("./", true, /\.vue$/);
    var pagerouter = [];
    var pageUrls = [];
    pages.keys().map(key => {
        let path = key.replace(".vue", "").replace('./','');
        let pathname = path.replace("/", "_");
        if (pathname.indexOf("public") == 0 || pathname.indexOf("app") == 0) {
            return;
        }
        pageUrls.push({
            name: pathname,
            path: path
        });
        pagerouter.push({
            name: pathname,
            path: path,
            ismenue: true,
            component: pages(key).default
        });
        // pagerouter.push({
        //     name: pathname + "_withparam",
        //     path: path + "/(.*)",
        //     ismenue: false,
        //     component: pages(key)
        // });
    });
    export default { pagerouter, pageUrls };
// }


