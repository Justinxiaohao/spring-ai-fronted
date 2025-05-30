<template>
  <div class="play-history-container">
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
        
        <h1 class="page-title">🕒 播放历史</h1>
        
        <div class="header-actions">
          <t-button 
            theme="danger" 
            variant="outline"
            @click="showClearDialog = true"
            v-if="programs.length > 0"
          >
            <template #icon>
              <t-icon name="delete" />
            </template>
            清空历史
          </t-button>
        </div>
      </div>
    </header>

    <!-- 统计信息 -->
    <section class="stats-section" v-if="!loading && programs.length > 0">
      <div class="content-container">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ pagination.total }}</div>
            <div class="stat-label">播放记录</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalDuration }}</div>
            <div class="stat-label">累计时长</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ uniquePrograms }}</div>
            <div class="stat-label">不同节目</div>
          </div>
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
            title="还没有播放记录"
            description="开始收听一些节目吧"
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
            :key="`${program.id}-${index}`"
            :program="program"
            class="animate__animated animate__fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
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

    <!-- 清空历史确认对话框 -->
    <t-dialog
      v-model:visible="showClearDialog"
      title="清空播放历史"
      :confirm-btn="{ content: '确认清空', theme: 'danger' }"
      @confirm="clearHistory"
    >
      <p>确定要清空所有播放历史吗？此操作不可恢复。</p>
    </t-dialog>

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
const showClearDialog = ref(false)

// 分页信息
const pagination = ref({
  current: 1,
  size: 12,
  total: 0
})

// 计算属性
const totalDuration = computed(() => {
  const total = programs.value.reduce((sum, program) => sum + program.durationSeconds, 0)
  return utils.formatDuration(total)
})

const uniquePrograms = computed(() => {
  const uniqueIds = new Set(programs.value.map(p => p.id))
  return uniqueIds.size
})

// 初始化
onMounted(async () => {
  await loadPlayHistory()
})

// 加载播放历史
const loadPlayHistory = async () => {
  loading.value = true
  
  try {
    const response = await userApi.getPlayHistory(
      pagination.value.current,
      pagination.value.size
    )
    
    if (response.success) {
      programs.value = response.data.records
      pagination.value = {
        current: response.data.current,
        size: response.data.size,
        total: response.data.total
      }
    } else {
      throw new Error(response.message || '加载失败')
    }
  } catch (error: any) {
    console.error('加载播放历史失败:', error)
    MessagePlugin.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 清空历史
const clearHistory = async () => {
  try {
    // 这里应该调用清空历史的API
    // const response = await userApi.clearPlayHistory()
    
    // 临时实现：直接清空本地数据
    programs.value = []
    pagination.value.total = 0
    showClearDialog.value = false
    MessagePlugin.success('播放历史已清空')
  } catch (error: any) {
    console.error('清空历史失败:', error)
    MessagePlugin.error(error.message || '清空失败')
  }
}

// 事件处理
const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/index')
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadPlayHistory()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.size = pageSize
  pagination.value.current = 1
  loadPlayHistory()
}
</script>

<style scoped>
.play-history-container {
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
  color: #3b82f6;
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
    flex-wrap: wrap;
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
