<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <div class="comment-avatar">
      <img 
        :src="avatarUrl" 
        :alt="comment.userName"
        class="avatar-image"
        @error="handleAvatarError"
      />
    </div>
    
    <div class="comment-content">
      <div class="comment-header">
        <div class="user-info">
          <span class="user-name">{{ comment.userName }}</span>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        </div>
        
        <div class="comment-actions" v-if="canDelete">
          <t-dropdown :options="actionOptions" @click="handleActionClick">
            <t-button theme="primary" variant="text" size="small">
              <template #icon>
                <t-icon name="more" />
              </template>
            </t-button>
          </t-dropdown>
        </div>
      </div>
      
      <div class="comment-body">
        <div class="reply-to" v-if="comment.parentUserName">
          回复 <span class="reply-user">@{{ comment.parentUserName }}</span>：
        </div>
        <div class="comment-text">{{ comment.content }}</div>
      </div>
      
      <div class="comment-footer">
        <t-button 
          theme="primary" 
          variant="text" 
          size="small"
          @click="handleReplyClick"
          v-if="!isReply"
        >
          <template #icon>
            <t-icon name="chat" />
          </template>
          回复
        </t-button>
        
        <span class="reply-count" v-if="!isReply && comment.replyCount && comment.replyCount > 0">
          {{ comment.replyCount }} 条回复
        </span>
      </div>
      
      <!-- 回复输入框 -->
      <div class="reply-input-container" v-if="showReplyInput">
        <div class="reply-input">
          <t-textarea
            v-model="replyContent"
            placeholder="写下你的回复..."
            :maxlength="500"
            :autosize="{ minRows: 2, maxRows: 4 }"
            class="reply-textarea"
          />
          <div class="reply-actions">
            <t-button 
              theme="default" 
              variant="outline" 
              size="small"
              @click="cancelReply"
            >
              取消
            </t-button>
            <t-button 
              theme="primary" 
              size="small"
              @click="submitReply"
              :loading="submitting"
              :disabled="!replyContent.trim()"
            >
              发表回复
            </t-button>
          </div>
        </div>
      </div>
      
      <!-- 回复列表 -->
      <div class="replies-container" v-if="!isReply && comment.replies && comment.replies.length > 0">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :is-reply="true"
          @delete="handleReplyDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useCommentStore } from '@/stores/counter'
import { utils } from '@/services/api'
import type { Comment } from '@/types'

interface Props {
  comment: Comment
  isReply?: boolean
}

interface Emits {
  (e: 'delete', commentId: number): void
  (e: 'reply', parentCommentId: number, content: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false
})

const emit = defineEmits<Emits>()

const commentStore = useCommentStore()
const showReplyInput = ref(false)
const replyContent = ref('')
const submitting = ref(false)

// 计算属性
const avatarUrl = computed(() => {
  // 使用评论中的用户头像，如果没有则使用默认头像
  return utils.getAvatarUrl(props.comment.userAvatar)
})

const canDelete = computed(() => {
  // 这里应该检查当前用户是否可以删除评论
  // 临时实现：假设用户可以删除自己的评论
  const userEmail = localStorage.getItem('userEmail')
  return userEmail === props.comment.userEmail
})

const actionOptions = computed(() => {
  const options = []
  if (canDelete.value) {
    options.push({
      content: '删除评论',
      value: 'delete',
      theme: 'error'
    })
  }
  return options
})

// 事件处理
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-avatar.jpg'
}

const handleActionClick = (data: any) => {
  if (data.value === 'delete') {
    handleDelete()
  }
}

const handleDelete = async () => {
  try {
    await commentStore.deleteComment(props.comment.id)
    emit('delete', props.comment.id)
    MessagePlugin.success('评论删除成功')
  } catch (error: any) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

const handleReplyClick = () => {
  showReplyInput.value = true
}

const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return

  submitting.value = true
  
  try {
    await commentStore.createComment(
      props.comment.programId,
      replyContent.value.trim(),
      props.comment.id
    )
    
    MessagePlugin.success('回复发表成功')
    cancelReply()
  } catch (error: any) {
    MessagePlugin.error(error.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

const handleReplyDelete = (commentId: number) => {
  emit('delete', commentId)
}

// 工具函数
const formatTime = (dateString: string) => {
  return utils.formatDate(dateString)
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item.is-reply {
  padding: 12px 0;
  margin-left: 20px;
  border-bottom: 1px solid #f8f8f8;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.is-reply .avatar-image {
  width: 32px;
  height: 32px;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #9ca3af;
}

.comment-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.comment-item:hover .comment-actions {
  opacity: 1;
}

.comment-body {
  margin-bottom: 12px;
}

.reply-to {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.reply-user {
  color: #3b82f6;
  font-weight: 500;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  word-wrap: break-word;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reply-count {
  font-size: 12px;
  color: #9ca3af;
}

.reply-input-container {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.reply-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-textarea {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.replies-container {
  margin-top: 16px;
  border-left: 2px solid #f0f0f0;
  padding-left: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-item {
    gap: 8px;
    padding: 12px 0;
  }
  
  .avatar-image {
    width: 36px;
    height: 36px;
  }
  
  .is-reply .avatar-image {
    width: 28px;
    height: 28px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .comment-actions {
    opacity: 1;
  }
  
  .replies-container {
    padding-left: 12px;
  }
}
</style>
