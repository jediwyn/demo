<script setup>
import { ref, computed, watch } from 'vue'
import { generateReply, validateReview } from '../services/aiApi'

const props = defineProps({
  businessInfo: {
    type: Object,
    required: true
  }
})

// 评论输入
const reviewText = ref('')

// 回复选项
const selectedTone = ref('') // 活泼/专业/幽默
const selectedWordCount = ref(200) // 50-400字，默认200

// 生成状态
const isGenerating = ref(false)
const generatedReply = ref('')
const errorMessage = ref('')

// 剪贴板提示
const copyFeedback = ref('')

// 语气选项
const toneOptions = [
  { value: '活泼', label: '活泼', icon: '🎉', desc: '轻松愉快，富有活力' },
  { value: '专业', label: '专业', icon: '💼', desc: '正式得体，体现专业度' },
  { value: '幽默', label: '幽默', icon: '😄', desc: '风趣幽默，拉近距离' }
]

// 字数档位选项（快捷按钮）
const wordCountPresets = [100, 200, 300]

// 验证状态
const reviewValidation = computed(() => {
  return validateReview(reviewText.value)
})

// 是否可以生成
const canGenerate = computed(() => {
  return reviewValidation.value.valid &&
         selectedTone.value &&
         !isGenerating.value
})

// 字数显示文本
const wordCountLabel = computed(() => {
  return `${selectedWordCount.value}字`
})

// 生成回复
async function handleGenerate() {
  errorMessage.value = ''

  if (!canGenerate.value) {
    if (!reviewValidation.value.valid) {
      errorMessage.value = reviewValidation.value.error
    }
    if (!selectedTone.value) {
      errorMessage.value = '请选择回复语气'
    }
    return
  }

  isGenerating.value = true

  try {
    const reply = await generateReply({
      brandName: props.businessInfo.brandName,
      category: props.businessInfo.category,
      features: props.businessInfo.features,
      review: reviewText.value,
      tone: selectedTone.value,
      wordCount: selectedWordCount.value
    })

    generatedReply.value = reply
    errorMessage.value = ''
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = error.message || '生成失败，请稍后重试'
    generatedReply.value = ''
  } finally {
    isGenerating.value = false
  }
}

// 重新生成
function handleRegenerate() {
  handleGenerate()
}

// 复制到剪贴板
async function handleCopy() {
  const textToCopy = generatedReply.value

  try {
    await navigator.clipboard.writeText(textToCopy)
    showCopyFeedback('已复制至剪贴板')
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = textToCopy
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      showCopyFeedback('已复制至剪贴板')
    } catch (e) {
      showCopyFeedback('复制失败，请手动复制')
    }

    document.body.removeChild(textarea)
  }
}

// 显示复制反馈
function showCopyFeedback(message) {
  copyFeedback.value = message
  setTimeout(() => {
    copyFeedback.value = ''
  }, 2000)
}

// 选择语气
function selectTone(tone) {
  selectedTone.value = tone
  errorMessage.value = ''
}

// 设置字数预设值
function setWordCount(count) {
  selectedWordCount.value = count
}

// 清空评论
function clearReview() {
  reviewText.value = ''
  errorMessage.value = ''
}

// 监听字数变化，确保在范围内
watch(selectedWordCount, (newVal) => {
  if (newVal < 50) selectedWordCount.value = 50
  if (newVal > 400) selectedWordCount.value = 400
})
</script>

