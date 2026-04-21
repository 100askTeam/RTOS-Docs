// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '百问网',
  tagline: 'RTOS Docs.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://rtos.100ask.net',
  baseUrl: '/',

  organizationName: '100askTeam',
  projectName: 'rtos-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/100askTeam/rtos-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/100askTeam/rtos-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
        hideable: true,
      },
    },
    navbar: {
      title: '百问网',
      logo: {
        alt: '百问网',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'f103Sidebar',
          position: 'left',
          label: 'FreeRTOS入门与工程实践-基于STM32F103',
        }, 
        {
          type: 'dropdown',
          label: 'FreeRTOS文档教程',
          position: 'right',
          items: [
            {
              type: 'html',
              value: '<span style="font-weight:bold; padding:0.25rem 1rem; display:block;">教程汇总</span>',
            },
            {
              to: '/docs/all_docs_tutorials',
              label: '【学前必看】5分钟入门、理解RTOS',
            },
            {
              type: 'docSidebar',
              sidebarId: 'f103Sidebar',
              label: '★【入门首选】FreeRTOS入门与工程实践-基于STM32F103',
            },
            {
              type: 'docSidebar',
              sidebarId: 'simulatorSidebar',
              label: 'FreeRTOS快速入门-基于模拟器',
            },
          
          ],
        },
                {
            type: 'dropdown',
            label: 'RTOS学习套件',
            position: 'right',
            items: [
              {
                href: 'https://item.taobao.com/item.htm?id=724601559592',
                label: 'DShanMCU-F103学习套件（STM32F103C8T6主控芯片）',
              },
              {
                href: 'https://item.taobao.com/item.htm?id=724601559592',
                label: 'DShanMCU-R128学习套件（全志R128-S2/S3主控芯片）',
              },
            ],
          },
          {
            type: 'dropdown',
            label: '视频教程',
            position: 'right',
            items: [
              {
                href: 'https://www.bilibili.com/video/BV1844y1g7ud',
                label: 'FreeRTOS快速入门视频教程',
              },
              {
                href: 'https://www.bilibili.com/video/BV11h41167iD',
                label: '5分钟入门理解RTOS',
              },
              {
                href: 'https://www.bilibili.com/video/BV1Jw411i7Fz',
                label: '⭐【入门首选】FreeRTOS入门与工程实践-基于STM32F103',
              },
               {
                href: 'https://www.bilibili.com/video/BV1844y1g7ud',
                label: 'FreeRTOS 快速入门基于模拟器',
              },
              {
                href: 'https://www.bilibili.com/video/BV1Ar4y1C7En',
                label: 'FreeRTOS 的内部机制',
              }, 
              {
                href: 'https://www.bilibili.com/video/BV1Nq4y1r7KL',
                label: 'FreeRTOS 商业产品案例源码讲解',
              },
              {
                href: 'https://www.bilibili.com/video/BV17U4y1K7EL',
                label: 'RT-Thread 的内部机制',
              }, 
              {
                href: 'https://www.bilibili.com/video/BV19A411s7f9',
                label: 'RT-Thread Smart 微内核最小系统移植 (基于 STM32MP157)',
              }, 
              {
                href: 'https://www.bilibili.com/video/BV1ti4y1w7VQ',
                label: 'RT-Thread Smart 微内核最小系统移植 (基于 IMX6ULL)',
              },                   
            ],
          },
          {
            type: 'dropdown',
            label: '关于我们',
            position: 'right',
            items: [
              {
                href: 'https://www.100ask.net',
                label: '百问网在线学习平台',
              },
              {
                href: 'https://item.taobao.com/item.htm?id=724601559592',
                label: '淘宝店铺',
              },
              {
                href: 'https://forums.100ask.net',
                label: '答疑交流社区',
              },
              {
                href: 'https://space.bilibili.com/275908810',
                label: '哔哩哔哩',
              },
            ],
          },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} 100askTeam, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en", "zh"],
      },
    ],
  ],
};

export default config;