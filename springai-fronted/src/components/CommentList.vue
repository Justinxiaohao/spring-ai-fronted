<template>
  <div class="comment-list-container">
    <!-- 评论统计 -->
    <div class="comment-stats">
      <h3 class="stats-title">
        <t-icon name="chat" />
        评论 ({{ pagination.total }})
      </h3>
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
            <t-button 
              theme="primary"
              @click="submitComment"
              :loading="submitting"
              :disabled="!commentContent.trim()"
            >
              发表评论
            </t-button>
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
      <div v-else-if="comments.length === 0" class="empty-comments">
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
      <div v-if="pagination.totalPages > 1" class="pagination-container">
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
import { ref, computed, onMounted, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useCommentStore } from '@/stores/counter'
import type { Comment } from '@/types'
import CommentItem from './CommentItem.vue'

interface Props {
  programId: number
}

const props = defineProps<Props>()

const commentStore = useCommentStore()
const commentContent = ref('')

// 计算属性
const comments = computed(() => commentStore.currentProgramComments)
const loading = computed(() => commentStore.loading)
const submitting = computed(() => commentStore.submitting)
const pagination = computed(() => commentStore.pagination)

const canComment = computed(() => {
  return !!localStorage.getItem('userEmail')
})

const currentUserAvatar = computed(() => {
  return '/default-avatar.jpg'
})

// 监听节目ID变化
watch(() => props.programId, (newProgramId) => {
  if (newProgramId) {
    loadComments()
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  loadComments()
})

// 加载评论
const loadComments = async () => {
  if (!props.programId) return
  
  try {
    await commentStore.fetchProgramComments(props.programId, 1, 10)
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 发表评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return

  try {
    await commentStore.createComment(
      props.programId,
      commentContent.value.trim()
    )
    
    commentContent.value = ''
    MessagePlugin.success('评论发表成功')
  } catch (error: any) {
    MessagePlugin.error(error.message || '发表评论失败')
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
  target.src = '/default-avatar.jpg'
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
