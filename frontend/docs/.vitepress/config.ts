import { defineConfig } from 'vitepress'
// @ts-ignore
import packageJSON from '../../../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "APLOSE",
  description: "A web-based annotation plateform developed by and for Marine Passive Acoustic Monitoring researchers",
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.png',
    outline: "deep",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'User', link: '/user' },
      { text: 'Developer', link: '/dev/docker' },
      // {
      //   text: packageJSON.version,
      //   items: [
          { text: 'Changelog', link: 'https://github.com/Project-OSmOSE/osmose-app/releases', target: '_blank'},
      //   ]
      // }
      { text: 'APLOSE', link: '/../app/', target: '_blank'},
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
                { text: 'Generate a dataset', link: '/user/campaign-creator/generate-dataset' },
                { text: 'Import a dataset', link: '/user/campaign-creator/import-dataset' },
                { text: 'Create a campaign', link: '/user/campaign-creator/create-campaign' },
                { text: 'Manage a campaign', link: '/user/campaign-creator/manage-campaign' },
                { text: 'View results', link: '/user/campaign-creator/view-results' },
              ]
            },
            {
              text: 'Administrator',
              items: [
                { text: 'Administration presentation', link: '/user/administrator/presentation' },
                { text: 'Manage users', link: '/user/administrator/manage-users' },
              ]
            },
            { text: 'Terminology', link: '/user/terminology' },
          ],
        },
      ],
      '/dev': [
        {
          text: 'Developer',
          items: [
            { text: 'Docker installation', link: '/dev/docker' },
          ],
        },
      ],
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
