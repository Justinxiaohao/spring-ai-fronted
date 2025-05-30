<template>
  <div class="user-profile-container">
    <!-- 顶部导航 -->
    <header class="page-header">
      <div class="header-content">
        <t-button 
          theme="primary" 
          variant="text" 
          @click="goBack"
        >
          <template #icon>
            <t-icon name="chevron-left" />
          </template>
          返回
        </t-button>
        
        <h1 class="page-title">个人中心</h1>
        
        <div class="header-actions">
          <t-button 
            theme="primary" 
            variant="outline"
            @click="showEditDialog = true"
          >
            <template #icon>
              <t-icon name="edit" />
            </template>
            编辑资料
          </t-button>
        </div>
      </div>
    </header>

    <!-- 用户信息卡片 -->
    <section class="user-info-section">
      <div class="content-container">
        <div class="user-card">
          <div class="user-avatar">
            <img
              :src="getAvatarUrl(userInfo?.avatar)"
              :alt="userInfo?.username || userInfo?.email"
              class="avatar-image"
            />
          </div>
          
          <div class="user-details">
            <h2 class="user-name">{{ userInfo?.username || '未设置用户名' }}</h2>
            <p class="user-email">{{ userInfo?.email }}</p>
            <p class="user-bio" v-if="userInfo?.bio">{{ userInfo.bio }}</p>
            <p class="user-join-date">
              加入时间：{{ formatDate(userInfo?.createdAt || '') }}
            </p>
          </div>
          
          <div class="user-stats" v-if="userInfo">
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.likedProgramsCount || 0 }}</div>
              <div class="stat-label">喜欢节目</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.playlistsCount || 0 }}</div>
              <div class="stat-label">我的歌单</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ userInfo.commentsCount || 0 }}</div>
              <div class="stat-label">我的评论</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="menu-section">
      <div class="content-container">
        <div class="menu-grid">
          <div class="menu-item" @click="goToPlaylists">
            <div class="menu-icon">
              <t-icon name="queue-music" size="24px" />
            </div>
            <div class="menu-content">
              <h3 class="menu-title">我的歌单</h3>
              <p class="menu-desc">管理我的歌单</p>
            </div>
            <t-icon name="chevron-right" class="menu-arrow" />
          </div>

          <div class="menu-item" @click="goToLikedPrograms">
            <div class="menu-icon">
              <t-icon name="heart-filled" size="24px" />
            </div>
            <div class="menu-content">
              <h3 class="menu-title">我的喜欢</h3>
              <p class="menu-desc">查看喜欢的节目</p>
            </div>
            <t-icon name="chevron-right" class="menu-arrow" />
          </div>

          <div class="menu-item" @click="goToComments">
            <div class="menu-icon">
              <t-icon name="chat" size="24px" />
            </div>
            <div class="menu-content">
              <h3 class="menu-title">我的评论</h3>
              <p class="menu-desc">查看我的评论</p>
            </div>
            <t-icon name="chevron-right" class="menu-arrow" />
          </div>

          <div class="menu-item" @click="goToPlayHistory">
            <div class="menu-icon">
              <t-icon name="time" size="24px" />
            </div>
            <div class="menu-content">
              <h3 class="menu-title">播放历史</h3>
              <p class="menu-desc">查看播放记录</p>
            </div>
            <t-icon name="chevron-right" class="menu-arrow" />
          </div>
        
          <div class="menu-item" @click="logout">
            <div class="menu-icon">
              <t-icon name="logout" size="24px" />
            </div>
            <div class="menu-content">
              <h3 class="menu-title">退出登录</h3>
              <p class="menu-desc">安全退出账户</p>
            </div>
            <t-icon name="chevron-right" class="menu-arrow" />
          </div>
        </div>
      </div>
    </section>

    <!-- 编辑资料对话框 -->
    <t-dialog
      v-model:visible="showEditDialog"
      title="编辑个人资料"
      width="500px"
      :confirm-btn="{ content: '保存', loading: saving }"
      @confirm="saveUserInfo"
    >
      <t-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="80px"
      >
        <t-form-item label="用户名" name="nickname">
          <t-input v-model="editForm.nickname" placeholder="请输入用户名" />
        </t-form-item>
        
        <t-form-item label="头像" name="avatar">
          <div class="avatar-upload-section">
            <div class="avatar-preview">
              <img
                :src="avatarPreview || getAvatarUrl(userInfo?.avatar)"
                alt="头像预览"
                class="preview-image"
              />
            </div>
            <div class="upload-controls">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                style="display: none"
                @change="handleFileSelect"
              />
              <t-button
                theme="primary"
                variant="outline"
                :loading="uploading"
                @click="selectFile"
              >
                <template #icon>
                  <t-icon name="upload" />
                </template>
                {{ uploading ? '上传中...' : '选择头像' }}
              </t-button>
              <t-button
                v-if="avatarPreview || selectedFile"
                theme="default"
                variant="outline"
                @click="clearAvatar"
              >
                清除
              </t-button>
              <div class="upload-tips">
                <p>支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</p>
                <p v-if="selectedFile" class="file-info">
                  已选择：{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                </p>
              </div>
            </div>
          </div>
        </t-form-item>
        
        <t-form-item label="个人简介" name="bio">
          <t-textarea 
            v-model="editForm.bio" 
            placeholder="请输入个人简介"
            :maxlength="200"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { userApi, utils } from '@/services/api'
import type { UserInfo } from '@/types'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()

const userInfo = ref<UserInfo | null>(null)
const loading = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)
const formRef = ref()
const fileInputRef = ref()

