import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: 'FreeRTOS入门与工程实践',
    link: '/zh/freeRTOS/DShanMCU-F103/',
  },
  {
    text: 'freeRTOS快速入门',
    link: '/zh/freeRTOS/simulator/',
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
  {
    text: `关于我们`,
    children: [
      {
        text: '淘宝店铺',
        link: 'https://100ask.taobao.com',
      },
      {
        text: '在线学习平台',
        link: 'https://www.100ask.net',
      },
      {
        text: '答疑交流社区',
        link: 'https://forums.100ask.net',
      },
      {
        text: '哔哩哔哩',
        link: 'https://space.bilibili.com/275908810',
      },
    ],
  },
]
