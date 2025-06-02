<template>
  <div class="liked-programs-container">
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
        
        <h1 class="page-title">💖 我的喜欢</h1>
        
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
    <section class="stats-section" v-if="!loading && programs.length > 0">
      <div class="content-container">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">喜欢的节目</div>
          </div>
          <!-- <div class="stat-item">
            <div class="stat-number">{{ totalDuration }}</div>
            <div class="stat-label">总时长</div>
          </div> -->
        </div>
      </div>
    </section>

    <!-- 节目列表 -->
    <main class="programs-main">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-grid">
          <t-skeleton 
            v-for="i in 12" 
            :key="i"
            :row-col="[{ width: '100%', height: '200px' }]"
            class="skeleton-item"
          />
        </div>

        <!-- 空状态 -->
        <div v-else-if="programs.length === 0" class="empty-state">
          <t-result
            theme="default"
            title="还没有喜欢的节目"
            description="去发现一些有趣的节目吧"
          >
            <template #extra>
              <t-button theme="primary" @click="goToHome">
                去首页看看
              </t-button>
            </template>
          </t-result>
        </div>

        <!-- 节目网格 -->
        <div v-else class="programs-grid">
          <ProgramCard
            v-for="(program, index) in programs"
            :key="program.id"
            :program="program"
            class="animate__animated animate__fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @like-changed="handleLikeChanged"
          />
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > pagination.size" class="pagination-container">
          <t-pagination
            v-model="pagination.current"
            :total="pagination.total"
            :page-size="pagination.size"
            :show-jumper="true"
            :show-page-size="true"
            :page-size-options="[12, 24, 48]"
            @change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </main>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { userApi, utils } from '@/services/api'
import type { Program } from '@/types'
import ProgramCard from '@/components/ProgramCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()

const programs = ref<Program[]>([])
const loading = ref(false)
const currentSort = ref('latest')

// 分页信息
const pagination = ref({
  current: 1,
  size: 12,
  total: 0
})

// 排序选项
const sortOptions = [
  { content: '最近喜欢', value: 'latest' },
  { content: '最多播放', value: 'plays' },
  { content: '时长最长', value: 'duration' },
  { content: '时长最短', value: 'duration_asc' }
]

// 计算属性
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value)
  return option ? option.content : '排序'
})

const totalDuration = computed(() => {
  const total = programs.value.reduce((sum, program) => sum + program.durationSeconds, 0)
  return utils.formatDuration(total)
})

// 初始化
onMounted(async () => {
  // 检查用户登录状态
  const userEmail = localStorage.getItem('userEmail')
  if (!userEmail) {
    MessagePlugin.warning('请先登录')
    router.push('/login')
    return
  }

  await loadLikedPrograms()
})

// 加载喜欢的节目
const loadLikedPrograms = async () => {
  loading.value = true

  try {
    console.log('正在加载喜欢的节目...')
    const response = await userApi.getLikedPrograms(
      pagination.value.current,
      pagination.value.size
    )
    console.log('喜欢节目响应:', response)

    if (response.success && response.data) {
      programs.value = response.data.records || []
      pagination.value = {
        current: response.data.current || 1,
        size: response.data.size || 12,
        total: response.data.total || 0
      }

      // 根据排序方式排序
      sortPrograms()
    } else {
      if (response.code === 404) {
        // 用户不存在或未登录
        MessagePlugin.error('用户信息不存在，请重新登录')
        setTimeout(() => {
          localStorage.removeItem('userEmail')
          router.push('/login')
        }, 2000)
        return
      }
      throw new Error(response.message || '加载失败')
    }
  } catch (error: any) {
    console.error('加载喜欢的节目失败:', error)

    // 根据错误类型显示不同的提示
    if (error.message.includes('HTTP error! status: 404')) {
      MessagePlugin.error('用户信息不存在，请重新登录')
      setTimeout(() => {
        localStorage.removeItem('userEmail')
        router.push('/login')
      }, 2000)
    } else if (error.message.includes('HTTP error! status: 401')) {
      MessagePlugin.error('用户认证失败，请重新登录')
      setTimeout(() => {
        localStorage.removeItem('userEmail')
        router.push('/login')
      }, 2000)
    } else {
      MessagePlugin.error(error.message || '加载喜欢的节目失败')
    }
  } finally {
    loading.value = false
  }
}

// 排序节目
const sortPrograms = () => {
  switch (currentSort.value) {
    case 'plays':
      programs.value.sort((a, b) => b.playsCount - a.playsCount)
      break
    case 'duration':
      programs.value.sort((a, b) => b.durationSeconds - a.durationSeconds)
      break
    case 'duration_asc':
      programs.value.sort((a, b) => a.durationSeconds - b.durationSeconds)
      break
    case 'latest':
    default:
      // 保持原有顺序（最近喜欢的在前）
      break
  }
}

// 事件处理
const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/index')
}

const handleSortChange = (data: any) => {
  currentSort.value = data.value
  sortPrograms()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadLikedPrograms()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.size = pageSize
  pagination.value.current = 1
  loadLikedPrograms()
}

const handleLikeChanged = (programId: number, isLiked: boolean) => {
  if (!isLiked) {
    // 如果取消喜欢，从列表中移除
    programs.value = programs.value.filter(p => p.id !== programId)
    pagination.value.total = Math.max(0, pagination.value.total - 1)
    
    // 如果当前页没有数据了，跳转到上一页
    if (programs.value.length === 0 && pagination.value.current > 1) {
      pagination.value.current -= 1
      loadLikedPrograms()
    }
  }
}
</script>

<style scoped>
.liked-programs-container {
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
  color: #e53e3e;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 主要内容 */
.programs-main {
  padding: 0 0 24px 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skeleton-item {
  border-radius: 12px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
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
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
