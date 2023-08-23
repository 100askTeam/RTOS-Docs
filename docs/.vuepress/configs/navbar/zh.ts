import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: 'FreeRTOS入门与工程实践',
    link: '/zh/freeRTOS/DShanMCU-F103/',
  },
  {
    text: `RTOS学习套件`,
    children: [
      {
        text: 'DShanMCU-F103学习套件',
        link: 'https://item.taobao.com/item.htm?id=724601559592',
      },
    ],
  },
]
