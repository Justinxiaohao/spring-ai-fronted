<template>
  <div class="comment-list-container">
    <!-- 评论统计 -->
    <div class="comment-stats">
      <h3 class="stats-title">
        <t-icon name="chat" />
        评论 ({{ pagination.total }})
      </h3>
      <div class="stats-actions">
        <t-button
          theme="primary"
          variant="outline"
          size="small"
          @click="refreshComments"
          :loading="loading"
        >
          <template #icon>
            <t-icon name="refresh" />
          </template>
          刷新
        </t-button>
        <t-button
          theme="default"
          variant="outline"
          size="small"
          @click="simpleRefresh"
        >
          <template #icon>
            <t-icon name="refresh" />
          </template>
          简单刷新
        </t-button>
      </div>
    </div>

    <!-- 发表评论 -->
    <div class="comment-form" v-if="canComment">
      <div class="form-header">
        <div class="user-avatar">
          <img 
            :src="currentUserAvatar" 
            alt="我的头像"
            class="avatar-image"
            @error="handleAvatarError"
          />
        </div>
        <div class="form-content">
          <t-textarea
            v-model="commentContent"
            placeholder="写下你的评论..."
            :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 6 }"
            class="comment-textarea"
          />
          <div class="form-actions">
            <div class="char-count">
              {{ commentContent.length }}/500
            </div>
            <div class="button-group">
              <t-button
                theme="primary"
                @click="submitComment"
                :loading="submitting"
                :disabled="!commentContent || !commentContent.trim() || submitting"
              >
                {{ submitting ? '发表中...' : '发表评论' }}
              </t-button>
              <t-button
                theme="default"
                variant="outline"
                @click="debugCommentState"
                size="small"
              >
                调试
              </t-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录提示 -->
    <div class="login-prompt" v-else>
      <t-alert theme="info" message="请登录后发表评论" />
    </div>

    <!-- 评论列表 -->
    <div class="comments-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <t-skeleton 
          v-for="i in 5" 
          :key="i"
          :row-col="[
            { width: '40px', height: '40px', type: 'circle' },
            { width: '100%', height: '20px' },
            { width: '80%', height: '16px' },
            { width: '60%', height: '16px' }
          ]"
          class="comment-skeleton"
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!comments || comments.length === 0" class="empty-comments">
        <t-result
          theme="default"
          title="暂无评论"
          description="成为第一个评论的人吧"
        >
          <template #icon>
            <t-icon name="chat" size="48px" />
          </template>
        </t-result>
      </div>

      <!-- 评论列表 -->
      <div v-else class="comments-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @delete="handleCommentDelete"
          class="animate__animated animate__fadeInUp"
        />
      </div>

      <!-- 分页 -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination-container">
        <t-pagination
          v-model="pagination.current"
          :total="pagination.total"
          :page-size="pagination.size"
          :show-jumper="true"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useCommentStore } from '@/stores/counter'
import { utils, userApi } from '@/services/api'
import type { Comment, UserInfo } from '@/types'
import CommentItem from './CommentItem.vue'

interface Props {
  programId: number
}

const props = defineProps<Props>()

const commentStore = useCommentStore()
const commentContent = ref('')
const currentUser = ref<UserInfo | null>(null)

// 计算属性
const comments = computed(() => {
  const storeComments = commentStore.currentProgramComments
  return Array.isArray(storeComments) ? storeComments : []
})

const loading = computed(() => commentStore.loading || false)
const submitting = computed(() => commentStore.submitting || false)

const pagination = computed(() => {
  const storePagination = commentStore.pagination
  return storePagination || {
    current: 1,
    size: 10,
    total: 0,
    totalPages: 0
  }
})

const canComment = computed(() => {
  return !!localStorage.getItem('userEmail')
})

const currentUserAvatar = computed(() => {
  return utils.getAvatarUrl(currentUser.value?.avatar)
})

