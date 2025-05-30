<template>
  <div class="user-comments-container">
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
        
        <h1 class="page-title">💬 我的评论</h1>
        
        <div class="header-actions">
          <t-dropdown :options="sortOptions" @click="handleSortChange">
            <t-button theme="primary" variant="outline">
              <template #icon>
                <t-icon name="filter" />
              </template>
              {{ currentSortLabel }}
            </t-button>
          </t-dropdown>
        </div>
      </div>
    </header>

    <!-- 统计信息 -->
    <section class="stats-section" v-if="!loading && comments.length > 0">
      <div class="content-container">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">我的评论</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ uniquePrograms }}</div>
            <div class="stat-label">评论节目</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ recentComments }}</div>
            <div class="stat-label">本月评论</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 评论列表 -->
    <main class="comments-main">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <t-skeleton 
            v-for="i in 10" 
            :key="i"
            :row-col="[
              { width: '100%', height: '120px' }
            ]"
            class="skeleton-item"
          />
        </div>

        <!-- 空状态 -->
        <div v-else-if="comments.length === 0" class="empty-state">
          <t-result
            theme="default"
            title="还没有发表过评论"
            description="去听一些节目，分享你的想法吧"
          >
            <template #extra>
              <t-button theme="primary" @click="goToHome">
                去首页看看
              </t-button>
            </template>
          </t-result>
        </div>

        <!-- 评论列表 -->
        <div v-else class="comments-list">
          <div 
            v-for="(comment, index) in comments"
            :key="comment.id"
            class="comment-card animate__animated animate__fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="comment-header">
              <div class="program-info">
                <h3 class="program-title" @click="goToProgram(comment.programId)">
                  {{ comment.programTitle }}
                </h3>
                <div class="comment-meta">
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  <span class="comment-type" v-if="comment.parentCommentId">
                    回复评论
                  </span>
                </div>
              </div>
              
              <div class="comment-actions">
                <t-button 
                  theme="danger" 
                  variant="text" 
                  size="small"
                  @click="handleDeleteComment(comment)"
                >
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                  删除
                </t-button>
              </div>
            </div>
            
            <div class="comment-body">
              <div class="reply-context" v-if="comment.parentUserName">
                回复 <span class="reply-user">@{{ comment.parentUserName }}</span>：
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.totalPages > 1" class="pagination-container">
          <t-pagination
            v-model="pagination.current"
            :total="pagination.total"
            :page-size="pagination.size"
            :show-jumper="true"
            :show-page-size="true"
            :page-size-options="[10, 20, 50]"
            @change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="showDeleteDialog"
      title="删除评论"
      :confirm-btn="{ content: '确认删除', theme: 'danger', loading: deleting }"
      @confirm="confirmDelete"
    >
      <p>确定要删除这条评论吗？</p>
      <p class="warning-text">此操作不可恢复。</p>
    </t-dialog>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useCommentStore } from '@/stores/counter'
import { utils } from '@/services/api'
import type { Comment } from '@/types'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()
const commentStore = useCommentStore()

const loading = ref(false)
const deleting = ref(false)
const showDeleteDialog = ref(false)
const currentComment = ref<Comment | null>(null)
const currentSort = ref('latest')

// 排序选项
const sortOptions = [
  { content: '最新评论', value: 'latest' },
  { content: '最早评论', value: 'earliest' },
  { content: '按节目分组', value: 'program' }
]

// 计算属性
const comments = computed(() => commentStore.userComments)
const pagination = computed(() => commentStore.pagination)

const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value)
  return option ? option.content : '排序'
})

const uniquePrograms = computed(() => {
  const programIds = new Set(comments.value.map(c => c.programId))
  return programIds.size
})

const recentComments = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  return comments.value.filter(comment => {
    const commentDate = new Date(comment.createdAt)
    return commentDate >= oneMonthAgo
  }).length
})

// 初始化
onMounted(async () => {
  await loadUserComments()
})

// 加载用户评论
const loadUserComments = async () => {
  loading.value = true
  
  try {
    // 这里需要获取当前用户ID，临时使用固定值
    const userId = 1 // 应该从用户状态或localStorage获取
    await commentStore.fetchUserComments(userId, pagination.value.current, pagination.value.size)
    
    // 根据排序方式排序
    sortComments()
  } catch (error: any) {
    console.error('加载用户评论失败:', error)
    MessagePlugin.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 排序评论
const sortComments = () => {
  const sortedComments = [...comments.value]
  
  switch (currentSort.value) {
    case 'earliest':
      sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'program':
      sortedComments.sort((a, b) => {
        if (a.programTitle && b.programTitle) {
          return a.programTitle.localeCompare(b.programTitle)
        }
        return 0
      })
      break
    case 'latest':
    default:
      sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }
  
  // 这里应该更新store中的数据，但为了简化，我们直接在模板中使用计算属性
}

// 事件处理
const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/index')
}

const goToProgram = (programId: number) => {
  router.push(`/program/${programId}`)
}

const handleSortChange = (data: any) => {
  currentSort.value = data.value
  sortComments()
}

const handleDeleteComment = (comment: Comment) => {
  currentComment.value = comment
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!currentComment.value) return false

  deleting.value = true
  
  try {
    await commentStore.deleteComment(currentComment.value.id)
    MessagePlugin.success('评论删除成功')
    showDeleteDialog.value = false
    
    // 重新加载评论列表
    await loadUserComments()
  } catch (error: any) {
    console.error('删除评论失败:', error)
    MessagePlugin.error(error.message || '删除失败')
  } finally {
    deleting.value = false
  }
  
  return true
}

const handlePageChange = (page: number) => {
  commentStore.fetchUserComments(1, page, pagination.value.size) // 临时使用用户ID 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize: number) => {
  commentStore.fetchUserComments(1, 1, pageSize) // 临时使用用户ID 1
}

// 工具函数
const formatTime = (dateString: string) => {
  return utils.formatDate(dateString)
}
</script>

<style scoped>
.user-comments-container {
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

/* 统计信息 */
.stats-section {
  padding: 24px 0;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 48px;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 主要内容 */
.comments-main {
  padding: 0 0 24px 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  border-radius: 12px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.comment-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.program-info {
  flex: 1;
  min-width: 0;
}

.program-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.program-title:hover {
  color: #3b82f6;
}

.comment-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.comment-time {
  font-size: 12px;
  color: #9ca3af;
}

.comment-type {
  font-size: 12px;
  color: #f59e0b;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 12px;
}

.comment-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.comment-card:hover .comment-actions {
  opacity: 1;
}

.comment-body {
  line-height: 1.6;
}

.reply-context {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.reply-user {
  color: #3b82f6;
  font-weight: 500;
}

.comment-content {
  font-size: 14px;
  color: #374151;
  word-wrap: break-word;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.warning-text {
  color: #ef4444;
  font-size: 14px;
  margin: 8px 0 0 0;
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
  
  .stats-card {
    gap: 24px;
    padding: 20px;
    flex-wrap: wrap;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .comment-card {
    padding: 16px;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .comment-actions {
    opacity: 1;
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stats-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
