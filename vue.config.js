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
          { from: './dist/app', to: './runtime' }],
        directories: {
          output: "release/"
        },
        artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
        mac: {
          target: ['dmg', 'zip'],
          icon: './imgs/logo-medium.png',
          asar: true
        },
        win: {
          icon: "./imgs/logo-medium.png",
          target: [
            "portable", 'zip'
          ]
        },
        linux: {
          icon: "./imgs/logo-medium.png",
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
