import {defineConfig} from 'vitepress'

export default defineConfig({
  title: "Aether Documentation",
  description: "The AREA project",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api' },
    ],

    sidebar: [
      {
        text: 'API',
        items: [
          { text: 'Introduction', link: '/api' },
          { text: 'Manifest', link: '/api/manifest' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: '' }
    ]
  }
})