<template>
  <div class="generator-layout">
    <!-- 左侧：输入区 -->
    <div class="left-panel">
      <!-- 评论输入区 -->
      <div class="card">
        <div class="card-header">
          <h2>📝 顾客评论</h2>
          <button v-if="reviewText" @click="clearReview" class="btn-clear">
            清空
          </button>
        </div>
        <div class="card-body">
          <textarea
            v-model="reviewText"
            class="review-textarea"
            placeholder="请粘贴美团、大众点评、口碑等平台的顾客评论，支持纯文本、带表情/标点的内容..."
            maxlength="800"
          ></textarea>
          <div class="textarea-footer">
            <span class="char-count" :class="{ 'error': !reviewValidation.valid }">
              {{ reviewText.length }}/800
            </span>
          </div>
        </div>
      </div>

      <!-- 回复设置区 -->
      <div class="card">
        <div class="card-header">
          <h2>⚙️ 回复设置</h2>
        </div>
        <div class="card-body">
          <!-- 语气选择 -->
          <div class="setting-section">
            <label class="section-label">回复语气 <span class="required">*</span></label>
            <div class="tone-options">
              <button
                v-for="option in toneOptions"
                :key="option.value"
                :class="['tone-btn', { active: selectedTone === option.value }]"
                @click="selectTone(option.value)"
              >
                <span class="tone-icon">{{ option.icon }}</span>
                <span class="tone-label">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- 字数滑块 -->
          <div class="setting-section">
            <div class="slider-header">
              <label class="section-label">回复字数</label>
              <span class="word-count-display">{{ wordCountLabel }}</span>
            </div>
            <input
              v-model.number="selectedWordCount"
              type="range"
              min="50"
              max="400"
              step="10"
              class="word-count-slider"
            >
            <div class="slider-presets">
              <button
                v-for="preset in wordCountPresets"
                :key="preset"
                :class="['preset-btn', { active: selectedWordCount === preset }]"
                @click="setWordCount(preset)"
              >
                {{ preset }}字
              </button>
            </div>
          </div>

          <!-- 生成按钮 -->
          <button
            :class="['btn-generate', { disabled: !canGenerate }]"
            :disabled="!canGenerate"
            @click="handleGenerate"
          >
            <span v-if="!isGenerating" class="btn-content">
              <span class="btn-icon">✨</span>
              生成回复
            </span>
            <span v-else class="btn-content loading">
              <span class="spinner"></span>
              AI生成中...
            </span>
          </button>

          <!-- 错误提示 -->
          <Transition name="shake">
            <div v-if="errorMessage" class="error-message">
              ⚠️ {{ errorMessage }}
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 右侧：结果区 -->
    <div class="right-panel">
      <div class="result-card" :class="{ 'has-content': generatedReply }">
        <!-- 空状态 -->
        <div v-if="!generatedReply" class="result-empty">
          <div class="empty-icon">💬</div>
          <h3>AI回复</h3>
          <p>填写评论并选择设置后<br>点击「生成回复」开始使用</p>
        </div>

        <!-- 生成结果 -->
        <template v-else>
          <div class="result-header">
            <h3>💬 生成回复</h3>
            <div class="result-actions">
              <button class="btn-regenerate" @click="handleRegenerate" :disabled="isGenerating" title="重新生成">
                🔄
              </button>
              <button class="btn-copy" @click="handleCopy" :disabled="isGenerating" title="一键复制">
                📋
              </button>
            </div>
          </div>
          <div class="result-body">
            <div
              class="reply-content"
              contenteditable="true"
              @input="generatedReply = $event.textContent"
            >
              {{ generatedReply }}
            </div>
            <div class="reply-footer">
              <span class="reply-hint">💡 内容可直接编辑</span>
              <span class="reply-count">{{ generatedReply.length }}字</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 复制反馈 Toast -->
      <Teleport to="body">
        <Transition name="toast">
          <div v-if="copyFeedback" class="toast-feedback">
            {{ copyFeedback }}
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.generator-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.left-panel .card:first-child {
  /* 评论输入卡片 */
}

.left-panel .card:last-child {
  /* 回复设置卡片 */
  flex-shrink: 0;
}

/* 卡片基础样式 */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.card-body {
  padding: 1.25rem 1.5rem;
}