// 加载用户信息
const loadUserInfo = async () => {
  if (!canComment.value) return

  try {
    const response = await userApi.getUserInfo()
    if (response.success && response.data) {
      currentUser.value = response.data
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 加载评论
const loadComments = async () => {
  if (!props.programId) return

  try {
    await commentStore.fetchProgramComments(props.programId, 1, 10)
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 刷新评论
const refreshComments = async () => {
  if (!props.programId) return

  try {
    console.log('开始刷新评论，节目ID:', props.programId)
    console.log('刷新前评论数量:', comments.value.length)

    // 直接重新加载评论，不需要手动清空状态
    // fetchProgramComments 方法会在第一页时自动清空状态
    await commentStore.fetchProgramComments(props.programId, 1, 10)

    // 等待一个tick确保响应式更新完成
    await nextTick()

    console.log('刷新评论完成，当前评论数量:', comments.value.length)
    console.log('当前store状态:', {
      currentProgramComments: commentStore.currentProgramComments,
      pagination: commentStore.pagination,
      loading: commentStore.loading,
      error: commentStore.error
    })

    MessagePlugin.success('评论已刷新')
  } catch (error) {
    console.error('刷新评论失败:', error)
    MessagePlugin.error('刷新失败，请稍后重试')
  }
}

// 简单刷新方法（用于测试）
const simpleRefresh = async () => {
  if (!props.programId) return

  try {
    console.log('=== 简单刷新开始 ===')
    console.log('节目ID:', props.programId)
    console.log('刷新前状态:', {
      commentsLength: comments.value.length,
      storeComments: commentStore.currentProgramComments.length,
      pagination: commentStore.pagination
    })

    // 直接调用loadComments方法
    await loadComments()

    console.log('刷新后状态:', {
      commentsLength: comments.value.length,
      storeComments: commentStore.currentProgramComments.length,
      pagination: commentStore.pagination
    })
    console.log('=== 简单刷新结束 ===')

    MessagePlugin.success('简单刷新完成')
  } catch (error) {
    console.error('简单刷新失败:', error)
    MessagePlugin.error('简单刷新失败')
  }
}

// 监听节目ID变化
watch(() => props.programId, (newProgramId, oldProgramId) => {
  if (newProgramId && newProgramId !== oldProgramId) {
    // 清空当前评论状态
    commentStore.clearCurrentProgramComments()
    // 加载新节目的评论
    loadComments()
  }
}, { immediate: true })

// 初始化
onMounted(async () => {
  await loadUserInfo()
  await loadComments()
})

// 发表评论
const submitComment = async () => {
  console.log('submitComment 被调用')
  console.log('评论内容:', commentContent.value)
  console.log('评论内容长度:', commentContent.value.length)
  console.log('trim后内容:', commentContent.value.trim())

  if (!commentContent.value.trim()) {
    console.log('评论内容为空，返回')
    MessagePlugin.warning('请输入评论内容')
    return
  }

  // 检查用户登录状态
  const userEmail = localStorage.getItem('userEmail')
  console.log('用户邮箱:', userEmail)

  if (!userEmail) {
    MessagePlugin.warning('请先登录后再发表评论')
    return
  }

  // 检查programId
  console.log('节目ID:', props.programId)
  if (!props.programId) {
    MessagePlugin.error('节目ID无效')
    return
  }

  try {
    console.log('开始发表评论...', {
      programId: props.programId,
      content: commentContent.value.trim(),
      userEmail,
      canComment: canComment.value,
      submitting: submitting.value
    })

    // 发表评论
    const newComment = await commentStore.createComment(
      props.programId,
      commentContent.value.trim()
    )

    console.log('评论发表成功', newComment)

    // 清空输入框
    commentContent.value = ''

    // 显示成功消息
    MessagePlugin.success('评论发表成功')

    // 注意：不需要重新加载评论列表，因为 store 已经更新了本地状态
    console.log('当前评论列表长度:', comments.value.length)
  } catch (error: any) {
    console.error('发表评论失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // 根据错误类型提供具体的错误信息
    if (error.message?.includes('401') || error.message?.includes('认证')) {
      MessagePlugin.error('用户认证失败，请重新登录')
    } else if (error.message?.includes('403') || error.message?.includes('权限')) {
      MessagePlugin.error('没有权限发表评论')
    } else if (error.message?.includes('404')) {
      MessagePlugin.error('节目不存在')
    } else if (error.message?.includes('500')) {
      MessagePlugin.error('服务器错误，请稍后重试')
    } else {
      MessagePlugin.error(error.message || '发表评论失败，请检查网络连接')
    }
  }
}

// 处理评论删除
const handleCommentDelete = (commentId: number) => {
  // 评论已在 CommentItem 中处理删除，这里可以做额外处理
  console.log('评论已删除:', commentId)
}

// 处理分页变化
const handlePageChange = (page: number) => {
  commentStore.fetchProgramComments(props.programId, page, pagination.value.size)
  
  // 滚动到评论区域顶部
  const container = document.querySelector('.comment-list-container')
  if (container) {
    container.scrollIntoView({ behavior: 'smooth' })
  }
}

// 头像错误处理
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 使用工具函数获取默认头像
  target.src = utils.getAvatarUrl()
}

// 调试函数
const debugCommentState = () => {
  const commentsArray = comments.value || []
  const paginationData = pagination.value || {}

  const debugInfo = {
    programId: props.programId,
    commentContent: commentContent.value,
    commentContentLength: commentContent.value.length,
    commentContentTrimmed: commentContent.value.trim(),
    commentContentTrimmedLength: commentContent.value.trim().length,
    canComment: canComment.value,
    submitting: submitting.value,
    loading: loading.value,
    userEmail: localStorage.getItem('userEmail'),
    currentUser: currentUser.value,
    currentUserAvatar: currentUserAvatar.value,
    buttonDisabled: !commentContent.value || !commentContent.value.trim() || submitting.value,
    commentsCount: commentsArray.length,
    commentsArray: commentsArray,
    // 添加头像调试信息
    avatarDebug: commentsArray.map(comment => ({
      id: comment.id,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      avatarUrl: utils.getAvatarUrl(comment.userAvatar)
    })),
    pagination: paginationData,
    storeState: {
      currentProgramComments: commentStore.currentProgramComments,
      loading: commentStore.loading,
      submitting: commentStore.submitting,
      error: commentStore.error
    }
  }

  console.log('评论组件调试信息:', debugInfo)
  MessagePlugin.info('调试信息已输出到控制台')
}
</script>

<style scoped>
.comment-list-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.comment-stats {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.stats-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.comment-form {
  margin-bottom: 32px;
}

.form-header {
  display: flex;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-textarea {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.comment-textarea:focus {
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
}

.login-prompt {
  margin-bottom: 24px;
}

.comments-container {
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-skeleton {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.empty-comments {
  padding: 40px 20px;
  text-align: center;
}

.comments-list {
  margin-bottom: 24px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
}

/* 动画延迟 */
.animate__fadeInUp:nth-child(1) { animation-delay: 0.1s; }
.animate__fadeInUp:nth-child(2) { animation-delay: 0.2s; }
.animate__fadeInUp:nth-child(3) { animation-delay: 0.3s; }
.animate__fadeInUp:nth-child(4) { animation-delay: 0.4s; }
.animate__fadeInUp:nth-child(5) { animation-delay: 0.5s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-list-container {
    padding: 16px;
    border-radius: 8px;
  }
  
  .form-header {
    gap: 8px;
  }
  
  .avatar-image {
    width: 36px;
    height: 36px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .char-count {
    text-align: center;
  }
}
</style>
