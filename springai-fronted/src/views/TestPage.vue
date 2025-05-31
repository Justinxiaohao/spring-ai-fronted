<template>
  <div class="test-page">
    <div class="container">
      <h1>功能测试页面</h1>
      
      <!-- 评论功能测试 -->
      <section class="test-section">
        <h2>评论功能测试</h2>
        <div class="test-controls">
          <t-input v-model="testProgramId" placeholder="输入节目ID" />
          <t-button @click="testCommentFunction" theme="primary">测试评论功能</t-button>
        </div>
        
        <div v-if="testProgramId" class="comment-test">
          <CommentList :program-id="parseInt(testProgramId)" />
        </div>
      </section>
      
      <!-- 路由跳转测试 -->
      <section class="test-section">
        <h2>路由跳转测试</h2>
        <div class="test-controls">
          <t-button @click="testRouteNavigation('latest')" theme="primary">
            测试"查看更多"(最新节目)
          </t-button>
          <t-button @click="testRouteNavigation('hot')" theme="success">
            测试"查看更多"(热门节目)
          </t-button>
          <t-button @click="testRouteNavigation('featured')" theme="warning">
            测试"查看更多"(精选节目)
          </t-button>
        </div>
      </section>
      
      <!-- API测试 -->
      <section class="test-section">
        <h2>API测试</h2>
        <div class="test-controls">
          <t-button @click="testUserEmail" theme="primary">检查用户邮箱</t-button>
          <t-button @click="testApiConnection" theme="success">测试API连接</t-button>
        </div>
        
        <div class="test-results">
          <h3>测试结果：</h3>
          <pre>{{ testResults }}</pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { userApi, programApi } from '@/services/api'
import CommentList from '@/components/CommentList.vue'

const router = useRouter()
const testProgramId = ref('1')
const testResults = ref('')

const testCommentFunction = () => {
  console.log('测试评论功能，节目ID:', testProgramId.value)
  MessagePlugin.info(`正在测试节目ID ${testProgramId.value} 的评论功能`)
}

const testRouteNavigation = (type: string) => {
  console.log('测试路由跳转:', type)
  MessagePlugin.info(`正在跳转到 /programs?type=${type}`)
  router.push(`/programs?type=${type}`)
}

const testUserEmail = () => {
  const userEmail = localStorage.getItem('userEmail')
  const result = {
    userEmail,
    hasEmail: !!userEmail,
    timestamp: new Date().toISOString()
  }
  testResults.value = JSON.stringify(result, null, 2)
  console.log('用户邮箱测试结果:', result)
}

const testApiConnection = async () => {
  try {
    testResults.value = '正在测试API连接...'
    
    // 测试用户信息API
    const userResponse = await userApi.getUserInfo()
    
    // 测试节目列表API
    const programResponse = await programApi.getPrograms({ limit: 1 })
    
    const result = {
      userApi: {
        success: userResponse.success,
        message: userResponse.message,
        hasData: !!userResponse.data
      },
      programApi: {
        success: programResponse.success,
        message: programResponse.message,
        hasData: !!programResponse.data
      },
      timestamp: new Date().toISOString()
    }
    
    testResults.value = JSON.stringify(result, null, 2)
    console.log('API连接测试结果:', result)
    
    if (userResponse.success && programResponse.success) {
      MessagePlugin.success('API连接测试成功')
    } else {
      MessagePlugin.warning('API连接测试部分失败')
    }
  } catch (error: any) {
    const errorResult = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
    testResults.value = JSON.stringify(errorResult, null, 2)
    console.error('API连接测试失败:', error)
    MessagePlugin.error('API连接测试失败')
  }
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.test-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.comment-test {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.test-results {
  margin-top: 16px;
}

.test-results pre {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
