import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用
const app = createApp(App)

// 挂载应用
app.mount('#app')

// 页面加载完成后添加 loaded class，防止内容闪烁
window.addEventListener('load', () => {
  document.getElementById('app')?.classList.add('loaded')
})
