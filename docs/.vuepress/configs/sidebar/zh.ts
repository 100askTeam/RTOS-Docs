import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarZh: SidebarConfig = {
  '/zh/freeRTOS/DShanMCU-F103/': [
    {
      text: 'FreeRTOS入门与工程实践',
      collapsible: true,
      children: [
        '/zh/freeRTOS/DShanMCU-F103/README.md',
        '/zh/freeRTOS/DShanMCU-F103/chapter1.md',
      ],
    },
  ],
}
