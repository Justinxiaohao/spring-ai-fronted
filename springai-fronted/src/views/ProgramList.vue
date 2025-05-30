<template>
  <div class="program-list-container">
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
        
        <h1 class="page-title">{{ pageTitle }}</h1>
        
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

    <!-- 筛选器 -->
    <section class="filters-section">
      <div class="filters-content">
        <!-- 分类筛选 -->
        <div class="filter-group">
          <label class="filter-label">分类：</label>
          <div class="filter-options">
            <t-button
              v-for="category in categories"
              :key="category.id"
              :theme="selectedCategoryId === category.id ? 'primary' : 'default'"
              :variant="selectedCategoryId === category.id ? 'base' : 'outline'"
              size="small"
              @click="selectCategory(category.id)"
              class="filter-btn"
            >
              {{ category.name }}
            </t-button>
            <t-button
              :theme="selectedCategoryId === null ? 'primary' : 'default'"
              :variant="selectedCategoryId === null ? 'base' : 'outline'"
              size="small"
              @click="selectCategory(null)"
              class="filter-btn"
            >
              全部
            </t-button>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div class="filter-group">
          <label class="filter-label">标签：</label>
          <t-input
            v-model="tagFilter"
            placeholder="输入标签进行筛选..."
            clearable
            @enter="applyFilters"
            class="tag-input"
          >
            <template #suffix>
              <t-button theme="primary" variant="text" @click="applyFilters">
                <template #icon>
                  <t-icon name="search" />
                </template>
              </t-button>
            </template>
          </t-input>
        </div>
      </div>
    </section>

    <!-- 节目列表 -->
    <main class="programs-main">
      <div class="programs-content">
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
            title="暂无节目"
            description="没有找到符合条件的节目"
          >
            <template #extra>
              <t-button theme="primary" @click="resetFilters">
                重置筛选
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
          />
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-container">
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

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgramStore, useCategoryStore } from '@/stores/counter'
import type { ProgramQueryParams } from '@/types'
import ProgramCard from '@/components/ProgramCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const route = useRoute()
const router = useRouter()
const programStore = useProgramStore()
const categoryStore = useCategoryStore()

const selectedCategoryId = ref<number | null>(null)
const tagFilter = ref('')
const currentSort = ref<string>('createdAt_desc')

// 计算属性
const programs = computed(() => programStore.programs)
const pagination = computed(() => programStore.pagination)
const loading = computed(() => programStore.loading)
const categories = computed(() => categoryStore.categories)

const pageTitle = computed(() => {
  const type = route.query.type as string
  switch (type) {
    case 'hot':
      return '🔥 热门节目'
    case 'latest':
      return '🆕 最新节目'
    case 'featured':
      return '🌟 精选节目'
    default:
      return '📻 所有节目'
  }
})

const sortOptions = [
  { content: '最新发布', value: 'createdAt_desc' },
  { content: '最多播放', value: 'playsCount_desc' },
  { content: '最多点赞', value: 'likesCount_desc' },
  { content: '最多评论', value: 'commentsCount_desc' },
  { content: '精选优先', value: 'isFeatured_desc_createdAt_desc' }
]

const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value)
  return option ? option.content : '排序'
})

// 监听路由变化
watch(() => route.query, () => {
  loadPrograms()
}, { immediate: true })

// 初始化
onMounted(async () => {
  await categoryStore.fetchCategories()
  loadPrograms()
})

// 加载节目列表
const loadPrograms = async () => {
  const type = route.query.type as string
  const params: ProgramQueryParams = {
    page: pagination.value.current,
    limit: pagination.value.size,
    sortBy: currentSort.value as any
  }

  // 根据类型设置特定参数
  switch (type) {
    case 'featured':
      params.sortBy = 'isFeatured_desc_createdAt_desc'
      break
    case 'hot':
      params.sortBy = 'playsCount_desc'
      break
    case 'latest':
      params.sortBy = 'createdAt_desc'
      break
  }

  // 应用筛选条件
  if (selectedCategoryId.value) {
    params.categoryId = selectedCategoryId.value
  }
  if (tagFilter.value.trim()) {
    params.tag = tagFilter.value.trim()
  }

  await programStore.fetchPrograms(params)
}

// 事件处理
const goBack = () => {
  router.back()
}

const handleSortChange = (data: any) => {
  currentSort.value = data.value
  loadPrograms()
}

const selectCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
  loadPrograms()
}

const applyFilters = () => {
  loadPrograms()
}

const resetFilters = () => {
  selectedCategoryId.value = null
  tagFilter.value = ''
  currentSort.value = 'createdAt_desc'
  loadPrograms()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadPrograms()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.size = pageSize
  pagination.value.current = 1
  loadPrograms()
}
</script>

<style scoped>
.program-list-container {
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

/* 筛选器 */
.filters-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.filters-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  min-width: 60px;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.tag-input {
  max-width: 300px;
}

/* 主要内容 */
.programs-main {
  padding: 24px 0;
}

.programs-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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
  padding: 60px 20px;
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
  
  .filters-content {
    padding: 16px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filter-options {
    width: 100%;
    justify-content: center;
  }
  
  .tag-input {
    max-width: none;
    width: 100%;
  }
  
  .programs-content {
    padding: 0 16px;
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
  
  .header-content {
    padding: 12px 16px;
  }
  
  .programs-content {
    padding: 0 12px;
  }
}
</style>
