import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: 'FreeRTOS入门与工程实践-基于STM32F103',
    link: '/zh/FreeRTOS/DShanMCU-F103/',
  },
  {
    text: `FreeRTOS文档教程`,
    children: [
      {
        text: '教程汇总',
        link: '/zh/all_docs_tutorials.md',
      },
      {
        text: '【学前必看】5分钟入门、理解RTOS',
        link: 'https://www.bilibili.com/video/BV11h41167iD',
      },
      {
        text: '入门',
        children: [
          {
            text: '⭐【首选】FreeRTOS入门与工程实践-基于STM32F103',
            link: '/zh/FreeRTOS/DShanMCU-F103/',
          },
          {
            text: 'FreeRTOS快速入门-基于模拟器',
            link: '/zh/FreeRTOS/simulator/',
          },
        ]
      },
    ],
  },
  {
    text: `RTOS学习套件`,
    children: [
      {
        text: 'DShanMCU-F103学习套件（STM32F103C8T6主控芯片）',
        link: 'https://item.taobao.com/item.htm?id=724601559592',
      },
      {
        text: 'DShanMCU-R128学习套件（全志R128-S2/S3主控芯片）',
        link: 'https://item.taobao.com/item.htm?id=724601559592',
      },
    ],
  },
  {
    text: `视频教程`,
    link: '/zh/all_video_tutorials.md',
    children: [
      {
        text: '教程汇总',
        link: '/zh/all_video_tutorials.md',
      },
      {
        text: '【学前必看】5分钟入门、理解RTOS',
        link: 'https://www.bilibili.com/video/BV11h41167iD',
      },
      {
        text: 'FreeRTOS',
        children: [
          {
            text: '⭐【入门首选】FreeRTOS入门与工程实践-基于STM32F103',
            link: 'https://www.bilibili.com/video/BV1Jw411i7Fz',
          },
          {
            text: 'FreeRTOS快速入门基于模拟器',
            link: 'https://www.bilibili.com/video/BV1844y1g7ud',
          },
          {
            text: 'FreeRTOS的内部机制',
            link: 'https://www.bilibili.com/video/BV1Ar4y1C7En',
          },
          {
            text: 'FreeRTOS商业产品案例源码讲解',
            link: 'https://www.bilibili.com/video/BV1Nq4y1r7KL',
          },
        ]
      },
      {
        text: 'RT-THread',
        children: [
          {
            text: 'RT-Thread的内部机制',
            link: 'https://www.bilibili.com/video/BV17U4y1K7EL',
          },
          {
            text: 'RT-Thread Smart微内核最小系统移植(基于STM32MP157)',
            link: 'https://www.bilibili.com/video/BV19A411s7f9',
          },
          {
            text: 'RT-Thread Smart微内核最小系统移植(基于IMX6ULL)',
            link: 'https://www.bilibili.com/video/BV1ti4y1w7VQ',
          },
        ]
      }
    ],
  },
  {
    text: `关于我们`,
    children: [
      {
        text: '百问网在线学习平台',
        link: 'https://www.100ask.net',
      },
      {
        text: '淘宝店铺',
        link: 'https://100ask.taobao.com',
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
