<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>${page.title}</title>
    <meta name="keywords" content="${page.keywords}" />
    <meta name="description" content="${page.desc}" />
    <meta name="viewport" content="width=750,user-scalable=no,target-densitydpi=375, viewport-fit=cover">
    <meta name="format-detection" content="telephone=no">
    <link rel="stylesheet" href="${page.maincss}">
    $${page.header}
</head>

<body>
    <div id="app">
        $${page.html}
    </div>
</body>
<script src="https://cdnsapi.ztgame.com/site/js/require.js"></script>
<script src="${page.mainjs}"></script>
$${page.footer}
</html>