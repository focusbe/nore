var trackCodeStr = {
    cnzz: `
    <script type="text/javascript">var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");document.write(unescape("%3Cspan id='cnzz_stat_icon_{__TRACKID__}'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "w.cnzz.com/c.php%3Fid%3D{__TRACKID__}' type='text/javascript'%3E%3C/script%3E"));</script>
    `,
    baidu: `
    <script>
        var _hmt = _hmt || [];
        (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?{__TRACKID__}";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
        })();
    </script>
    `,
    giant: `
    <script type="text/javascript">
        var _gadate = new Date().getTime();
        var _maq = _maq || [];
        var _gatype  = {__TRACKID__}; 
        _maq.push(['_setAccount', _gatype]);
        (function() {
            var ma = document.createElement('script'); ma.type = 'text/javascript'; ma.async = true;
            ma.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'gaanalytics.ztgame.com/analytics.js?'+_gadate;
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ma, s);
        })();
    </script>`,
    googlega: `
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', '{__TRACKID__}', 'auto');ga('send', 'pageview');
    </script>
    `,
    googletm: [
        {
            tag: "head",
            position: "before",
            code: `<!-- Google Tag Manager -->
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{__TRACKID__}');</script>
            <!-- End Google Tag Manager -->
            `
        },
        {
            tag: "body",
            position: "after",
            code: `<!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={__TRACKID__}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
            `
        }
    ]
};
import Games from './games';
class TrackCode {
    static async getCode(gamename) {
        if (!gamename) {
            return false;
        }
        var gameinfo = await Games.getGame(gamename);
        console.log(gameinfo);
        if(!gameinfo||!gameinfo['trackcode']){
            return false;
        }
        let trackIds = gameinfo["trackcode"];
        if (!!gameinfo["gatype"]) {
            trackIds["giant"] = gameinfo["gatype"];
        }
        var curCodeStr;
        var codeObj = [];
        for (var i in trackIds) {
            if (!!trackIds[i] && trackCodeStr[i]) {
                curCodeStr = trackCodeStr[i];
                if (typeof curCodeStr == "string") {
                    codeObj.push({
                        tag: "head",
                        position: "before",
                        code: curCodeStr.replace(/\{__TRACKID__\}/g, trackIds[i])
                    });
                } else {
                    for (var j in curCodeStr) {
                        let curcodeobj = Object.assign({}, curCodeStr[j]);
                        curcodeobj.code = curcodeobj.code.replace(/\{__TRACKID__\}/g, trackIds[i]);
                        codeObj.push(curcodeobj);
                    }
                }
            }
        }
        var resCode = [];
        for (var i in codeObj) {
            let curRes = null;
            for (var j in resCode) {
                if (resCode[j].tag == codeObj[i].tag && resCode[j].position == codeObj[i].position) {
                    curRes = resCode[j];
                    curRes.code += codeObj[i].code;
                    break;
                }
            }
            if (!curRes) {
                curRes = Object.assign({}, codeObj[i]);
                resCode.push(curRes);
            }
        }
        return resCode;
    }
}
export default TrackCode;
