<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue'
import PageMeta from '@theme/PageMeta.vue'
import PageNav from '@theme/PageNav.vue'
import RightMenu from '@theme/RightMenu.vue'
import { usePageData } from '@vuepress/client'
import '../styles/gitalk.scss'

defineSlots<{
  'top'?: (props: Record<never, never>) => any
  'bottom'?: (props: Record<never, never>) => any
  'content-top'?: (props: Record<never, never>) => any
  'content-bottom'?: (props: Record<never, never>) => any
}>()

const page = usePageData()

const language = computed(() => {
  if (page.value.lang == 'en-US') {
    return 'en-US'
  }
  return 'zh-CN'
})


onMounted(() => {
  import('gitalk').then(module => {
    const Gitalk = module.default
    const gitalk = new Gitalk({
      clientID: '32cd9fbad6940f6bb8c7',
      clientSecret: '4ef32c5e87dff8760f392a2bda21fc32148c9048',
      repo: 'Allwinner-Docs',
      owner: 'DongshanPI',
      admin: ['DongshanPI'],
      id: location.pathname,
      distractionFreeMode: false,
      language: language.value,
    })
    gitalk.render('gitalk-container')
  }).catch(err => {
    console.log(err)
  })
})
</script>

<template>
  <main class="page">
    <slot name="top" />

    <div class="theme-default-content">
      <ClientOnly>
        <RightMenu />
      </ClientOnly>

      <slot name="content-top" />

      <ClientOnly>
        <Content class="content-custom" />
      </ClientOnly>

      <slot name="content-bottom" />
    </div>

    <PageMeta />
    <PageNav />

    <div id="gitalk-container" class="theme-default-content"></div>
    <slot name="bottom" />
  </main>
</template>
<style lang="scss" scoped>
.page {
  .test {
    height: 100px;
  }
  #gitalk-container {
    padding-top: 50px;
  }
}
@media only screen and (min-width: 1000px) {
  .page {
    width: 650px;
  }
  .theme-default-content {
    width: 600px;
  }
}
@media only screen and (min-width: 1200px) {
  .theme-default-content {
    width: 700px;
  }
}
@media only screen and (min-width: 1400px) {
  .page {
    width: 900px;
  }
  .theme-default-content {
    width: 800px;
  }
}
@media only screen and (min-width: 1600px) {
  .page {
    width: 950px;
  }
  .theme-default-content {
    width: 800px;
  }
}
@media only screen and (min-width: 1800px) {
  .page {
    width: 1200px;
  }
  .theme-default-content {
    width: 800px;
  }
}
</style>
