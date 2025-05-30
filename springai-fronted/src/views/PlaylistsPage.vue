<template>
  <div class="playlists-page-container">
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
        
        <h1 class="page-title">🎵 我的歌单</h1>
        
        <div class="header-actions">
          <t-button 
            theme="primary"
            @click="showCreateDialog = true"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            创建歌单
          </t-button>
        </div>
      </div>
    </header>

    <!-- 统计信息 -->
    <section class="stats-section" v-if="!loading && playlists.length > 0">
      <div class="content-container">
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ playlists.length }}</div>
            <div class="stat-label">我的歌单</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalSongs }}</div>
            <div class="stat-label">总节目数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ publicPlaylists }}</div>
            <div class="stat-label">公开歌单</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 歌单列表 -->
    <main class="playlists-main">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-grid">
          <t-skeleton 
            v-for="i in 8" 
            :key="i"
            :row-col="[{ width: '100%', height: '280px' }]"
            class="skeleton-item"
          />
        </div>

        <!-- 空状态 -->
        <div v-else-if="playlists.length === 0" class="empty-state">
          <t-result
            theme="default"
            title="还没有创建歌单"
            description="创建你的第一个歌单，开始收藏喜欢的节目吧"
          >
            <template #extra>
              <t-button 
                theme="primary" 
                @click="showCreateDialog = true"
              >
                创建歌单
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
            :is-owner="true"
            class="animate__animated animate__fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @edit="handleEditPlaylist"
            @delete="handleDeletePlaylist"
            @play="handlePlayPlaylist"
          />
        </div>
      </div>
    </main>

    <!-- 创建歌单对话框 -->
    <t-dialog
      v-model:visible="showCreateDialog"
      title="创建新歌单"
      width="500px"
      :confirm-btn="{ content: '创建', loading: creating }"
      @confirm="createPlaylist"
    >
      <t-form
        ref="createFormRef"
        :model="createForm"
        :rules="formRules"
        label-width="80px"
      >
        <t-form-item label="歌单名称" name="name">
          <t-input 
            v-model="createForm.name" 
            placeholder="请输入歌单名称"
            :maxlength="100"
          />
        </t-form-item>
        
        <t-form-item label="歌单描述" name="description">
          <t-textarea 
            v-model="createForm.description" 
            placeholder="请输入歌单描述（可选）"
            :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
        
        <t-form-item label="公开设置" name="isPublic">
          <t-radio-group v-model="createForm.isPublic">
            <t-radio :value="true">公开歌单</t-radio>
            <t-radio :value="false">私人歌单</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 编辑歌单对话框 -->
    <t-dialog
      v-model:visible="showEditDialog"
      title="编辑歌单"
      width="500px"
      :confirm-btn="{ content: '保存', loading: updating }"
      @confirm="updatePlaylist"
    >
      <t-form
        ref="editFormRef"
        :model="editForm"
        :rules="formRules"
        label-width="80px"
      >
        <t-form-item label="歌单名称" name="name">
          <t-input 
            v-model="editForm.name" 
            placeholder="请输入歌单名称"
            :maxlength="100"
          />
        </t-form-item>
        
        <t-form-item label="歌单描述" name="description">
          <t-textarea 
            v-model="editForm.description" 
            placeholder="请输入歌单描述（可选）"
            :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
        
        <t-form-item label="公开设置" name="isPublic">
          <t-radio-group v-model="editForm.isPublic">
            <t-radio :value="true">公开歌单</t-radio>
            <t-radio :value="false">私人歌单</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="showDeleteDialog"
      title="删除歌单"
      :confirm-btn="{ content: '确认删除', theme: 'danger', loading: deleting }"
      @confirm="confirmDelete"
    >
      <p>确定要删除歌单"{{ currentPlaylist?.name }}"吗？</p>
      <p class="warning-text">此操作不可恢复，歌单内的所有节目都将被移除。</p>
    </t-dialog>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { usePlaylistStore, usePlayerStore } from '@/stores/counter'
import type { Playlist } from '@/types'
import PlaylistCard from '@/components/PlaylistCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()
const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()

