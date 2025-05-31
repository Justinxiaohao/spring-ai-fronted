<template>
  <div 
    class="audio-player"
    :class="{ 'player-expanded': isExpanded }"
    v-if="playerState.currentProgram"
  >
    <!-- 音频元素 -->
    <audio
      ref="audioRef"
      :src="playerState.currentProgram.audioUrl"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
      preload="metadata"
    />
    
    <!-- 迷你播放器 -->
    <div class="mini-player" v-if="!isExpanded">
      <div class="player-info">
        <img 
          :src="playerState.currentProgram.coverImageUrl" 
          :alt="playerState.currentProgram.title"
          class="cover-mini"
        />
        <div class="info-text">
          <div class="title">{{ playerState.currentProgram.title }}</div>
          <div class="artist">{{ playerState.currentProgram.artistNarrator }}</div>
        </div>
      </div>
      
      <div class="player-controls-mini">
        <t-button
          theme="primary"
          variant="text"
          @click="togglePlay"
          :loading="playerState.isLoading"
        >
          <template #icon>
            <t-icon :name="playerState.isPlaying ? 'pause' : 'play'" />
          </template>
        </t-button>
        
        <t-button
          theme="primary"
          variant="text"
          @click="toggleExpanded"
        >
          <template #icon>
            <t-icon name="chevron-up" />
          </template>
        </t-button>
      </div>
    </div>
    
    <!-- 展开的播放器 -->
    <div class="expanded-player" v-if="isExpanded">
      <div class="player-header">
        <t-button
          theme="primary"
          variant="text"
          @click="toggleExpanded"
        >
          <template #icon>
            <t-icon name="chevron-down" />
          </template>
        </t-button>
        <span class="header-title">正在播放</span>
        <div></div>
      </div>
      
      <div class="player-content">
        <div class="cover-section">
          <img 
            :src="playerState.currentProgram.coverImageUrl" 
            :alt="playerState.currentProgram.title"
            class="cover-large"
          />
        </div>
        
        <div class="info-section">
          <h2 class="program-title">{{ playerState.currentProgram.title }}</h2>
          <p class="program-artist">{{ playerState.currentProgram.artistNarrator }}</p>
          <p class="program-album">{{ playerState.currentProgram.album }}</p>
        </div>
        
        <div class="progress-section">
          <div class="time-display">
            <span class="current-time">{{ formatTime(playerState.currentTime) }}</span>
            <span class="total-time">{{ formatTime(playerState.duration) }}</span>
          </div>
          
          <t-slider
            v-model="progressValue"
            :max="100"
            @change="handleProgressChange"
            class="progress-slider"
          />
        </div>
        
        <div class="controls-section">
          <t-button
            theme="primary"
            variant="text"
            size="large"
            @click="seekBackward"
          >
            <template #icon>
              <t-icon name="skip-previous" />
            </template>
          </t-button>
          
          <t-button
            theme="primary"
            size="large"
            @click="togglePlay"
            :loading="playerState.isLoading"
          >
            <template #icon>
              <t-icon :name="playerState.isPlaying ? 'pause' : 'play'" size="24px" />
            </template>
          </t-button>
          
          <t-button
            theme="primary"
            variant="text"
            size="large"
            @click="seekForward"
          >
            <template #icon>
              <t-icon name="skip-next" />
            </template>
          </t-button>
        </div>
        
        <div class="volume-section">
          <t-icon name="sound" />
          <t-slider
            v-model="volumeValue"
            :max="100"
            @change="handleVolumeChange"
            class="volume-slider"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/counter'
import { utils } from '@/services/api'

const playerStore = usePlayerStore()
const audioRef = ref<HTMLAudioElement>()
const isExpanded = ref(false)

// 计算属性
const playerState = computed(() => playerStore.playerState)

const progressValue = computed({
  get: () => {
    if (playerState.value.duration === 0) return 0
    return (playerState.value.currentTime / playerState.value.duration) * 100
  },
  set: (value: number) => {
    if (audioRef.value && playerState.value.duration > 0) {
      const newTime = (value / 100) * playerState.value.duration
      audioRef.value.currentTime = newTime
      playerStore.setCurrentTime(newTime)
    }
  }
})

const volumeValue = computed({
  get: () => playerState.value.volume * 100,
  set: (value: number) => {
    const volume = value / 100
    playerStore.setVolume(volume)
    if (audioRef.value) {
      audioRef.value.volume = volume
    }
  }
})

// 监听播放状态变化
watch(() => playerState.value.isPlaying, (isPlaying) => {
  if (audioRef.value) {
    if (isPlaying) {
      audioRef.value.play()
    } else {
      audioRef.value.pause()
    }
  }
})

// 监听当前节目变化
watch(() => playerState.value.currentProgram, async () => {
  if (audioRef.value) {
    await nextTick()
    audioRef.value.load()
  }
})

// 事件处理
const handleLoadedMetadata = () => {
  if (audioRef.value) {
    playerStore.setDuration(audioRef.value.duration)
    audioRef.value.volume = playerState.value.volume
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    playerStore.setCurrentTime(audioRef.value.currentTime)
  }
}

const handleEnded = () => {
  playerStore.stopProgram()
}

const handleError = () => {
  console.error('音频播放错误')
  playerStore.stopProgram()
}

const togglePlay = () => {
  if (playerState.value.isPlaying) {
    playerStore.pauseProgram()
  } else {
    playerStore.resumeProgram()
  }
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleProgressChange = (value: number) => {
  progressValue.value = value
}

const handleVolumeChange = (value: number) => {
  volumeValue.value = value
}

const seekBackward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 15)
  }
}

const seekForward = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(
      audioRef.value.duration, 
      audioRef.value.currentTime + 15
    )
  }
}

const formatTime = (seconds: number) => {
  return utils.formatDuration(Math.floor(seconds))
}
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.player-expanded {
  height: 100vh;
  top: 0;
}

/* 迷你播放器样式 */
.mini-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 72px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cover-mini {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-text {
  min-width: 0;
  flex: 1;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.artist {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 展开播放器样式 */
.expanded-player {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.player-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  overflow-y: auto;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.cover-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.cover-large {
  width: 280px;
  height: 280px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: white;
}

.info-section {
  text-align: center;
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.program-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.program-artist {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.program-album {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.progress-slider {
  width: 100%;
}

.controls-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 300px;
  width: 100%;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #6b7280;
}

.volume-slider {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mini-player {
    padding: 10px 12px;
    height: 64px;
  }

  .cover-mini {
    width: 44px;
    height: 44px;
    border-radius: 6px;
  }

  .title {
    font-size: 13px;
  }

  .artist {
    font-size: 11px;
  }

  .player-content {
    padding: 16px 12px;
    gap: 16px;
  }

  .cover-large {
    width: 240px;
    height: 240px;
    border-radius: 12px;
  }

  .info-section {
    padding: 16px;
  }

  .program-title {
    font-size: 20px;
  }

  .program-artist {
    font-size: 14px;
  }

  .controls-section {
    gap: 16px;
    padding: 12px;
  }

  .progress-section {
    max-width: 100%;
    padding: 12px;
  }

  .volume-section {
    max-width: 100%;
    padding: 12px;
  }
}
</style>
