<template>
  <div
    class="program-card animate__animated animate__fadeInUp"
    @click="handleCardClick"
  >
    <div class="card-image">
      <img
        :src="program.coverImageUrl"
        :alt="program.title"
        @error="handleImageError"
      />
      <div class="play-overlay">
        <t-button
          theme="primary"
          shape="circle"
          size="large"
          @click.stop="handlePlayClick"
          :loading="isPlaying && playerState.isLoading"
        >
          <template #icon>
            <t-icon
              :name="
                isCurrentProgram && playerState.isPlaying ? 'pause' : 'play'
              "
            />
          </template>
        </t-button>
      </div>
      <div class="featured-badge" v-if="program.isFeatured">
        <t-tag theme="warning" size="small">精选</t-tag>
      </div>
    </div>

    <div class="card-content">
      <h3 class="program-title">{{ program.title }}</h3>
      <p class="program-description">{{ truncatedDescription }}</p>

      <div class="program-meta">
        <div class="meta-item">
          <t-icon name="user" size="14px" />
          <span>{{ program.artistNarrator }}</span>
        </div>
        <div class="meta-item">
          <t-icon name="time" size="14px" />
          <span>{{ formattedDuration }}</span>
        </div>
      </div>

      <div class="program-stats">
        <div class="stat-item">
          <t-icon name="play-circle" size="14px" />
          <span>{{ formattedPlayCount }}</span>
        </div>
        <div class="stat-item">
          <LikeButton
            :program-id="program.id"
            :initial-like-count="program.likesCount"
            :show-count="true"
            :show-text="false"
            size="small"
            @like-changed="handleLikeChanged"
          />
        </div>
        <div class="stat-item">
          <t-icon name="chat" size="14px" />
          <span>{{ program.commentsCount }}</span>
        </div>
      </div>

      <div class="program-tags" v-if="programTags.length > 0">
        <t-tag
          v-for="tag in programTags.slice(0, 3)"
          :key="tag"
          size="small"
          variant="light"
        >
          {{ tag }}
        </t-tag>
      </div>

      <div class="program-actions">
        <AddToPlaylistButton
          :program-id="program.id"
          :show-text="false"
          size="small"
          @added="handleAddedToPlaylist"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Program } from "@/types";
import { usePlayerStore } from "@/stores/counter";
import { utils } from "@/services/api";
import LikeButton from "./LikeButton.vue";
import AddToPlaylistButton from "./AddToPlaylistButton.vue";

interface Props {
  program: Program;
}

const props = defineProps<Props>();
const router = useRouter();
const playerStore = usePlayerStore();

// 计算属性
const playerState = computed(() => playerStore.playerState);
const isCurrentProgram = computed(
  () => playerState.value.currentProgram?.id === props.program.id
);
const isPlaying = computed(
  () => isCurrentProgram.value && playerState.value.isPlaying
);

const truncatedDescription = computed(() => {
  const maxLength = 80;
  return props.program.description.length > maxLength
    ? props.program.description.substring(0, maxLength) + "..."
    : props.program.description;
});

const formattedDuration = computed(() =>
  utils.formatDuration(props.program.durationSeconds)
);

const formattedPlayCount = computed(() =>
  utils.formatPlayCount(props.program.playsCount)
);

const programTags = computed(() =>
  props.program.tags
    ? props.program.tags.split(",").map((tag) => tag.trim())
    : []
);

// 事件处理
const handleCardClick = () => {
  router.push(`/program/${props.program.id}`);
};

const handlePlayClick = async () => {
  if (isCurrentProgram.value && playerState.value.isPlaying) {
    playerStore.pauseProgram();
  } else if (isCurrentProgram.value && !playerState.value.isPlaying) {
    playerStore.resumeProgram();
  } else {
    await playerStore.playProgram(props.program);
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/default-cover.jpg"; // 默认封面图片
};

const handleLikeChanged = (isLiked: boolean, newCount: number) => {
  // 更新本地的点赞数（如果需要的话）
  // 这里可以发出事件给父组件，或者更新全局状态
  console.log(`节目 ${props.program.id} 喜欢状态变化:`, isLiked, newCount);
};

const handleAddedToPlaylist = (playlist: any) => {
  console.log(`节目 ${props.program.id} 已添加到歌单:`, playlist.name);
};
</script>

<style scoped>
.program-card {
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

.program-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.program-card:hover .card-image img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.program-card:hover .play-overlay {
  opacity: 1;
}

.featured-badge {
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

.program-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
  flex: 1;
}

.program-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.program-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.program-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.program-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-image {
    height: 160px;
  }

  .card-content {
    padding: 12px;
  }

  .program-title {
    font-size: 14px;
  }

  .program-description {
    font-size: 12px;
  }
}
</style>
