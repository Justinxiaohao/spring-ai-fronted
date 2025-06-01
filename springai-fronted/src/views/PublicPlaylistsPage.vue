<template>
  <div class="public-playlists-page-container">
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
        
        <h1 class="page-title">🎵 公开歌单</h1>
        
        <div class="header-actions">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索歌单..."
            clearable
            @enter="handleSearch"
            @clear="handleClearSearch"
            size="medium"
            class="search-input"
          >
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </div>
      </div>
    </header>

    <!-- 歌单列表 -->
    <main class="playlists-main">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-grid">
          <t-skeleton 
            v-for="i in 12" 
            :key="i"
            :row-col="[{ width: '100%', height: '280px' }]"
            class="skeleton-item"
          />
        </div>

        <!-- 空状态 -->
        <div v-else-if="playlists.length === 0" class="empty-state">
          <t-result
            theme="default"
            title="暂无公开歌单"
            description="还没有用户创建公开歌单"
          >
            <template #extra>
              <t-button theme="primary" @click="goBack">
                返回首页
              </t-button>
            </template>
          </t-result>
        </div>

        <!-- 歌单网格 -->
        <div v-else class="playlists-grid">
          <PlaylistCard
            v-for="(playlist, index) in playlists"
            :key="playlist.id"
            :playlist="playlist"
            :is-owner="false"
            class="animate__animated animate__fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @play="handlePlayPlaylist"
          />
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="!loading && playlists.length > 0 && hasMore" class="load-more-container">
          <t-button
            theme="primary"
            size="large"
            :loading="loadingMore"
            @click="loadMorePlaylists"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </t-button>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-if="!loading && playlists.length > 0 && !hasMore" class="no-more-container">
          <p class="no-more-text">已显示全部歌单</p>
        </div>
      </div>
    </main>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { playlistApi, searchApi } from '@/services/api'
import type { Playlist } from '@/types'
import PlaylistCard from '@/components/PlaylistCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()

const loading = ref(false)
const loadingMore = ref(false)
const searchKeyword = ref('')
const playlists = ref<Playlist[]>([])
const hasMore = ref(true)
const currentLimit = ref(20)
const loadedCount = ref(0)
const currentPage = ref(1)

// 初始化
onMounted(async () => {
  await loadPlaylists()
})

// 加载歌单列表
const loadPlaylists = async (reset = true) => {
  if (reset) {
    loading.value = true
    playlists.value = []
    loadedCount.value = 0
    hasMore.value = true
    currentPage.value = 1
  }

  try {
    console.log('正在加载公开歌单列表...', '搜索关键词:', searchKeyword.value)

    let response

    // 如果有搜索关键词，使用搜索API
    if (searchKeyword.value.trim()) {
      const params = {
        q: searchKeyword.value.trim(),
        page: reset ? 1 : currentPage.value,
        limit: currentLimit.value
      }
      response = await searchApi.searchPlaylists(params)
      console.log('歌单搜索API响应:', response)
    } else {
      // 没有搜索关键词，使用普通的公开歌单API
      const offset = reset ? 0 : playlists.value.length
      response = await playlistApi.getPublicPlaylists(currentLimit.value, offset)
      console.log('公开歌单列表API响应:', response)
    }

    if (response.success && response.data) {
      let newPlaylists: Playlist[] = []

      // 处理搜索API返回的分页数据结构
      if (searchKeyword.value.trim() && 'records' in response.data) {
        newPlaylists = response.data.records || []
        hasMore.value = response.data.hasNext || false
        if (!reset) {
          currentPage.value++
        }
      } else {
        // 处理普通API返回的数组结构
        newPlaylists = Array.isArray(response.data) ? response.data : []
        hasMore.value = newPlaylists.length >= currentLimit.value
      }

      if (reset) {
        playlists.value = newPlaylists
      } else {
        playlists.value = [...playlists.value, ...newPlaylists]
      }
      loadedCount.value = playlists.value.length

      console.log('当前歌单总数:', playlists.value.length, '是否还有更多:', hasMore.value)
    } else {
      if (reset) {
        playlists.value = []
      }
      hasMore.value = false
    }
  } catch (error: any) {
    console.error('加载歌单列表失败:', error)
    MessagePlugin.error(error.message || '加载歌单列表失败')
    if (reset) {
      playlists.value = []
    }
    hasMore.value = false
  } finally {
    if (reset) {
      loading.value = false
    }
  }
}

// 加载更多歌单
const loadMorePlaylists = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    console.log('正在加载更多歌单...', '搜索关键词:', searchKeyword.value)

    let response

    // 如果有搜索关键词，使用搜索API
    if (searchKeyword.value.trim()) {
      const params = {
        q: searchKeyword.value.trim(),
        page: currentPage.value + 1,
        limit: currentLimit.value
      }
      response = await searchApi.searchPlaylists(params)
      console.log('更多歌单搜索API响应:', response)
    } else {
      // 没有搜索关键词，使用普通的公开歌单API
      const offset = playlists.value.length
      response = await playlistApi.getPublicPlaylists(currentLimit.value, offset)
      console.log('更多公开歌单API响应:', response)
    }

    if (response.success && response.data) {
      let newPlaylists: Playlist[] = []

      // 处理搜索API返回的分页数据结构
      if (searchKeyword.value.trim() && 'records' in response.data) {
        newPlaylists = response.data.records || []
        hasMore.value = response.data.hasNext || false
        currentPage.value++
      } else {
        // 处理普通API返回的数组结构
        newPlaylists = Array.isArray(response.data) ? response.data : []
        // 过滤掉已经存在的歌单，避免重复
        newPlaylists = newPlaylists.filter(
          newPlaylist => !playlists.value.some(existingPlaylist => existingPlaylist.id === newPlaylist.id)
        )
        hasMore.value = newPlaylists.length > 0 && newPlaylists.length >= currentLimit.value
      }

      if (newPlaylists.length > 0) {
        playlists.value = [...playlists.value, ...newPlaylists]
        loadedCount.value = playlists.value.length
      } else if (!searchKeyword.value.trim()) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    console.error('加载更多歌单失败:', error)
    MessagePlugin.error(error.message || '加载更多歌单失败')
    hasMore.value = false
  } finally {
    loadingMore.value = false
  }
}

// 事件处理
const goBack = () => {
  router.back()
}

const handleSearch = () => {
  console.log('搜索歌单:', searchKeyword.value)
  // 重置分页状态并重新加载
  currentPage.value = 1
  loadPlaylists(true)
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  // 重置分页状态并重新加载
  currentPage.value = 1
  loadPlaylists(true)
}

const handlePlayPlaylist = async (playlist: Playlist) => {
  if (playlist.itemCount === 0) {
    MessagePlugin.info('歌单为空，请先添加节目')
    return
  }
  router.push(`/playlist/${playlist.id}?autoplay=true`)
}
</script>

<style scoped>
.public-playlists-page-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

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

.search-input {
  width: 300px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.playlists-main {
  padding: 24px 0;
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

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.no-more-container {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.no-more-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

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
  
  .search-input {
    width: 100%;
  }
  
  .content-container {
    padding: 0 16px;
  }
  
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .playlists-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .content-container {
    padding: 0 12px;
  }
}
</style>
