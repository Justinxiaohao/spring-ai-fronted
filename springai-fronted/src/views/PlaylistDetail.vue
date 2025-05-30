<template>
  <div class="playlist-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <t-skeleton :row-col="[
        { width: '100%', height: '300px' },
        { width: '60%', height: '32px' },
        { width: '40%', height: '20px' },
        { width: '100%', height: '200px' }
      ]" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <t-result
        theme="error"
        title="加载失败"
        :description="error"
      >
        <template #extra>
          <t-button theme="primary" @click="loadPlaylistDetail">
            重新加载
          </t-button>
        </template>
      </t-result>
    </div>

    <!-- 歌单详情内容 -->
    <div v-else-if="playlist" class="detail-content">
      <!-- 头部信息 -->
      <header class="playlist-header">
        <div class="header-background">
          <div class="background-covers">
            <img 
              v-for="(cover, index) in backgroundCovers" 
              :key="index"
              :src="cover" 
              :alt="`背景 ${index + 1}`"
              class="background-image"
            />
          </div>
          <div class="background-overlay"></div>
        </div>
        
        <div class="header-content">
          <div class="playlist-cover">
            <div class="cover-grid">
              <div 
                v-for="(cover, index) in displayCovers" 
                :key="index"
                class="cover-item"
              >
                <img 
                  :src="cover" 
                  :alt="`封面 ${index + 1}`"
                  @error="handleImageError"
                />
              </div>
            </div>
            <div class="play-button-overlay">
              <t-button
                theme="primary"
                size="large"
                shape="circle"
                @click="handlePlayAll"
                :disabled="!playlist.items || playlist.items.length === 0"
              >
                <template #icon>
                  <t-icon name="play" size="32px" />
                </template>
              </t-button>
            </div>
          </div>
          
          <div class="playlist-info">
            <div class="playlist-badge" v-if="!playlist.isPublic">
              <t-tag theme="warning" size="large">
                <template #icon>
                  <t-icon name="lock" />
                </template>
                私人歌单
              </t-tag>
            </div>
            
            <h1 class="playlist-title">{{ playlist.name }}</h1>
            
            <div class="playlist-meta">
              <div class="meta-item">
                <t-icon name="queue-music" />
                <span>{{ playlist.itemCount }} 首节目</span>
              </div>
              <div class="meta-item">
                <t-icon name="time" />
                <span>{{ formatDuration(totalDuration) }}</span>
              </div>
              <div class="meta-item">
                <t-icon name="calendar" />
                <span>{{ formatDate(playlist.updatedAt) }}</span>
              </div>
            </div>
            
            <div class="playlist-description" v-if="playlist.description">
              <p>{{ playlist.description }}</p>
            </div>
            
            <div class="playlist-actions" v-if="isOwner">
              <t-button 
                theme="primary" 
                variant="outline"
                @click="showEditDialog = true"
              >
                <template #icon>
                  <t-icon name="edit" />
                </template>
                编辑歌单
              </t-button>
              
              <t-button 
                theme="danger" 
                variant="outline"
                @click="showDeleteDialog = true"
              >
                <template #icon>
                  <t-icon name="delete" />
                </template>
                删除歌单
              </t-button>
            </div>
          </div>
        </div>
      </header>

      <!-- 节目列表 -->
      <section class="playlist-content">
        <div class="content-container">
          <div class="content-header">
            <h2 class="section-title">歌单内容</h2>
            <div class="content-actions" v-if="isOwner">
              <t-button 
                theme="primary" 
                variant="outline"
                @click="showAddDialog = true"
              >
                <template #icon>
                  <t-icon name="add" />
                </template>
                添加节目
              </t-button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!playlist.items || playlist.items.length === 0" class="empty-content">
            <t-result
              theme="default"
              title="歌单为空"
              description="还没有添加任何节目"
            >
              <template #extra>
                <t-button 
                  theme="primary" 
                  @click="showAddDialog = true"
                  v-if="isOwner"
                >
                  添加节目
                </t-button>
              </template>
            </t-result>
          </div>

          <!-- 节目列表 -->
          <div v-else class="programs-list">
            <div 
              v-for="(item, index) in playlist.items"
              :key="item.id"
              class="program-item"
              :class="{ 'playing': isCurrentProgram(item.programId) }"
            >
              <div class="item-index">{{ index + 1 }}</div>
              
              <div class="item-cover">
                <img 
                  :src="item.programCoverImageUrl" 
                  :alt="item.programTitle"
                  @error="handleImageError"
                />
                <div class="item-play-overlay">
                  <t-button 
                    theme="primary" 
                    shape="circle"
                    size="small"
                    @click="playProgram(item)"
                  >
                    <template #icon>
                      <t-icon 
                        :name="isCurrentProgram(item.programId) && playerState.isPlaying ? 'pause' : 'play'" 
                      />
                    </template>
                  </t-button>
                </div>
              </div>
              
              <div class="item-info">
                <h3 class="item-title">{{ item.programTitle }}</h3>
                <p class="item-artist">{{ item.programArtistNarrator }}</p>
              </div>
              
              <div class="item-duration">
                {{ formatDuration(item.programDurationSeconds) }}
              </div>
              
              <div class="item-actions" v-if="isOwner">
                <t-button 
                  theme="danger" 
                  variant="text" 
                  size="small"
                  @click="removeItem(item)"
                >
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

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
      <p>确定要删除歌单"{{ playlist?.name }}"吗？</p>
      <p class="warning-text">此操作不可恢复，歌单内的所有节目都将被移除。</p>
    </t-dialog>

    <!-- 添加节目对话框 -->
    <t-dialog
      v-model:visible="showAddDialog"
      title="添加节目到歌单"
      width="600px"
      :footer="false"
    >
      <div class="add-program-content">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索节目..."
          clearable
          @enter="searchPrograms"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        
        <div class="search-results" v-if="searchResults.length > 0">
          <div 
            v-for="program in searchResults"
            :key="program.id"
            class="search-result-item"
          >
            <img 
              :src="program.coverImageUrl" 
              :alt="program.title"
              class="result-cover"
            />
            <div class="result-info">
              <h4>{{ program.title }}</h4>
              <p>{{ program.artistNarrator }}</p>
            </div>
            <t-button 
              theme="primary" 
              size="small"
              @click="addProgramToPlaylist(program.id)"
              :loading="adding"
            >
              添加
            </t-button>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { usePlaylistStore, usePlayerStore, useProgramStore } from '@/stores/counter'
