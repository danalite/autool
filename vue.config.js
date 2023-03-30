const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: './',
  pages: {
    index: {
      entry: 'src/render/main.js'
    }
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compilerOptions = {
          isCustomElement: tag => tag == 'webview'
        }
        return options
      })
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "AuTool",
        appId: "com.autool.app",
        copyright: "Danalite PTE LTD",
        extraResources: [
          { from: './imgs', to: './imgs' },
          { from: './dist/app', to: './backend' }],
        directories: {
          output: "release/"
        },
        mac: {
          target: ['dmg'],
          icon: './imgs/logo.png',
          asar: true
        },
        win: {
          icon: "./imgs/logo.png",
          target: [
            "portable"
          ]
        },
        linux: {
          icon: "./imgs/logo.png",
          publish: ["github"],
          target: ["deb"]
        },
        nsis: {
          runAfterFinish: false,
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true
        },
        protocols: {
          name: "AuTool",
          schemes: ["autool"]
        },
        publish: ['github']
      },
    },
  },
})
