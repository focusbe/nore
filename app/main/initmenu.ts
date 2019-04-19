const electron = require("electron");
const Menu = electron.Menu;
import WinManager from "./winmanager";
function setAppMenu(app: any) {
    var self = this;
    let template: any;
    template = [
        {
            label: "编辑",
            submenu: [
                {
                    label: "撤销",
                    accelerator: "CmdOrCtrl+Z",
                    selector: "undo:"
                },
                {
                    label: "重做",
                    accelerator: "Shift+CmdOrCtrl+Z",
                    selector: "redo:"
                },
                {
                    type: "separator"
                },
                {
                    label: "剪切",
                    accelerator: "CmdOrCtrl+X",
                    selector: "cut:"
                },
                {
                    label: "复制",
                    accelerator: "CmdOrCtrl+C",
                    selector: "copy:"
                },
                {
                    label: "粘贴",
                    accelerator: "CmdOrCtrl+V",
                    selector: "paste:"
                },
                {
                    label: "全选",
                    accelerator: "CmdOrCtrl+A",
                    selector: "selectAll:"
                }
            ]
        },
        {
            label: "视图",
            submenu: [
                {
                    label: "刷新",
                    role: "reload"
                },
                {
                    label: "强制刷新",
                    role: "forcereload"
                },
                {
                    label: "开发者工具",
                    role: "toggledevtools"
                },
                {
                    type: "separator"
                },
                {
                    label: "重置缩放",
                    role: "resetzoom"
                },
                {
                    label: "缩小",
                    role: "zoomin"
                },
                {
                    label: "放大",
                    role: "zoomout"
                },
                {
                    type: "separator"
                },
                {
                    label: "全屏",
                    role: "togglefullscreen"
                }
            ]
        },
        {
            label: "窗口",
            role: "window",
            submenu: [
                {
                    lable: "最小化",
                    role: "minimize"
                },
                {
                    lable: "关闭",
                    role: "close"
                }
            ]
        },
        {
            label: "帮助",
            role: "learn more",
            submenu: [
                {
                    label: "关于",
                    click() {
                        require("electron").shell.openExternal(
                            "http://norecode.com"
                        );
                    }
                }
            ]
        },
        {
            label: "设置",
            role: "learn more",
            submenu: [
                {
                    label: "配置环境",
                    click() {
                        WinManager.newwindow("config_edit", '', {
                            width:500,
                            height:450,
                            hash: "#/configs/edit"
                        });
                    }
                }
            ]
        }
    ];

    if (process.platform === "darwin") {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: "配置环境",
                    click() {
                        WinManager.newwindow("config_edit", '', {
                            width:500,
                            height:450,
                            frame:false,
                            hash: "#/configs/edit"
                        });
                    }
                },
                {
                    label: "关于",
                    role: "about"
                },
                {
                    type: "separator"
                },
                {
                    label: "服务",
                    role: "services",
                    submenu: []
                },
                {
                    type: "separator"
                },
                {
                    label: "隐藏",
                    role: "hide"
                },
                {
                    label: "隐藏其他",
                    role: "hideothers"
                },
                {
                    label: "显示",
                    role: "unhide"
                },
                {
                    type: "separator"
                },
                {
                    label: "退出",
                    role: "quit"
                }
            ]
        });

        // Edit menu
        template[1].submenu.push(
            {
                type: "separator"
            },
            {
                label: "语音助手",
                submenu: [
                    {
                        label: "开启语音",
                        role: "startspeaking"
                    },
                    {
                        label: "关闭语音",
                        role: "stopspeaking"
                    }
                ]
            }
        );

        // Window menu
        template[3].submenu = [
            {
                label: "关闭",
                role: "close"
            },
            {
                label: "最小化",
                role: "minimize"
            },
            {
                label: "缩放",
                role: "zoom"
            },
            {
                type: "separator"
            },
            {
                label: "置顶",
                role: "front"
            }
        ];
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
export default setAppMenu;