// 头像上传相关
const selectedFile = ref<File | null>(null)
const avatarPreview = ref('')
const uploading = ref(false)

// 编辑表单
const editForm = reactive({
  nickname: '',
  avatar: '',
  bio: ''
})

// 表单验证规则
const formRules = {
  nickname: [
    { required: true, message: '请输入用户名', type: 'error' },
    { max: 50, message: '用户名不能超过50个字符', type: 'error' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', type: 'error' }
  ]
}

// 初始化
onMounted(async () => {
  await loadUserData()
})

// 加载用户数据
const loadUserData = async () => {
  loading.value = true

  try {
    // 检查是否有用户邮箱
    const userEmail = localStorage.getItem('userEmail')
    if (!userEmail) {
      throw new Error('用户未登录，请重新登录')
    }

    console.log('正在获取用户信息，邮箱:', userEmail)
    const userResponse = await userApi.getUserInfo()
    console.log('用户信息响应:', userResponse)

    if (userResponse.success && userResponse.data) {
      userInfo.value = userResponse.data
      // 填充编辑表单
      editForm.nickname = userResponse.data.username || ''
      editForm.avatar = userResponse.data.avatar || ''
      editForm.bio = userResponse.data.bio || ''

      console.log('用户信息加载成功:', userResponse.data)
    } else {
      // 处理各种错误情况
      if (userResponse.code === 404) {
        throw new Error('用户不存在，请检查登录状态或重新登录')
      } else if (userResponse.code === 401) {
        throw new Error('用户认证失败，请重新登录')
      } else {
        throw new Error(userResponse.message || '获取用户信息失败')
      }
    }
  } catch (error: any) {
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return false

  saving.value = true

  try {
    // 使用新的带头像上传的API
    const formData = new FormData()
    formData.append('username', editForm.nickname)
    formData.append('bio', editForm.bio)
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value)
    }
    console.log('更新用户信息，包含头像上传')
    const userEmail = localStorage.getItem('userEmail')

    // 构建API URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    // 确保baseUrl不以斜杠结尾
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const apiUrl = `${cleanBaseUrl}/api/me/update-with-avatar`
    console.log('Base URL:', baseUrl)
    console.log('Clean Base URL:', cleanBaseUrl)
    console.log('Final API URL:', apiUrl)
    console.log('用户邮箱:', userEmail)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'User-Email': userEmail || ''
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('更新响应:', result)

    if (result.success && result.data) {
      userInfo.value = result.data
      showEditDialog.value = false
      avatarPreview.value = ''
      selectedFile.value = null
      editForm.avatar = result.data.avatar || ''
      MessagePlugin.success('保存成功')
    } else {
      throw new Error(result.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存用户信息失败:', error)
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }

  return true
}

// 头像上传相关方法
const selectFile = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    MessagePlugin.error('只支持JPG、PNG、GIF格式的图片文件')
    return
  }

  // 验证文件大小（5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    MessagePlugin.error('文件大小不能超过5MB')
    return
  }

  selectedFile.value = file

  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearAvatar = () => {
  selectedFile.value = null
  avatarPreview.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取正确的头像URL
const getAvatarUrl = (avatar?: string): string => {
  return utils.getAvatarUrl(avatar)
}

// 事件处理
const goBack = () => {
  router.back()
}

const goToPlaylists = () => {
  router.push('/playlists')
}

const goToLikedPrograms = () => {
  router.push('/user/liked')
}

const goToComments = () => {
  router.push('/user/comments')
}

const goToPlayHistory = () => {
  router.push('/user/history')
}


const logout = () => {
  localStorage.removeItem('userEmail')
  MessagePlugin.success('已退出登录')
  router.push('/login')
}

// 工具函数
const formatDate = (dateString: string) => {
  return utils.formatDate(dateString)
}
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

/* 页面头部 */
.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 内容容器 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 用户信息区域 */
.user-info-section {
  padding: 32px 0;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 32px;
  align-items: center;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.user-email {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.user-bio {
  font-size: 14px;
  color: #374151;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.user-join-date {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 功能菜单 */
.menu-section {
  padding: 0 0 32px 0;
}

.menu-grid {
  display: grid;
  gap: 16px;
}

.menu-item {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.menu-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.menu-arrow {
  color: #9ca3af;
}

/* 头像上传样式 */
.avatar-upload-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.avatar-preview {
  flex-shrink: 0;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.upload-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-tips {
  margin-top: 8px;
}

.upload-tips p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.file-info {
  color: #059669 !important;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .page-title {
    text-align: center;
    font-size: 20px;
  }
  
  .content-container {
    padding: 0 16px;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
    gap: 24px;
  }
  
  .user-stats {
    justify-content: center;
    gap: 24px;
  }
  
  .menu-item {
    padding: 16px 20px;
  }
}
</style>
