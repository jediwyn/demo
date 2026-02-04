<script setup>
import { ref, onMounted, computed } from 'vue'
import BusinessInfoForm from './components/BusinessInfoForm.vue'
import ReviewGenerator from './components/ReviewGenerator.vue'

// 是否显示设置面板
const showSettings = ref(false)

// 经营信息
const businessInfo = ref({
  brandName: '',
  category: '',
  features: ''
})

// 是否已设置经营信息
const hasBusinessInfo = computed(() => {
  return businessInfo.value.brandName &&
         businessInfo.value.category &&
         businessInfo.value.features
})

// 加载保存的经营信息
onMounted(() => {
  loadBusinessInfo()
})

function loadBusinessInfo() {
  const saved = localStorage.getItem('businessInfo')
  if (saved) {
    try {
      businessInfo.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载经营信息失败:', e)
    }
  }
}

function saveBusinessInfo(info) {
  businessInfo.value = { ...info }
  localStorage.setItem('businessInfo', JSON.stringify(info))
  showSettings.value = false
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-icon">✨</span>
          AI评论回复助手
        </h1>
        <button class="btn-settings" @click="openSettings">
          ⚙️ 经营信息设置
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 提示信息 -->
      <Transition name="fade">
        <div v-if="!hasBusinessInfo" class="welcome-tip">
          <div class="tip-icon">👋</div>
          <h2>欢迎使用 AI 评论回复助手</h2>
          <p>首次使用请先设置您的经营信息，我们将根据您的品牌特色生成个性化回复</p>
          <button class="btn-primary" @click="openSettings">
            立即设置
          </button>
        </div>
      </Transition>

      <!-- 生成回复页面 -->
      <ReviewGenerator
        v-if="hasBusinessInfo"
        :business-info="businessInfo"
        :key="JSON.stringify(businessInfo)"
      />

      <!-- 经营信息设置面板（弹窗形式） -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showSettings" class="settings-modal" @click.self="closeSettings">
            <div class="settings-content">
              <div class="settings-header">
                <h2>⚙️ 经营信息设置</h2>
                <button class="btn-close" @click="closeSettings">✕</button>
              </div>
              <div class="settings-body">
                <BusinessInfoForm
                  :initial-info="businessInfo"
                  @save="saveBusinessInfo"
                  :compact="true"
                />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>AI 驱动的个性化评论回复工具</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 顶部导航 */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.logo-icon {
  font-size: 1.25rem;
}

.btn-settings {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-settings:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

/* 主内容区 */
.main-content {
  flex: 1;
  max-width: 1500px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}

/* 欢迎提示 */
.welcome-tip {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 4rem auto 0;
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-tip h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.welcome-tip p {
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.btn-primary {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* 设置弹窗 */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.settings-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e0e0e0;
}

.settings-body {
  padding: 1.5rem;
  overflow-y: auto;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .settings-content,
.modal-leave-to .settings-content {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0.875rem 1rem;
  }

  .logo {
    font-size: 1rem;
  }

  .logo-icon {
    font-size: 1.25rem;
  }

  .btn-settings {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .main-content {
    padding: 1rem;
  }

  .settings-modal {
    padding: 1rem;
  }

  .settings-content {
    border-radius: 16px;
    max-height: 92vh;
  }

  .settings-header {
    padding: 1rem 1.25rem;
  }

  .settings-header h2 {
    font-size: 1rem;
  }

  .settings-body {
    padding: 1rem;
  }

  .welcome-tip {
    padding: 2rem 1.25rem;
    border-radius: 16px;
  }

  .welcome-tip h2 {
    font-size: 1.25rem;
  }

  .btn-primary {
    padding: 0.65rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 0.9rem;
  }

  .btn-settings {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }

  .welcome-tip .tip-icon {
    font-size: 2.5rem;
  }

  .welcome-tip h2 {
    font-size: 1.1rem;
  }

  .welcome-tip p {
    font-size: 0.9rem;
  }
}
</style>
