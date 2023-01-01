## Download (Desktop)

* [MacOS](https://juejin.cn/post/6844903886541553672)
* [Window](https://juejin.cn/post/6892790243687137287)


## Add new scripts
- Click the "+" button next to the search box to download the script from GitHub to local disk
- AuTool reads the `tasks.json` file in the root directory of the repository to get the script information
- Example: downloading

## Settings
### Activate license
支持拼音和缩写来搜索系统安装应用：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba363e8f60f540e6a5c365c4317c4413~tplv-k3u1fbpfcp-watermark.image)

### 2. UI类插件安装
点击搜索框右侧 `rubick` 图标，进入插件市场，选择所需插件，点击下载按钮即可下载，下载完成后在已安装 tab 下可以找到安装插件。
安装完成后，输入插件呼起命令即可使用对应插件：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ae45c7ede1f4e3bb7d35ae845e60b64~tplv-k3u1fbpfcp-watermark.image)

### 3. 系统类插件安装
系统插件安装方式和UI类一样，在插件市场选择`系统分类`，寻找适合自己的系统插件安装即可。
::: danger
系统插件安装成功后，需要重启 `rubick` 才能生效
:::

### 4. 输入框聚焦自动根据剪切板内容匹配插件
在 `rubick` 内搜索`偏好设置`，然后开启`自动粘贴` 功能，即可匹配剪切板内容自动匹配适合插件进行使用。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01ef50fbfa064ba9a88bebe1531eacd4~tplv-k3u1fbpfcp-watermark.image)

### 内网部署
::: tip
如果把插件发布到公网 `npm` 如果不符合您的公司安全要求，`rubick` 支持内网私有源和私有插件库，如果您需要内网部署使用，可以自行配置以下规则。
:::
`rubick` 依赖 `npm` 仓库做插件管理，依赖 `gitcode` 做插件数据存储，所以如果要进行内网部署，主要需要替换这2个设置。详细设置：
`插件市场 -> 设置 -> 内网部署设置`

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1319b177fb544017ae10b4a703e8efa6~tplv-k3u1fbpfcp-watermark.image?)

#### 1. 替换 npm 源
插件发布到私有 `npm` 源即可。

#### 2. 替换 `gitcode` 源为内网 `gitlab`: database url

* clone 下载 rubick 插件库：[https://gitcode.net/rubickcenter/rubick-database](https://gitcode.net/rubickcenter/rubick-database)
* 提交仓库到私有 `gitlab` 库。

替换格式：`https://gitlab.xxx.com/api/v4/projects/{projectId}/repository/files/` 。因为接口为 `gitlab openAPI`，所以需要填写仓库 `access_token`


### 更多功能
如果您还需要更多功能，欢迎来这里给我们提建议：[issues](https://github.com/rubickCenter/rubick/issues) 。
有价值的想法我们会加入到后期的开发当中。同时也欢迎一起加入共建。