import { utils } from '@/services/api'
import type { Playlist, PlaylistItem, Program } from '@/types'
import AudioPlayer from '@/components/AudioPlayer.vue'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()
const playerStore = usePlayerStore()
const programStore = useProgramStore()

const playlist = ref<Playlist | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const updating = ref(false)
const deleting = ref(false)
const adding = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showAddDialog = ref(false)
const editFormRef = ref()
const searchKeyword = ref('')
const searchResults = ref<Program[]>([])

// 表单数据
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
const playerState = computed(() => playerStore.playerState)
const isOwner = computed(() => {
  // 这里应该检查当前用户是否是歌单的创建者
  // 临时实现：假设都是自己的歌单
  return true
})

const displayCovers = computed(() => {
  const covers = []
  const defaultCover = '/default-cover.jpg'
  
  if (playlist.value?.items && playlist.value.items.length > 0) {
    for (let i = 0; i < 4; i++) {
      if (i < playlist.value.items.length) {
        covers.push(playlist.value.items[i].programCoverImageUrl || defaultCover)
      } else {
        covers.push(defaultCover)
      }
    }
  } else {
    for (let i = 0; i < 4; i++) {
      covers.push(defaultCover)
    }
  }
  
  return covers
})

const backgroundCovers = computed(() => {
  return displayCovers.value.slice(0, 3)
})

const totalDuration = computed(() => {
  if (!playlist.value?.items) return 0
  return playlist.value.items.reduce((sum, item) => sum + item.programDurationSeconds, 0)
})

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadPlaylistDetail()
  }
}, { immediate: true })

// 监听自动播放参数
watch(() => route.query.autoplay, (autoplay) => {
  if (autoplay === 'true' && playlist.value?.items && playlist.value.items.length > 0) {
    playProgram(playlist.value.items[0])
  }
})

// 初始化
onMounted(() => {
  loadPlaylistDetail()
})