/* 清空按钮 */
.btn-clear {
  padding: 0.3rem 0.6rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  color: #666;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

/* 评论输入区 */
.review-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 160px;
  max-height: 280px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.review-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.char-count {
  font-size: 0.75rem;
  color: #999;
}

.char-count.error {
  color: #e74c3c;
}

/* 设置区域 */
.setting-section {
  margin-bottom: 0.875rem;
}

.setting-section:last-of-type {
  margin-bottom: 0.75rem;
}

.section-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

/* 语气选择 */
.tone-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.375rem;
}

.tone-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tone-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tone-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.tone-icon {
  font-size: 1.25rem;
}

.tone-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
}

/* 字数滑块 */
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.word-count-display {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
  min-width: 45px;
  text-align: right;
}

.word-count-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.word-count-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s;
}

.word-count-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.word-count-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
}

.slider-presets {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.preset-btn {
  flex: 1;
  padding: 0.375rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.preset-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 生成按钮 */
.btn-generate {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-generate.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
  margin-right: 0.375rem;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 加载动画 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  margin-top: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: #fef5f5;
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
  color: #e74c3c;
  font-size: 0.8rem;
}

/* 右侧结果卡片 */
.right-panel {
  position: sticky;
  top: 1rem;
}

.result-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 560px;
  display: flex;
  flex-direction: column;
}

.result-card.has-content {
  border: 2px solid #667eea;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
}

/* 空状态 */
.result-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.result-empty h3 {
  margin: 0 0 0.375rem 0;
  font-size: 1.1rem;
  color: #333;
}

.result-empty p {
  margin: 0;
  color: #999;
  line-height: 1.6;
}

/* 生成结果 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.result-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-regenerate,
.btn-copy {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-regenerate:hover:not(:disabled) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.btn-copy:hover:not(:disabled) {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.btn-regenerate:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-body {
  flex: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.reply-content {
  flex: 1;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  line-height: 1.7;
  color: #333;
  min-height: 240px;
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.reply-content:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.reply-hint {
  font-size: 0.75rem;
  color: #999;
}

.reply-count {
  font-size: 0.75rem;
  color: #666;
}

/* Toast 反馈 */
.toast-feedback {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.875rem 1.5rem;
  background: #27ae60;
  color: white;
  border-radius: 50px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  z-index: 1000;
}

/* 动画 */
.shake-enter-active {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .generator-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .left-panel {
    height: auto;
  }

  .left-panel .card {
    flex: none;
  }

  .left-panel .review-textarea {
    min-height: 180px;
  }

  .right-panel {
    position: static;
  }

  .result-card {
    min-height: 400px;
  }
}

/* 响应式设计 - 手机 */
@media (max-width: 768px) {
  .generator-layout {
    gap: 1rem;
  }

  .card,
  .result-card {
    border-radius: 16px;
  }

  .card-header {
    padding: 1rem 1.25rem;
  }

  .card-header h2 {
    font-size: 1rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .left-panel {
    gap: 1rem;
  }

  /* 语气按钮 */
  .tone-btn {
    padding: 0.875rem 0.5rem;
  }

  .tone-icon {
    font-size: 1.5rem;
  }

  .tone-label {
    font-size: 0.85rem;
  }

  /* 滑块预设 */
  .preset-btn {
    padding: 0.4rem;
    font-size: 0.8rem;
  }

  /* 生成按钮 */
  .btn-generate {
    padding: 0.875rem;
    font-size: 1rem;
  }

  /* 结果卡片 */
  .result-header {
    padding: 1rem 1.25rem;
  }

  .result-header h3 {
    font-size: 1rem;
  }

  .result-body {
    padding: 1.25rem;
  }

  .reply-content {
    padding: 1rem;
    min-height: 180px;
    font-size: 1rem;
  }

  .reply-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  /* Toast */
  .toast-feedback {
    left: 1rem;
    right: 1rem;
    transform: none;
    border-radius: 12px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .tone-options {
    grid-template-columns: 1fr;
  }

  .tone-btn {
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .card-header h2,
  .result-header h3 {
    font-size: 0.95rem;
  }

  .btn-clear {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
