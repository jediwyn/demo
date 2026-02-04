import { createApp } from 'vue'
import App from './App.vue'

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || ''

// 创建 Vue 应用
const app = createApp(App)

// 挂载应用
app.mount('#app')

// 初始化 Google Analytics
if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-')) {
  // 创建 GA 脚本
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `
  document.head.appendChild(script2)
}

// 页面加载完成后添加 loaded class，防止内容闪烁
window.addEventListener('load', () => {
  document.getElementById('app')?.classList.add('loaded')
})
