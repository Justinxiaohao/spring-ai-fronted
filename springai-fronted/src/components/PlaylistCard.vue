<template>
  <div 
    class="playlist-card animate__animated animate__fadeInUp"
    @click="handleCardClick"
  >
    <div class="card-cover">
      <div class="cover-grid">
        <!-- 显示歌单内前4个节目的封面，如果不足则显示默认封面 -->
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
      
      <div class="card-overlay">
        <div class="play-button">
          <t-button 
            theme="primary" 
            shape="circle" 
            size="large"
            @click.stop="handlePlayClick"
          >
            <template #icon>
              <t-icon name="play" size="24px" />
            </template>
          </t-button>
        </div>
        
        <div class="playlist-actions">
          <t-button 
            theme="primary" 
            variant="text" 
            size="small"
            @click.stop="handleEditClick"
            v-if="isOwner"
          >
            <template #icon>
              <t-icon name="edit" />
            </template>
          </t-button>
          
          <t-button 
            theme="danger" 
            variant="text" 
            size="small"
            @click.stop="handleDeleteClick"
            v-if="isOwner"
          >
            <template #icon>
              <t-icon name="delete" />
            </template>
          </t-button>
        </div>
      </div>
      
      <div class="playlist-badge" v-if="!playlist.isPublic">
        <t-tag theme="warning" size="small">
          <template #icon>
            <t-icon name="lock" />
          </template>
          私人
        </t-tag>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="playlist-title">{{ playlist.name }}</h3>
      <p class="playlist-description" v-if="playlist.description">
        {{ truncatedDescription }}
      </p>
      
      <div class="playlist-meta">
        <div class="meta-item">
          <t-icon name="queue-music" size="14px" />
          <span>{{ playlist.itemCount }} 首</span>
        </div>
        <div class="meta-item">
          <t-icon name="time" size="14px" />
          <span>{{ formatDate(playlist.updatedAt) }}</span>
        </div>
      </div>
      
      <div class="playlist-status">
        <t-icon 
          :name="playlist.isPublic ? 'public' : 'lock'" 
          size="14px"
          :class="{ 'public-icon': playlist.isPublic, 'private-icon': !playlist.isPublic }"
        />
        <span class="status-text">
          {{ playlist.isPublic ? '公开' : '私人' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Playlist } from '@/types'
import { utils } from '@/services/api'

interface Props {
  playlist: Playlist
  isOwner?: boolean
}

interface Emits {
  (e: 'edit', playlist: Playlist): void
  (e: 'delete', playlist: Playlist): void
  (e: 'play', playlist: Playlist): void
}

const props = withDefaults(defineProps<Props>(), {
  isOwner: true
})

const emit = defineEmits<Emits>()
const router = useRouter()

// 计算属性
const truncatedDescription = computed(() => {
  if (!props.playlist.description) return ''
  const maxLength = 60
  return props.playlist.description.length > maxLength 
    ? props.playlist.description.substring(0, maxLength) + '...'
    : props.playlist.description
})

const displayCovers = computed(() => {
  const covers = []
  const defaultCover = '/default-cover.jpg'
  
  // 如果歌单有节目，使用节目封面
  if (props.playlist.items && props.playlist.items.length > 0) {
    for (let i = 0; i < 4; i++) {
      if (i < props.playlist.items.length) {
        covers.push(props.playlist.items[i].programCoverImageUrl || defaultCover)
      } else {
        covers.push(defaultCover)
      }
    }
  } else {
    // 没有节目时显示4个默认封面
    for (let i = 0; i < 4; i++) {
      covers.push(defaultCover)
    }
  }
  
  return covers
})

// 事件处理
const handleCardClick = () => {
  router.push(`/playlist/${props.playlist.id}`)
}

const handlePlayClick = () => {
  emit('play', props.playlist)
}

const handleEditClick = () => {
  emit('edit', props.playlist)
}

const handleDeleteClick = () => {
  emit('delete', props.playlist)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-cover.jpg'
}

// 工具函数
const formatDate = (dateString: string) => {
  return utils.formatDate(dateString)
}
</script>

<style scoped>
.playlist-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
  gap: 1px;
}

.cover-item {
  overflow: hidden;
}

.cover-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-card:hover .cover-item img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .card-overlay {
  opacity: 1;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.playlist-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.playlist-badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.playlist-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  flex: 1;
}

.playlist-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.playlist-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.public-icon {
  color: #10b981;
}

.private-icon {
  color: #f59e0b;
}

.status-text {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-cover {
    height: 160px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .playlist-title {
    font-size: 14px;
  }
  
  .playlist-description {
    font-size: 12px;
  }
}
</style>
