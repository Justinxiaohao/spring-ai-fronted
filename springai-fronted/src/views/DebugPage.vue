<template>
  <div class="debug-page">
    <t-card title="API 调试页面" class="debug-card">
      <div class="debug-section">
        <h3>用户身份设置</h3>
        <t-space direction="vertical" style="width: 100%">
          <div class="user-email-section">
            <t-input
              v-model="testUserEmail"
              placeholder="输入测试用户邮箱"
              style="width: 300px;"
            />
            <t-button @click="setTestUserEmail" theme="primary">
              设置测试用户
            </t-button>
          </div>
          <div class="current-user">
            <strong>当前用户邮箱：</strong>
            <span>{{ currentUserEmail || '未设置' }}</span>
          </div>
        </t-space>
      </div>

      <div class="debug-section">
        <h3>API 连接测试</h3>
        <t-space direction="vertical" style="width: 100%">
          <t-button @click="testUserInfo" :loading="loading.user">
            测试获取用户信息 (/api/me)
          </t-button>
          <t-button @click="testPrograms" :loading="loading.programs">
            测试获取节目列表 (/api/programs)
          </t-button>
          <t-button @click="testProgramDetail" :loading="loading.detail">
            测试获取节目详情 (/api/programs/1)
          </t-button>
          <t-button @click="testSearch" :loading="loading.search">
            测试搜索功能 (/api/programs/search)
          </t-button>
          <t-button @click="testChat" :loading="loading.chat">
            测试AI聊天 (/ai/chat)
          </t-button>
        </t-space>
      </div>

      <div class="debug-section" v-if="results.length > 0">
        <h3>测试结果</h3>
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <t-tag :theme="result.success ? 'success' : 'danger'">
            {{ result.success ? '成功' : '失败' }}
          </t-tag>
          <span class="result-api">{{ result.api }}</span>
          <div class="result-details">
            <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userApi, programApi, searchApi, chatApi } from '@/services/api'
import { MessagePlugin } from 'tdesign-vue-next'

interface TestResult {
  api: string
  success: boolean
  data: any
  timestamp: string
}

const loading = ref({
  user: false,
  programs: false,
  detail: false,
  search: false,
  chat: false
})

const results = ref<TestResult[]>([])
const testUserEmail = ref('')
const currentUserEmail = ref(localStorage.getItem('userEmail') || '')

const addResult = (api: string, success: boolean, data: any) => {
  results.value.unshift({
    api,
    success,
    data,
    timestamp: new Date().toLocaleString()
  })
  
  // 只保留最近10条结果
  if (results.value.length > 10) {
    results.value = results.value.slice(0, 10)
  }
}

const testUserInfo = async () => {
  loading.value.user = true
  try {
    const response = await userApi.getUserInfo()
    addResult('GET /api/me', response.success, response)
    if (response.success) {
      MessagePlugin.success('用户信息获取成功')
    } else {
      MessagePlugin.error(`用户信息获取失败: ${response.message}`)
    }
  } catch (error: any) {
    addResult('GET /api/me', false, { error: error.message })
    MessagePlugin.error(`请求失败: ${error.message}`)
  } finally {
    loading.value.user = false
  }
}

const testPrograms = async () => {
  loading.value.programs = true
  try {
    const response = await programApi.getPrograms({ page: 1, limit: 5 })
    addResult('GET /api/programs', response.success, response)
    if (response.success) {
      MessagePlugin.success('节目列表获取成功')
    } else {
      MessagePlugin.error(`节目列表获取失败: ${response.message}`)
    }
  } catch (error: any) {
    addResult('GET /api/programs', false, { error: error.message })
    MessagePlugin.error(`请求失败: ${error.message}`)
  } finally {
    loading.value.programs = false
  }
}

const testProgramDetail = async () => {
  loading.value.detail = true
  try {
    const response = await programApi.getProgramDetail(1)
    addResult('GET /api/programs/1', response.success, response)
    if (response.success) {
      MessagePlugin.success('节目详情获取成功')
    } else {
      MessagePlugin.error(`节目详情获取失败: ${response.message}`)
    }
  } catch (error: any) {
    addResult('GET /api/programs/1', false, { error: error.message })
    MessagePlugin.error(`请求失败: ${error.message}`)
  } finally {
    loading.value.detail = false
  }
}

const testSearch = async () => {
  loading.value.search = true
  try {
    const response = await searchApi.searchPrograms({ q: '音乐', page: 1, limit: 5 })
    addResult('GET /api/programs/search', response.success, response)
    if (response.success) {
      MessagePlugin.success('搜索功能测试成功')
    } else {
      MessagePlugin.error(`搜索功能测试失败: ${response.message}`)
    }
  } catch (error: any) {
    addResult('GET /api/programs/search', false, { error: error.message })
    MessagePlugin.error(`请求失败: ${error.message}`)
  } finally {
    loading.value.search = false
  }
}

const testChat = async () => {
  loading.value.chat = true
  try {
    const testMessage = '你好，请介绍一下这个电台FM平台'
    const chatId = 'test_' + Date.now()

    const stream = await chatApi.sendMessage(testMessage, chatId)

    if (stream) {
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
        }
      } finally {
        reader.releaseLock()
      }

      addResult('GET /ai/chat', true, {
        prompt: testMessage,
        response: fullResponse,
        chatId: chatId
      })
      MessagePlugin.success('AI聊天测试成功')
    }
  } catch (error: any) {
    addResult('GET /ai/chat', false, { error: error.message })
    MessagePlugin.error(`AI聊天测试失败: ${error.message}`)
  } finally {
    loading.value.chat = false
  }
}

const setTestUserEmail = () => {
  if (testUserEmail.value.trim()) {
    localStorage.setItem('userEmail', testUserEmail.value.trim())
    currentUserEmail.value = testUserEmail.value.trim()
    MessagePlugin.success(`已设置测试用户邮箱: ${testUserEmail.value.trim()}`)
    testUserEmail.value = ''
  } else {
    MessagePlugin.error('请输入有效的邮箱地址')
  }
}
</script>

<style scoped>
.debug-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-card {
  margin-bottom: 24px;
}

.debug-section {
  margin-bottom: 32px;
}

.debug-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.user-email-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.current-user {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  color: #0369a1;
}

.result-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background: #fafafa;
}

.result-api {
  margin-left: 8px;
  font-weight: 500;
  color: #666;
}

.result-details {
  margin-top: 8px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.result-details pre {
  margin: 0;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
