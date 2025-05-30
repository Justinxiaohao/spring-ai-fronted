<template>
  <div class="chatbot-container">
    <!-- AI助手触发按钮 -->
    <div
      v-if="!isOpen"
      class="ai-chat-trigger"
      @click="toggleChat"
    >
      <div class="ai-icon">
        <t-icon name="chat" size="28px" />
      </div>
      <div class="ai-label">
        <span class="ai-text">AI助手</span>
        <span class="ai-subtitle">智能问答</span>
      </div>
      <div class="ai-pulse"></div>
    </div>

    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="ai-chat-window">
      <div class="chat-header">
        <div class="header-left">
          <div class="ai-avatar">
            <t-icon name="chat" size="20px" />
          </div>
          <div class="header-info">
            <div class="ai-name">AI智能助手</div>
            <div class="ai-status">
              <div class="status-dot"></div>
              <span>在线服务</span>
            </div>
          </div>
        </div>
        <t-button
          theme="default"
          variant="text"
          size="small"
          @click="toggleChat"
          class="close-btn"
        >
          <t-icon name="close" />
        </t-button>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-container">
        <!-- 欢迎消息 -->
        <div v-if="chatMessages.length === 0" class="welcome-section">
          <div class="welcome-avatar">
            <t-icon name="chat" size="40px" />
          </div>
          <h3>👋 您好！我是AI智能助手</h3>
          <p>我可以帮您：</p>
          <div class="feature-list">
            <div class="feature-item">🎵 推荐精彩节目</div>
            <div class="feature-item">❓ 回答相关问题</div>
            <div class="feature-item">💬 进行智能对话</div>
          </div>
          <div class="quick-questions">
            <div class="quick-title">快速开始：</div>
            <t-button
              v-for="question in quickQuestions"
              :key="question"
              theme="default"
              variant="outline"
              size="small"
              @click="sendQuickQuestion(question)"
              class="quick-btn"
            >
              {{ question }}
            </t-button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else class="messages-container" ref="messagesContainer">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="message-item"
            :class="message.role"
          >
            <div class="message-avatar">
              <t-icon v-if="message.role === 'user'" name="user" />
              <div v-else class="ai-avatar-small">
                <t-icon name="chat" size="16px" />
              </div>
            </div>
            <div class="message-bubble">
              <div class="message-content" v-html="formatMessageContent(message.content)"></div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>
          </div>

          <!-- 加载指示器 -->
          <div v-if="isLoading" class="loading-indicator">
            <div class="message-item assistant">
              <div class="message-avatar">
                <div class="ai-avatar-small">
                  <t-icon name="chat" size="16px" />
                </div>
              </div>
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-container">
          <div class="input-wrapper">
            <t-textarea
              v-model="inputMessage"
              placeholder="请输入您的问题..."
              :autosize="{ minRows: 1, maxRows: 4 }"
              :disabled="isLoading"
              @keydown.enter.exact.prevent="handleSend"
              class="chat-input"
            />
            <t-button
              theme="primary"
              @click="handleSend"
              :disabled="isLoading || !inputMessage.trim()"
              :loading="isLoading"
              class="send-button"
            >
              <t-icon name="send" />
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { chatApi } from '@/services/api'

// 消息格式
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: Date
}

const isOpen = ref(false)
const inputMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const chatId = ref(generateChatId())
const messagesContainer = ref<HTMLElement>()

// 快速问题
const quickQuestions = ref([
  '推荐一些好听的节目',
  '如何使用这个平台？',
  '有什么新的节目吗？'
])

// 生成聊天会话ID
function generateChatId(): string {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
}

// 切换聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送消息处理
const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: message,
    time: new Date()
  })

  inputMessage.value = ''
  isLoading.value = true

  // 滚动到底部
  await scrollToBottom()

  try {
    // 创建AI消息对象（用于流式更新）
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      time: new Date()
    }
    chatMessages.value.push(aiMessage)
    await scrollToBottom()

    // 调用AI API
    const stream = await chatApi.sendMessage(message, chatId.value)

    if (stream) {
      // 处理流式响应
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          aiMessage.content += chunk

          // 触发响应式更新并滚动
          await nextTick()
          await scrollToBottom()
        }
      } finally {
        reader.releaseLock()
      }
    }
  } catch (error: any) {
    console.error('发送消息失败:', error)
    MessagePlugin.error('发送消息失败，请稍后重试')

    // 移除空的AI消息
    if (chatMessages.value.length > 0 && chatMessages.value[chatMessages.value.length - 1].content === '') {
      chatMessages.value.pop()
    }

    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，我现在无法回复。请稍后再试。',
      time: new Date()
    })
    await scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

// 快速问题发送
const sendQuickQuestion = (question: string) => {
  inputMessage.value = question
  handleSend()
}

// 格式化消息内容（支持简单的markdown）
const formatMessageContent = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 暴露给父组件的方法
defineExpose({
  toggleChat,
  sendQuickQuestion
})
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 1000;
}

/* AI助手触发按钮 */
.ai-chat-trigger {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  min-width: 140px;
  overflow: hidden;
}

.ai-chat-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
}

.ai-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-text {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.ai-subtitle {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1;
}

.ai-pulse {
  position: absolute;
  top: 50%;
  left: 22px;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
}

/* AI聊天窗口 */
.ai-chat-window {
  width: 420px;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 聊天头部 */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.chat-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.close-btn {
  color: white !important;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* 聊天容器 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  overflow: hidden;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 欢迎区域 */
.welcome-section {
  padding: 32px 24px;
  text-align: center;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.welcome-section h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
}

.welcome-section p {
  margin: 0 0 20px 0;
  color: #64748b;
  font-size: 14px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.feature-item {
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  text-align: left;
}

.quick-questions {
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.quick-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.quick-btn {
  margin: 4px;
  font-size: 12px;
  border-radius: 16px;
}

/* 消息样式 */
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease-out;
}

.message-item.user {
  flex-direction: row-reverse;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.message-item.user .message-avatar {
  background: #3b82f6;
  color: white;
}

.ai-avatar-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-bubble {
  max-width: 70%;
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.message-item.user .message-bubble {
  background: #3b82f6;
  color: white;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 6px;
}

/* 输入区域 */
.input-container {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
}

.send-button {
  flex-shrink: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
}

/* 加载指示器 */
.loading-indicator {
  margin-bottom: 16px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chatbot-container {
    right: 16px;
    bottom: 90px;
  }

  .ai-chat-window {
    width: calc(100vw - 32px);
    height: 500px;
  }

  .ai-chat-trigger {
    min-width: 120px;
    padding: 10px 16px;
  }

  .ai-text {
    font-size: 14px;
  }

  .ai-subtitle {
    font-size: 11px;
  }
}

</style>
