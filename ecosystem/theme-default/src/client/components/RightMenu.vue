<template>
  <div class="right-menu-wrapper" v-if="headers.length" >
    <div class="right-menu-margin">
      <div class="right-menu-title">
        {{ page.lang == 'en-US' ? 'catalogue' : '目录' }}
      </div>
      <div class="right-menu-content">
        <div
          :class="[
            'right-menu-item',
            'level' + item.level,
            { active: item.slug === hashText },
          ]"
          v-for="(item, i) in headers"
          :key="i"
        >
          <a :href="'#' + item.slug">{{ item.title }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePageData } from '@vuepress/client'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const page = usePageData()
const headers = ref([])
const hashText = ref('')

onMounted(() => {
  getHeadersData()
  getHashText()
})

watch(
  route,
  () => {
    getHashText()
  }
)

const getHeadersData = () => {
  page.value.headers.forEach((item) => {
    headers.value.push(item)
    if (item.children.length) headers.value.push(...item.children)
  })
}
const getHashText = () => {
  hashText.value = decodeURIComponent(window.location.hash.slice(1))
}

</script>

<style lang='scss' scoped>
.right-menu-wrapper {
  right: 0;
  width: 220px;
  float: right;
  margin-right: -(200px + 200px);
  position: sticky;
  top: 50px;
  font-size: 0.8rem;
  .right-menu-margin {
    margin-top: 4.6rem;
    border-radius: 3px;
    overflow: hidden;
    margin-top: (3.6rem + 1rem) border-radius 3px;
    border-left: 1px solid var(--borderColor);
    .right-menu-title {
      padding: 10px 15px 0 15px;
      background: var(--mainBg);
      font-size: 1rem;
      &:after {
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background: var(--borderColor);
        margin-top: 10px;
      }
    }
    .right-menu-content {
      max-height: 80vh;
      position: relative;
      overflow: hidden;
      background: var(--mainBg);
      padding: 4px 3px 4px 0;
      &::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }
      &::-webkit-scrollbar-track-piece {
        background: none;
      }
      &::-webkit-scrollbar-thumb:vertical {
        // background-color: hsla(0, 0%, 49%, 0.3);
        background-color: var(--c-brand);
      }
      &:hover {
        overflow-y: auto;
        padding-right: 0;
      }
      .right-menu-item {
        padding: 4px 15px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        position: relative;
        &.level2 {
          font-size: 0.8rem;
        }
        &.level3 {
          padding-left: 27px;
        }
        &.level4 {
          padding-left: 37px;
        }
        &.level5 {
          padding-left: 47px;
        }
        &.level6 {
          padding-left: 57px;
        }
        &.active {
          &:before {
            content: '';
            position: absolute;
            top: 5px;
            left: 0;
            width: 3px;
            height: 14px;
            background: var(--c-brand);
            border-radius: 0 4px 4px 0;
          }
          a {
            color: var(--c-brand);
            opacity: 1;
          }
        }
        a {
          font-size: 1em;
          font-weight: 400;
          color: var(--textColor);
          opacity: 0.75;
          display: inline-block;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-decoration: none;
          &:hover {
            opacity: 1;
          }
        }
        &:hover {
          color: var(--c-brand);
        }
      }
    }
  }
}
@media only screen and (max-width: 1700px) {
  .right-menu-wrapper {
    margin-right: -(210px + 80px);
  }
}
@media only screen and (max-width: 1500px) {
  .right-menu-wrapper {
    margin-right: -(210px + 50px);
  }
}
@media only screen and (max-width: 1300px) {
  .right-menu-wrapper {
    margin-right: -(220px + 30px);
  }
}
@media only screen and (max-width: 1200px) {
  .right-menu-wrapper {
    margin-right: -(220px + 40px);
  }
}
@media only screen and (max-width: 1000px) {
  .right-menu-wrapper {
    display: none;
  }
}
</style>