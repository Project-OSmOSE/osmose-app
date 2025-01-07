import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "APLOSE",
  description: "A web-based annotation plateform developed by and for Marine Passive Acoustic Monitoring researchers",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'User', link: '/user' },
      { text: 'Developer', link: '/dev' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    // https://vitepress.dev/reference/default-theme-sidebar
    sidebar: {
      '/user': [
        {
          text: 'User',
          items: [
            { text: 'Access APLOSE', link: '/user/' },
            { text: 'Annotation campaign', link: '/user/campaign' },
            { text: 'Annotation', link: '/user/annotator' },
            {
              text: 'Campaign creator',
              items: [
                { text: 'Import a dataset', link: '/user/campaign-creator/import-dataset' },
                { text: 'Create a campaign', link: '/user/campaign-creator/create-campaign' },
                { text: 'Manage a campaign', link: '/user/campaign-creator/manage-campaign' },
                { text: 'Export results', link: '/user/campaign-creator/export-results' },
              ]
            },
            {
              text: 'Administrator',
              items: [
                { text: 'Administration presentation', link: '/user/administrator/presentation' },
                { text: 'Manage users', link: '/user/administrator/manage-users' },
              ]
            }
          ],
        },
      ],
      '/dev': [
        {
          text: 'Developer',
          items: [
            { text: 'Presentation', link: '/dev/' },
            {
              text: 'Installation',
              items: [
                { text: 'Initialize the database', link: '/dev/init-database' },
              ]
            },
            {
              text: 'Contribute',
              items: []
            }
          ],
        },
      ],
      '/markdown-examples': [ {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      } ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Project-OSmOSE/osmose-app' },
    ]
  },
  markdown: {
    image: {
      lazyLoading: true
    }
  }
})
