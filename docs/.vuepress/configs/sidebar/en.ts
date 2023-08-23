import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarEn: SidebarConfig = {
  '/en/': [
    {
      text: '应用开发',
      children: [
        '/en/apply/README.md',
        '/en/apply/getting-started.md',
        '/en/apply/configuration.md',
        '/en/apply/page.md',
        '/en/apply/markdown.md',
        '/en/apply/assets.md',
        '/en/apply/i18n.md',
        '/en/apply/deployment.md',
        '/en/apply/theme.md',
        '/en/apply/plugin.md',
        '/en/apply/bundler.md',
        '/en/apply/migration.md',
        '/en/apply/new.md',
      ],
    },
  ],
  '/en/advanced/': [
    {
      text: '深入',
      children: [
        '/en/advanced/architecture.md',
        '/en/advanced/plugin.md',
        '/en/advanced/theme.md',
      ],
    },
    {
      text: 'Cookbook',
      children: [
        '/en/advanced/cookbook/README.md',
        '/en/advanced/cookbook/usage-of-client-config.md',
        '/en/advanced/cookbook/adding-extra-pages.md',
        '/en/advanced/cookbook/making-a-theme-extendable.md',
        '/en/advanced/cookbook/passing-data-to-client-code.md',
        '/en/advanced/cookbook/markdown-and-vue-sfc.md',
      ],
    },
  ],
  '/en/reference/': [
    {
      text: 'VuePress 参考',
      collapsible: true,
      children: [
        '/en/reference/config.md',
        '/en/reference/frontmatter.md',
        '/en/reference/components.md',
        '/en/reference/plugin-api.md',
        '/en/reference/theme-api.md',
        '/en/reference/client-api.md',
        '/en/reference/node-api.md',
      ],
    },
    {
      text: '打包工具参考',
      collapsible: true,
      children: [
        '/en/reference/bundler/vite.md',
        '/en/reference/bundler/webpack.md',
      ],
    },
    {
      text: '默认主题参考',
      collapsible: true,
      children: [
        '/en/reference/default-theme/config.md',
        '/en/reference/default-theme/frontmatter.md',
        '/en/reference/default-theme/components.md',
        '/en/reference/default-theme/markdown.md',
        '/en/reference/default-theme/styles.md',
        '/en/reference/default-theme/extending.md',
      ],
    },
    {
      text: '官方插件参考',
      collapsible: true,
      children: [
        {
          text: '常用功能',
          children: [
            '/en/reference/plugin/back-to-top.md',
            '/en/reference/plugin/container.md',
            '/en/reference/plugin/external-link-icon.md',
            '/en/reference/plugin/google-analytics.md',
            '/en/reference/plugin/medium-zoom.md',
            '/en/reference/plugin/nprogress.md',
            '/en/reference/plugin/register-components.md',
          ],
        },
        {
          text: '内容搜索',
          children: [
            '/en/reference/plugin/docsearch.md',
            '/en/reference/plugin/search.md',
          ],
        },
        {
          text: 'PWA',
          children: [
            '/en/reference/plugin/pwa.md',
            '/en/reference/plugin/pwa-popup.md',
          ],
        },
        {
          text: '语法高亮',
          children: [
            '/en/reference/plugin/prismjs.md',
            '/en/reference/plugin/shiki.md',
          ],
        },
        {
          text: '主题开发',
          children: [
            '/en/reference/plugin/active-header-links.md',
            '/en/reference/plugin/git.md',
            '/en/reference/plugin/palette.md',
            '/en/reference/plugin/theme-data.md',
            '/en/reference/plugin/toc.md',
          ],
        },
      ],
    },
  ],
}
