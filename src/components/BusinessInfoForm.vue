<script setup>
import { ref, onMounted } from 'vue'
import { validateBusinessInfo } from '../services/aiApi'

const props = defineProps({
  initialInfo: {
    type: Object,
    default: () => ({
      brandName: '',
      category: '',
      features: ''
    })
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save'])

// 表单数据
const form = ref({
  brandName: '',
  category: '',
  features: ''
})

// 字符计数
const charCount = ref({
  brandName: 0,
  category: 0,
  features: 0
})

// 错误信息
const errors = ref([])

// 保存成功提示
const showSuccess = ref(false)

onMounted(() => {
  form.value = { ...props.initialInfo }
  updateCharCount()
})

function updateCharCount() {
  charCount.value = {
    brandName: form.value.brandName.length,
    category: form.value.category.length,
    features: form.value.features.length
  }
}

function handleInput(field) {
  updateCharCount()
  clearErrors()
}

function clearErrors() {
  errors.value = []
}

function handleSave() {
  clearErrors()

  const validation = validateBusinessInfo(form.value)

  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('save', { ...form.value })
  showSuccessToast()
}

function showSuccessToast() {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}
</script>

<template>
  <div :class="['business-form-container', { compact }]">
    <!-- 紧凑模式不显示外层卡片 -->
    <template v-if="!compact">
      <div class="form-card">
        <div class="card-header">
          <h2>🏪 经营信息设置</h2>
          <p>您的经营信息将作为 AI 生成回复的基础，请如实填写</p>
        </div>

        <form @submit.prevent="handleSave" class="form-content">
          <!-- 品牌名称 -->
          <div class="form-group">
            <label for="brandName" class="form-label">
              品牌名称 <span class="required">*</span>
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              class="form-input"
              placeholder="例如：蜀香人家、美丽时光美容院"
              maxlength="30"
              @input="handleInput('brandName')"
            />
            <div class="char-count" :class="{ 'near-limit': charCount.brandName > 25 }">
              {{ charCount.brandName }}/30
            </div>
            <div class="form-hint">2-30个字符，支持中英文、数字和符号</div>
          </div>

          <!-- 经营品类 -->
          <div class="form-group">
            <label for="category" class="form-label">
              经营品类 <span class="required">*</span>
            </label>
            <input
              id="category"
              v-model="form.category"
              type="text"
              class="form-input"
              placeholder="例如：川菜火锅、美容美发、家政服务"
              maxlength="50"
              @input="handleInput('category')"
            />
            <div class="char-count" :class="{ 'near-limit': charCount.category > 40 }">
              {{ charCount.category }}/50
            </div>
            <div class="form-hint">5-50个字符，描述您的经营品类</div>
          </div>

          <!-- 品牌特色 -->
          <div class="form-group">
            <label for="features" class="form-label">
              品牌特色 <span class="required">*</span>
            </label>
            <textarea
              id="features"
              v-model="form.features"
              class="form-textarea"
              placeholder="例如：坚持使用新鲜食材，传承20年秘制配方，提供贴心周到的服务，店内环境优雅舒适..."
              rows="4"
              maxlength="100"
              @input="handleInput('features')"
            ></textarea>
            <div class="char-count" :class="{ 'near-limit': charCount.features > 85 }">
              {{ charCount.features }}/100
            </div>
            <div class="form-hint">10-100个字符，描述您的品牌特色和优势</div>
          </div>

          <!-- 错误提示 -->
          <Transition name="shake">
            <div v-if="errors.length > 0" class="error-list">
              <div v-for="(error, index) in errors" :key="index" class="error-item">
                ⚠️ {{ error }}
              </div>
            </div>
          </Transition>

          <!-- 保存按钮 -->
          <div class="form-actions">
            <button type="submit" class="btn-submit">
              <span class="btn-icon">💾</span>
              保存经营信息
            </button>
          </div>
        </form>
      </div>
    </template>

    <!-- 紧凑模式 -->
    <template v-else>
      <form @submit.prevent="handleSave" class="compact-form">
        <!-- 品牌名称 -->
        <div class="form-group">
          <label class="form-label">
            品牌名称 <span class="required">*</span>
          </label>
          <input
            v-model="form.brandName"
            type="text"
            class="form-input"
            placeholder="例如：蜀香人家、美丽时光美容院"
            maxlength="30"
            @input="handleInput('brandName')"
          />
          <div class="char-count" :class="{ 'near-limit': charCount.brandName > 25 }">
            {{ charCount.brandName }}/30
          </div>
        </div>

        <!-- 经营品类 -->
        <div class="form-group">
          <label class="form-label">
            经营品类 <span class="required">*</span>
          </label>
          <input
            v-model="form.category"
            type="text"
            class="form-input"
            placeholder="例如：川菜火锅、美容美发、家政服务"
            maxlength="50"
            @input="handleInput('category')"
          />
          <div class="char-count" :class="{ 'near-limit': charCount.category > 40 }">
            {{ charCount.category }}/50
          </div>
        </div>

        <!-- 品牌特色 -->
        <div class="form-group">
          <label class="form-label">
            品牌特色 <span class="required">*</span>
          </label>
          <textarea
            v-model="form.features"
            class="form-textarea"
            placeholder="例如：坚持使用新鲜食材，传承20年秘制配方，提供贴心周到的服务，店内环境优雅舒适..."
            rows="3"
            maxlength="100"
            @input="handleInput('features')"
          ></textarea>
          <div class="char-count" :class="{ 'near-limit': charCount.features > 85 }">
            {{ charCount.features }}/100
          </div>
        </div>

        <!-- 错误提示 -->
        <Transition name="shake">
          <div v-if="errors.length > 0" class="error-list">
            <div v-for="(error, index) in errors" :key="index" class="error-item">
              ⚠️ {{ error }}
            </div>
          </div>
        </Transition>

        <!-- 保存按钮 -->
        <button type="submit" class="btn-submit">
          <span class="btn-icon">💾</span>
          保存经营信息
        </button>
      </form>
    </template>

    <!-- 成功提示 Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showSuccess" class="toast-success">
          <span class="toast-icon">✅</span>
          <span>保存成功！</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.business-form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.card-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #333;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.form-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #aaa;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.char-count {
  position: absolute;
  right: 1rem;
  bottom: 0.75rem;
  font-size: 0.75rem;
  color: #999;
  pointer-events: none;
}

.char-count.nar-limit {
  color: #e74c3c;
}

.form-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #999;
}

/* 错误提示 */
.error-list {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fef5f5;
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
}

.error-item {
  color: #e74c3c;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* 按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
}

.btn-submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2rem;
}

