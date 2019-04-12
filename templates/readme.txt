package.json 文件是模板的信息文件 格式如下：
{
    "name":"",
    "desc":"",
    "author":"",
    "version": "",
    "description": "",
}


html.tpl 是模板的html部分
变量解释如下：
*请注意 变量为一个$ 包含html标签为两个$;
${page.title} => 页面标题
${page.keywords} => 页面关键词
${page.desc}=>页面描述
${page.mainjs}=>页面的js
${page.mainjs}=>页面的css

$${page.tree}=>页面的树形结构
$${page.html}=>页面的html

assets 中可放 公共的js 和scss文件
可自动引入到 mainjs 和maincss文件中