<template>
  <div 
    class="playlist-card animate__animated animate__fadeInUp"
    @click="handleCardClick"
  >
    <div class="card-header">
      <div class="playlist-icon">
        <t-icon name="queue-music" size="32px" />
      </div>

      <div class="header-actions">
        <t-button
          theme="primary"
          shape="circle"
          size="large"
          @click.stop="handlePlayClick"
        >
          <template #icon>
            <t-icon name="play" size="20px" />
          </template>
        </t-button>

        <t-dropdown
          v-if="isOwner"
          :options="actionOptions"
          @click="handleActionClick"
        >
          <t-button
            theme="default"
            variant="text"
            size="small"
          >
            <template #icon>
              <t-icon name="more" />
            </template>
          </t-button>
        </t-dropdown>
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
          <span>{{ formatDate(playlist.createdAt) }}</span>
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

const actionOptions = computed(() => {
  return [
    {
      content: '编辑歌单',
      value: 'edit',
      prefixIcon: 'edit'
    },
    {
      content: '删除歌单',
      value: 'delete',
      prefixIcon: 'delete',
      theme: 'error'
    }
  ]
})

// 事件处理
const handleCardClick = () => {
  router.push(`/playlist/${props.playlist.id}`)
}

const handlePlayClick = () => {
  emit('play', props.playlist)
}

const handleActionClick = (data: any) => {
  if (data.value === 'edit') {
    emit('edit', props.playlist)
  } else if (data.value === 'delete') {
    emit('delete', props.playlist)
  }
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
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.playlist-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playlist-badge {
  position: absolute;
  top: 12px;
  right: 12px;
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
  .card-header {
    padding: 16px;
  }

  .playlist-icon {
    width: 48px;
    height: 48px;
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
