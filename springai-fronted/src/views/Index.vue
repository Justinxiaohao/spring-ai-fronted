<template>
  <div class="index-container">
    <div class="header">
      <h1>欢迎回来！</h1>
      <div class="user-info">
        <t-icon name="user" size="24px" />
        <span>{{ userEmail }}</span>
        <t-button theme="primary" variant="outline" @click="logout">
          退出登录
        </t-button>
      </div>
    </div>
    
    <div class="content">
      <div class="welcome-card">
        <t-card>
          <h2>主页内容</h2>
          <p>您已成功登录到系统</p>
          <p>用户邮箱：{{ userEmail }}</p>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()
const userEmail = ref('')

onMounted(() => {
  const email = localStorage.getItem('userEmail')
  console.log(email)
  if (!email) {
    MessagePlugin.warning('请先登录')
    router.push('/login')
  } else {
    userEmail.value = email
  }
})

const logout = () => {
  localStorage.removeItem('userEmail')
  MessagePlugin.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  display: flex;
  justify-content: center;
}

.welcome-card {
  width: 100%;
  max-width: 600px;
}

.welcome-card :deep(.t-card) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