/* 紧凑模式样式 */
.compact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-form .form-group {
  margin-bottom: 0;
}

.compact-form .form-label {
  font-size: 0.9rem;
}

.compact-form .form-input,
.compact-form .form-textarea {
  padding: 0.75rem 0.875rem;
  font-size: 0.95rem;
}

.compact-form .form-textarea {
  min-height: 80px;
}

.compact-form .char-count {
  font-size: 0.7rem;
}

.compact-form .btn-submit {
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
}

/* 成功提示 Toast */
.toast-success {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #27ae60;
  color: white;
  border-radius: 50px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  z-index: 2000;
}

.toast-icon {
  font-size: 1.2rem;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.shake-enter-active {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-card {
    border-radius: 16px;
  }

  .card-header {
    padding: 1.25rem 1.5rem;
  }

  .card-header h2 {
    font-size: 1.15rem;
  }

  .card-header p {
    font-size: 0.85rem;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-hint {
    font-size: 0.75rem;
  }

  .btn-submit {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  /* 紧凑模式移动端 */
  .compact-form {
    gap: 0.875rem;
  }

  .compact-form .form-label {
    font-size: 0.85rem;
  }

  .compact-form .form-input,
  .compact-form .form-textarea {
    padding: 0.65rem 0.75rem;
    font-size: 0.9rem;
  }

  .compact-form .form-textarea {
    min-height: 70px;
  }

  .compact-form .btn-submit {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .card-header h2 {
    font-size: 1.05rem;
  }

  .form-content {
    padding: 1.25rem;
  }

  .btn-submit {
    padding: 0.75rem 1.25rem;
  }
}
</style>