const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const deleting = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const currentPlaylist = ref<Playlist | null>(null)
const createFormRef = ref()
const editFormRef = ref()

// 表单数据
const createForm = reactive({
  name: '',
  description: '',
  isPublic: true
})

const editForm = reactive({
  name: '',
  description: '',
  isPublic: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入歌单名称', type: 'error' },
    { max: 100, message: '歌单名称不能超过100个字符', type: 'error' }
  ],
  description: [
    { max: 500, message: '歌单描述不能超过500个字符', type: 'error' }
  ]
}

// 计算属性
const playlists = computed(() => playlistStore.playlists)

const totalSongs = computed(() => {
  return playlists.value.reduce((sum, playlist) => sum + playlist.itemCount, 0)
})

const publicPlaylists = computed(() => {
  return playlists.value.filter(playlist => playlist.isPublic).length
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

  await loadPlaylists()
})

// 加载歌单列表
const loadPlaylists = async () => {
  loading.value = true

  try {
    console.log('正在加载歌单列表...')
    await playlistStore.fetchUserPlaylists()
    console.log('歌单列表加载完成')
  } catch (error: any) {
    console.error('加载歌单列表失败:', error)

    // 根据错误类型显示不同的提示
    if (error.message && (error.message.includes('HTTP error! status: 404') || error.message.includes('HTTP error! status: 401'))) {
      MessagePlugin.error('用户认证失败，请重新登录')
      setTimeout(() => {
        localStorage.removeItem('userEmail')
        router.push('/login')
      }, 2000)
    } else {
      MessagePlugin.error(error.message || '加载歌单列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 事件处理
const goBack = () => {
  router.back()
}

const createPlaylist = async () => {
  const valid = await createFormRef.value?.validate()
  if (!valid) return false

  creating.value = true
  
  try {
    await playlistStore.createPlaylist({
      name: createForm.name,
      description: createForm.description || undefined,
      isPublic: createForm.isPublic
    })
    
    MessagePlugin.success('歌单创建成功')
    
    // 重置表单
    createForm.name = ''
    createForm.description = ''
    createForm.isPublic = true
    showCreateDialog.value = false
  } catch (error: any) {
    console.error('创建歌单失败:', error)
    MessagePlugin.error(error.message || '创建失败')
  } finally {
    creating.value = false
  }
  
  return true
}

const handleEditPlaylist = (playlist: Playlist) => {
  currentPlaylist.value = playlist
  editForm.name = playlist.name
  editForm.description = playlist.description
  editForm.isPublic = playlist.isPublic
  showEditDialog.value = true
}

const updatePlaylist = async () => {
  if (!currentPlaylist.value) return false
  
  const valid = await editFormRef.value?.validate()
  if (!valid) return false

  updating.value = true
  
  try {
    await playlistStore.updatePlaylist(currentPlaylist.value.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      isPublic: editForm.isPublic
    })
    
    MessagePlugin.success('歌单更新成功')
    showEditDialog.value = false
  } catch (error: any) {
    console.error('更新歌单失败:', error)
    MessagePlugin.error(error.message || '更新失败')
  } finally {
    updating.value = false
  }
  
  return true
}

const handleDeletePlaylist = (playlist: Playlist) => {
  currentPlaylist.value = playlist
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!currentPlaylist.value) return false

  deleting.value = true
  
  try {
    await playlistStore.deletePlaylist(currentPlaylist.value.id)
    MessagePlugin.success('歌单删除成功')
    showDeleteDialog.value = false
  } catch (error: any) {
    console.error('删除歌单失败:', error)
    MessagePlugin.error(error.message || '删除失败')
  } finally {
    deleting.value = false
  }
  
  return true
}

const handlePlayPlaylist = async (playlist: Playlist) => {
  // 如果歌单为空，提示用户
  if (playlist.itemCount === 0) {
    MessagePlugin.info('歌单为空，请先添加节目')
    return
  }

  // 跳转到歌单详情页面并开始播放
  router.push(`/playlist/${playlist.id}?autoplay=true`)
}
</script>

<style scoped>
.playlists-page-container {
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
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 主要内容 */
.playlists-main {
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

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
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
  
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .playlists-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
