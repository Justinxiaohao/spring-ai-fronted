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

        <div class="search-section">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索节目标题..."
            clearable
            @enter="handleSearch"
            @clear="handleClearSearch"
            size="large"
            class="search-input"
          >
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
            <template #suffix>
              <t-button
                theme="primary"
                @click="handleSearch"
                :loading="loading"
              >
                搜索
              </t-button>
            </template>
          </t-input>
        </div>
      </div>
    </header>

    <!-- 分类筛选导航栏 -->
    <section class="category-filter-section">
      <div class="category-filter-content">
        <div class="category-tabs">
          <t-button
            :theme="selectedCategoryId === null ? 'primary' : 'default'"
            :variant="selectedCategoryId === null ? 'base' : 'outline'"
            @click="selectCategory(null)"
            class="category-btn"
          >
            全部
          </t-button>
          <t-button
            v-for="category in categories"
            :key="category.id"
            :theme="selectedCategoryId === category.id ? 'primary' : 'default'"
            :variant="selectedCategoryId === category.id ? 'base' : 'outline'"
            @click="selectCategory(category.id)"
            class="category-btn"
          >
            {{ category.name }}
          </t-button>
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
import { searchApi } from '@/services/api'
import type { ProgramQueryParams } from '@/types'
import ProgramCard from '@/components/ProgramCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const route = useRoute()
const router = useRouter()
const programStore = useProgramStore()
const categoryStore = useCategoryStore()

const selectedCategoryId = ref<number | null>(null)
const tagFilter = ref('')
const searchKeyword = ref('')
const isSearchMode = ref(false)
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

// 加载节目列表
const loadPrograms = async () => {
  try {
    // 如果是搜索模式，使用搜索API
    if (isSearchMode.value && searchKeyword.value.trim()) {
      const searchParams = {
        q: searchKeyword.value.trim(),
        page: pagination.value.current,
        limit: pagination.value.size
      }

      console.log('搜索节目标题，参数:', searchParams)
      const response = await searchApi.searchPrograms(searchParams)

      if (response.success) {
        // 手动更新程序存储的数据
        programStore.$patch({
          programs: response.data.records,
          pagination: {
            current: response.data.current,
            size: response.data.size,
            total: response.data.total,
            pages: response.data.pages,
            hasNext: response.data.hasNext,
            hasPrevious: response.data.hasPrevious
          }
        })
      }
    } else {
      // 普通模式，使用原有的API
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

      // 应用分类筛选条件
      if (selectedCategoryId.value) {
        params.categoryId = selectedCategoryId.value
      }
      if (tagFilter.value.trim()) {
        params.tag = tagFilter.value.trim()
      }

      console.log('加载节目列表，参数:', params)
      await programStore.fetchPrograms(params)
    }
  } catch (error) {
    console.error('加载节目失败:', error)
  }
}

// 监听路由变化
watch(() => route.query, () => {
  loadPrograms()
}, { immediate: true })

// 初始化
onMounted(async () => {
  await categoryStore.fetchCategories()
  loadPrograms()
})

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
  // 重置分页到第一页
  pagination.value.current = 1
  loadPrograms()
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    handleClearSearch()
    return
  }

  isSearchMode.value = true
  // 重置分页到第一页
  pagination.value.current = 1
  loadPrograms()
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  isSearchMode.value = false
  // 重置分页到第一页
  pagination.value.current = 1
  loadPrograms()
}

const applyFilters = () => {
  loadPrograms()
}

const resetFilters = () => {
  selectedCategoryId.value = null
  tagFilter.value = ''
  searchKeyword.value = ''
  isSearchMode.value = false
  currentSort.value = 'createdAt_desc'
  // 重置分页到第一页
  pagination.value.current = 1
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
  position: relative;
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

.search-section {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
}

/* 分类筛选导航栏 */
.category-filter-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-filter-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
}

.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.category-btn {
  border-radius: 20px;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 8px 16px;
}

.category-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

  .search-section {
    max-width: none;
  }

  .category-filter-content {
    padding: 12px 16px;
  }

  .category-tabs {
    justify-content: center;
    gap: 8px;
  }

  .category-btn {
    font-size: 13px;
    padding: 6px 12px;
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

  .category-filter-content {
    padding: 8px 12px;
  }

  .category-tabs {
    gap: 6px;
  }

  .category-btn {
    font-size: 12px;
    padding: 4px 8px;
  }

  .programs-content {
    padding: 0 12px;
  }
}
</style>
