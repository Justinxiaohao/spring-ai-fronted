<template>
  <div class="search-page-container">
    <!-- 搜索头部 -->
    <header class="search-header">
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
        
        <div class="search-input-container">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索节目、主播或标签..."
            clearable
            @enter="handleSearch"
            @clear="handleClear"
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

    <!-- 搜索结果 -->
    <main class="search-main">
      <div class="search-content">
        <!-- 搜索状态提示 -->
        <div v-if="searchKeyword && !hasSearched" class="search-hint">
          <p>输入关键词开始搜索</p>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="loading-container">
          <t-skeleton 
            v-for="i in 8" 
            :key="i"
            :row-col="[{ width: '100%', height: '200px' }]"
            class="skeleton-item"
          />
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="hasSearched">
          <!-- 结果统计 -->
          <div class="search-stats">
            <h2 class="stats-title">
              搜索 "{{ currentSearchKeyword }}" 的结果
            </h2>
            <p class="stats-info">
              找到 {{ pagination.total }} 个相关节目
            </p>
          </div>

          <!-- 筛选器 -->
          <div class="search-filters">
            <div class="filter-group">
              <label class="filter-label">排序：</label>
              <t-radio-group v-model="sortBy" @change="handleSortChange">
                <t-radio-button value="relevance">相关度</t-radio-button>
                <t-radio-button value="createdAt_desc">最新</t-radio-button>
                <t-radio-button value="playsCount_desc">最热</t-radio-button>
                <t-radio-button value="likesCount_desc">最受欢迎</t-radio-button>
              </t-radio-group>
            </div>

            <div class="filter-group">
              <label class="filter-label">分类：</label>
              <t-select
                v-model="selectedCategoryId"
                placeholder="选择分类"
                clearable
                @change="handleCategoryChange"
                class="category-select"
              >
                <t-option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                  :label="category.name"
                />
              </t-select>
            </div>
          </div>

          <!-- 空结果 -->
          <div v-if="programs.length === 0" class="empty-results">
            <t-result
              theme="default"
              title="未找到相关节目"
              description="尝试使用其他关键词或调整筛选条件"
            >
              <template #extra>
                <t-button theme="primary" @click="clearSearch">
                  清空搜索
                </t-button>
              </template>
            </t-result>
          </div>

          <!-- 结果列表 -->
          <div v-else class="results-container">
            <div class="programs-grid">
              <ProgramCard
                v-for="(program, index) in programs"
                :key="program.id"
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
                @change="handlePageChange"
              />
            </div>
          </div>
        </div>

        <!-- 热门搜索建议 -->
        <div v-else class="search-suggestions">
          <h3 class="suggestions-title">热门搜索</h3>
          <div class="suggestions-tags">
            <t-tag
              v-for="tag in popularTags"
              :key="tag"
              theme="primary"
              variant="light"
              clickable
              @click="searchByTag(tag)"
              class="suggestion-tag"
            >
              {{ tag }}
            </t-tag>
          </div>

          <h3 class="suggestions-title">推荐节目</h3>
          <div class="recommended-programs">
            <ProgramCard
              v-for="program in recommendedPrograms"
              :key="program.id"
              :program="program"
              class="animate__animated animate__fadeInUp"
            />
          </div>
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

const searchKeyword = ref('')
const currentSearchKeyword = ref('')
const hasSearched = ref(false)
const sortBy = ref('relevance')
const selectedCategoryId = ref<number | null>(null)
const recommendedPrograms = ref<any[]>([])

// 热门搜索标签
const popularTags = ['冥想', '放松', '正念', '睡眠', '音乐', '故事', '英语', '学习']

// 计算属性
const programs = computed(() => programStore.programs)
const pagination = computed(() => programStore.pagination)
const loading = computed(() => programStore.loading)
const categories = computed(() => categoryStore.categories)

// 搜索处理
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return

  currentSearchKeyword.value = searchKeyword.value.trim()
  hasSearched.value = true

  try {
    const params = {
      q: currentSearchKeyword.value,
      page: 1,
      limit: 12
    }

    const response = await searchApi.searchPrograms(params)
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
  } catch (error) {
    console.error('搜索失败:', error)
  }

  // 更新 URL
  router.replace({
    query: {
      ...route.query,
      q: currentSearchKeyword.value
    }
  })
}

// 加载推荐节目
const loadRecommendedPrograms = async () => {
  try {
    await programStore.fetchFeaturedPrograms(6)
    recommendedPrograms.value = programStore.featuredPrograms
  } catch (error) {
    console.error('加载推荐节目失败:', error)
  }
}

// 监听路由查询参数
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchKeyword.value = newQuery as string
    handleSearch()
  }
}, { immediate: true })

// 初始化
onMounted(async () => {
  await categoryStore.fetchCategories()

  // 如果没有搜索关键词，加载推荐节目
  if (!route.query.q) {
    loadRecommendedPrograms()
  }
})

// 事件处理
const goBack = () => {
  router.back()
}

const handleClear = () => {
  searchKeyword.value = ''
  currentSearchKeyword.value = ''
  hasSearched.value = false
  router.replace({ query: {} })
}

const clearSearch = () => {
  handleClear()
  loadRecommendedPrograms()
}

const handleSortChange = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

const handleCategoryChange = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

const handlePageChange = (page: number) => {
  // 这里应该重新搜索指定页面的数据
  // 为简化实现，暂时只更新页码
  pagination.value.current = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const searchByTag = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}
</script>

<style scoped>
.search-page-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

/* 搜索头部 */
.search-header {
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
  gap: 16px;
}

.search-input-container {
  flex: 1;
  max-width: 600px;
}

.search-input {
  width: 100%;
}

/* 主要内容 */
.search-main {
  padding: 24px 0;
}

.search-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.search-hint {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 16px;
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skeleton-item {
  border-radius: 12px;
}

/* 搜索结果 */
.search-stats {
  margin-bottom: 24px;
}

.stats-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.stats-info {
  color: #6b7280;
  margin: 0;
}

.search-filters {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  min-width: 60px;
}

.category-select {
  min-width: 150px;
}

.empty-results {
  padding: 60px 20px;
  text-align: center;
}

.results-container {
  margin-top: 24px;
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

/* 搜索建议 */
.search-suggestions {
  padding: 20px 0;
}

.suggestions-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.suggestions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 40px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  transform: translateY(-2px);
}

.recommended-programs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .search-content {
    padding: 0 16px;
  }
  
  .programs-grid,
  .recommended-programs {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .programs-grid,
  .recommended-programs {
    grid-template-columns: 1fr;
  }
  
  .search-content {
    padding: 0 12px;
  }
}
</style>
