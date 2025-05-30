<template>
  <t-dialog
    v-model:visible="visible"
    header="🎉 欢迎使用AI智能助手"
    width="500px"
    :close-on-overlay-click="true"
    :show-overlay="true"
    class="ai-welcome-dialog"
  >
    <div class="welcome-content">
      <div class="ai-icon-large">
        <t-icon name="chat" size="60px" />
      </div>
      
      <h3 class="welcome-title">您的专属AI助手已就绪！</h3>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <div class="feature-text">
            <h4>智能推荐</h4>
            <p>根据您的喜好推荐精彩节目</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">❓</div>
          <div class="feature-text">
            <h4>问题解答</h4>
            <p>回答平台使用和节目相关问题</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <div class="feature-text">
            <h4>智能对话</h4>
            <p>与AI进行自然流畅的对话交流</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <div class="feature-text">
            <h4>内容搜索</h4>
            <p>帮您快速找到想要的节目内容</p>
          </div>
        </div>
      </div>
      
      <div class="usage-tip">
        <div class="tip-icon">💡</div>
        <div class="tip-text">
          <strong>使用提示：</strong>点击右下角的AI助手按钮即可开始对话，支持语音输入和文字交流！
        </div>
      </div>
      
      <div class="quick-start">
        <p class="quick-title">快速开始，试试这些问题：</p>
        <div class="quick-buttons">
          <t-button
            v-for="question in quickQuestions"
            :key="question"
            theme="default"
            variant="outline"
            size="small"
            @click="startWithQuestion(question)"
            class="quick-btn"
          >
            {{ question }}
          </t-button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <t-button theme="default" @click="visible = false">
          稍后体验
        </t-button>
        <t-button theme="primary" @click="startChat">
          立即体验
        </t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'start-chat', question?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(props.modelValue)

// 快速问题
const quickQuestions = ref([
  '推荐一些好听的节目',
  '如何使用这个平台？',
  '有什么新的节目吗？'
])

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

// 监听visible变化并同步到父组件
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 开始聊天
const startChat = () => {
  emit('start-chat')
  visible.value = false
}

// 使用问题开始聊天
const startWithQuestion = (question: string) => {
  emit('start-chat', question)
  visible.value = false
}
</script>

<style scoped>
.ai-welcome-dialog :deep(.t-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.welcome-content {
  padding: 20px 0;
  text-align: center;
}

.ai-icon-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: left;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.feature-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.feature-text p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.usage-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.tip-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.tip-text {
  font-size: 14px;
  color: #1e40af;
  line-height: 1.5;
}

.quick-start {
  text-align: center;
}

.quick-title {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-btn {
  font-size: 12px;
  border-radius: 16px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .ai-welcome-dialog :deep(.t-dialog) {
    width: 90vw !important;
    margin: 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-btn {
    width: 200px;
  }
}
</style>
