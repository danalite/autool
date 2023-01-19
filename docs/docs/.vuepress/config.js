module.exports = {
  title: 'AuTool',
  description: 'Next generation workflow automation tool',
  base: '/autoo/',
  themeConfig: {
    themeColor: {
      blue: "#2196f3",
      red: "#2196f3",
      green: "#2196f3",
      orange: "#2196f3",
    },
    logo: '/images/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Samples', link: '/dev/' },
    ],
    sidebar: [
      {
        title: 'Getting Started',
        path: '/guide/',
      },
      {
        title: 'API',
        path: '/api/',
      },
      {
        title: 'Samples',
        path: '/dev/',
        children: [
          {title: 'Samples', path: '/dev/'},
          {title: 'MacOS workspace', path:'/dev/macos-workspace'},
        ]
      },
      {
        title: 'Help',
        path: '/run/',
        collapsable: false,
        sidebarDepth: 2,
      }
    ],

    repo: 'https://github.com/danalites/autoo',
    repoLabel: 'Github',
    // editLinks: true,
    // editLinkText: 'Edit this page'
  },
}
