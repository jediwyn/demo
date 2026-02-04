import { createApp } from 'vue'
import App from './App.vue'
import VueGtag from 'vue-gtag'

// Google Analytics Measurement ID
// 请将此处替换为你的 Google Analytics Measurement ID (格式: G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX'

// 创建 Vue 应用
const app = createApp(App)

// 配置 Google Analytics
if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
  app.use(VueGtag, {
    config: {
      id: GA_MEASUREMENT_ID
    }
  })
}

// 挂载应用
app.mount('#app')

// 页面加载完成后添加 loaded class，防止内容闪烁
window.addEventListener('load', () => {
  document.getElementById('app')?.classList.add('loaded')
})
