import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarEn: NavbarConfig = [
  {
    text: 'Apply',
    link: '/en/'
  },
  {
    text: 'System',
    link: '/en/reference/config.md',
  },
  {
    text: 'Drive',
    link: '/en/reference/plugin/back-to-top.md'
  },
  {
    text: 'Theme',
    link: '/en/advanced/cookbook/'
  },
  {
    text: `Quan Zhi Series`,
    children: [
      {
        text: '更新日志',
        // link: 'https://github.com/vuepress/vuepress-next/blob/main/CHANGELOG.md',
        link: '/en/advanced/cookbook/',
      },
      {
        text: 'v1.x',
        link: 'https://v1.vuepress.vuejs.org/en/',
      },
      {
        text: 'v0.x',
        link: 'https://v0.vuepress.vuejs.org/en/',
      },
    ],
  },
]