// 加载歌单详情
const loadPlaylistDetail = async () => {
  const playlistId = Number(route.params.id)
  if (!playlistId) {
    error.value = '无效的歌单ID'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await playlistStore.fetchPlaylistDetail(playlistId)
    if (result) {
      playlist.value = result
    } else {
      error.value = '歌单不存在'
    }
  } catch (err) {
    error.value = '加载歌单详情失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-cover.jpg'
}

const isCurrentProgram = (programId: number) => {
  return playerState.value.currentProgram?.id === programId
}

const handlePlayAll = () => {
  if (playlist.value?.items && playlist.value.items.length > 0) {
    playProgram(playlist.value.items[0])
  }
}

const playProgram = async (item: PlaylistItem) => {
  // 这里需要根据 programId 获取完整的节目信息
  // 临时实现：创建一个简化的节目对象
  const program: Program = {
    id: item.programId,
    title: item.programTitle,
    description: '',
    audioUrl: '', // 这里需要从 API 获取
    coverImageUrl: item.programCoverImageUrl,
    categoryId: 0,
    categoryName: '',
    artistNarrator: item.programArtistNarrator,
    album: '',
    durationSeconds: item.programDurationSeconds,
    tags: '',
    publicationDate: '',
    playsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    isFeatured: false,
    status: 'published',
    createdAt: item.addedAt,
    updatedAt: item.addedAt
  }
  
  await playerStore.playProgram(program)
}

const updatePlaylist = async () => {
  if (!playlist.value) return false
  
  const valid = await editFormRef.value?.validate()
  if (!valid) return false

  updating.value = true
  
  try {
    const updated = await playlistStore.updatePlaylist(playlist.value.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      isPublic: editForm.isPublic
    })
    
    if (updated) {
      playlist.value = updated
    }
    
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

const confirmDelete = async () => {
  if (!playlist.value) return false

  deleting.value = true
  
  try {
    await playlistStore.deletePlaylist(playlist.value.id)
    MessagePlugin.success('歌单删除成功')
    router.push('/playlists')
  } catch (error: any) {
    console.error('删除歌单失败:', error)
    MessagePlugin.error(error.message || '删除失败')
  } finally {
    deleting.value = false
  }
  
  return true
}

const removeItem = async (item: PlaylistItem) => {
  if (!playlist.value) return

  try {
    await playlistStore.removePlaylistItem(playlist.value.id, item.id)
    MessagePlugin.success('节目已移除')
    
    // 重新加载歌单详情
    await loadPlaylistDetail()
  } catch (error: any) {
    console.error('移除节目失败:', error)
    MessagePlugin.error(error.message || '移除失败')
  }
}

const searchPrograms = async () => {
  if (!searchKeyword.value.trim()) return

  try {
    await programStore.fetchPrograms({
      tag: searchKeyword.value.trim(),
      limit: 10
    })
    searchResults.value = programStore.programs
  } catch (error) {
    console.error('搜索节目失败:', error)
  }
}

const addProgramToPlaylist = async (programId: number) => {
  if (!playlist.value) return

  adding.value = true
  
  try {
    await playlistStore.addProgramToPlaylist(playlist.value.id, programId)
    MessagePlugin.success('节目添加成功')
    
    // 重新加载歌单详情
    await loadPlaylistDetail()
    showAddDialog.value = false
    searchKeyword.value = ''
    searchResults.value = []
  } catch (error: any) {
    console.error('添加节目失败:', error)
    MessagePlugin.error(error.message || '添加失败')
  } finally {
    adding.value = false
  }
}

// 工具函数
const formatDuration = (seconds: number) => utils.formatDuration(seconds)
const formatDate = (dateString: string) => utils.formatDate(dateString)

// 编辑表单初始化
watch(() => playlist.value, (newPlaylist) => {
  if (newPlaylist) {
    editForm.name = newPlaylist.name
    editForm.description = newPlaylist.description
    editForm.isPublic = newPlaylist.isPublic
  }
})
</script>

<style scoped>
.playlist-detail-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.loading-container,
.error-container {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 头部样式 */
.playlist-header {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.background-covers {
  display: flex;
  width: 100%;
  height: 100%;
}

.background-image {
  flex: 1;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.1);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
}

.header-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  display: flex;
  gap: 32px;
  align-items: flex-end;
  height: 100%;
}

.playlist-cover {
  position: relative;
  flex-shrink: 0;
}

.cover-grid {
  width: 240px;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.cover-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-cover:hover .play-button-overlay {
  opacity: 1;
}

.playlist-info {
  flex: 1;
  color: white;
  min-width: 0;
}

.playlist-badge {
  margin-bottom: 12px;
}

.playlist-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.playlist-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0.9;
}

.playlist-description {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

/* 内容区域样式 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.playlist-content {
  padding: 48px 0;
  background: white;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.empty-content {
  padding: 60px 20px;
  text-align: center;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.program-item:hover {
  background: #f8fafc;
}

.program-item.playing {
  background: #e0f2fe;
  border: 1px solid #0ea5e9;
}

.item-index {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.item-cover {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.program-item:hover .item-play-overlay {
  opacity: 1;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-duration {
  font-size: 12px;
  color: #9ca3af;
  min-width: 50px;
  text-align: right;
}

.item-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.program-item:hover .item-actions {
  opacity: 1;
}

.warning-text {
  color: #ef4444;
  font-size: 14px;
  margin: 8px 0 0 0;
}

/* 添加节目对话框样式 */
.add-program-content {
  padding: 16px 0;
}

.search-results {
  margin-top: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.search-result-item:hover {
  background: #f8fafc;
}

.result-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.result-info p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-header {
    height: 300px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
    gap: 20px;
  }

  .cover-grid {
    width: 180px;
    height: 180px;
  }

  .playlist-title {
    font-size: 24px;
  }

  .playlist-meta {
    justify-content: center;
    gap: 16px;
  }

  .playlist-actions {
    justify-content: center;
  }

  .content-container {
    padding: 0 16px;
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .program-item {
    padding: 8px 12px;
    gap: 12px;
  }

  .item-cover {
    width: 40px;
    height: 40px;
  }
}
</style>
