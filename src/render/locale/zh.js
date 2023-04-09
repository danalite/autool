const ChineseOptions = {
    apps: {
        title: '应用',
        emptyText: '没有应用，请点击 + 添加',
        app: {
            edit: '编辑应用',
            newTask: '新建任务',
            update: '更新应用',
            delete: '删除应用',
        },
        task: {
            edit: '编辑任务',
            debug: '任务记录',
            delete: '删除任务',
            rerun: '重新运行',
        },
        newApp: {
            title: '新建应用',
            download: '下载应用',
            blank: '空白应用',
            official: '社区应用',
            appName: '应用名称',
            appIcon: '应用图标',
            appLink: '应用链接',
        },
        newTask: {
            title: '添加任务到',
            taskName: '任务名称',
            taskType: '任务类型',
            taskTemplate: '模板任务',
            macroRecorder: '宏录制器',
            mouseAndKeyboard: '录制鼠标点击+键盘',
            mouseMove: '录制鼠标移动',
            mouseClickImage: '鼠标点击时，提取图标',
            timeDelay: '记录延时',
        },
        common: {
            cancel: '取消',
            ok: '确认',
            clear: '清空',
            stop: '停止',
            save: '保存',
            reset: '重置',
        }
    },
    scheduler: {
        title: '任务管理',
        active: {
            title: '运行中',
            emptyText: '没有运行中的任务',
        },
        later: {
            title: '稍后运行',
        },
        hotkey: {
            title: '快捷键',
        },
        stopped: {
            title: '已停止',
        },
        events: {
            title: '事件',
        }
    },
    settings: {
        title: "设置",
        accounts: {
            title: '用户',
            license: '授权密钥',
            appHome: '插件目录',
            language: '显示语言'
        },

        services: {
            title: '服务',
            taskServer: {
                title: '任务运行',
                local: '本地服务',
                remote: '远程服务',
            },

            EventSource: {
                title: '消息源',
            },

        },

        helpers: {
            title: '书签窗口',
            placeholderName: '名称',
            placeholderUrl: '网址',
        },

        subscriptions: {
            title: '消息订阅'
        },

        envs: {
            title: '环境变量',
        }
    },
}

export default ChineseOptions