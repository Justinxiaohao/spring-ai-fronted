<template>
  <div class="program-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <t-skeleton
        :row-col="[
          { width: '100%', height: '300px' },
          { width: '60%', height: '32px' },
          { width: '40%', height: '20px' },
          { width: '100%', height: '100px' },
        ]"
      />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <t-result theme="error" title="加载失败" :description="error">
        <template #extra>
          <t-button theme="primary" @click="loadProgramDetail">
            重新加载
          </t-button>
        </template>
      </t-result>
    </div>

    <!-- 节目详情内容 -->
    <div v-else-if="program" class="detail-content">
      <!-- 头部信息 -->
      <header class="program-header">
        <div class="header-background">
          <img
            :src="program.coverImageUrl"
            :alt="program.title"
            class="background-image"
          />
          <div class="background-overlay"></div>
        </div>

        <div class="header-content">
          <div class="program-cover">
            <img
              :src="program.coverImageUrl"
              :alt="program.title"
              class="cover-image"
            />
            <div class="play-button-overlay">
              <t-button
                theme="primary"
                size="large"
                shape="circle"
                @click="handlePlay"
                :loading="playerState.isLoading && isCurrentProgram"
              >
                <template #icon>
                  <t-icon
                    :name="
                      isCurrentProgram && playerState.isPlaying
                        ? 'pause'
                        : 'play'
                    "
                    size="32px"
                  />
                </template>
              </t-button>
            </div>
          </div>

          <div class="program-info">
            <div class="featured-badge" v-if="program.isFeatured">
              <t-tag theme="warning" size="large">精选节目</t-tag>
            </div>

            <h1 class="program-title">{{ program.title }}</h1>

            <div class="program-meta">
              <div class="meta-item">
                <t-icon name="user" />
                <span>{{ program.artistNarrator }}</span>
              </div>
              <div class="meta-item">
                <t-icon name="folder" />
                <span>{{ program.album }}</span>
              </div>
              <div class="meta-item">
                <t-icon name="calendar" />
                <span>{{ formatDate(program.publicationDate) }}</span>
              </div>
              <div class="meta-item">
                <t-icon name="time" />
                <span>{{ formatDuration(program.durationSeconds) }}</span>
              </div>
            </div>

            <div class="program-stats">
              <div class="stat-item">
                <t-icon name="play-circle" />
                <span>{{ formatPlayCount(program.playsCount) }} 播放</span>
              </div>
              <div class="stat-item">
                <LikeButton
                  :program-id="program.id"
                  :initial-like-count="program.likesCount"
                  :show-count="true"
                  :show-text="true"
                  size="large"
                  @like-changed="handleLikeChanged"
                />
              </div>
              <div class="stat-item">
                <t-icon name="chat" />
                <span>{{ program.commentsCount }} 评论</span>
              </div>
            </div>

            <div class="program-tags" v-if="programTags.length > 0">
              <t-tag
                v-for="tag in programTags"
                :key="tag"
                variant="light"
                class="tag-item"
              >
                {{ tag }}
              </t-tag>
            </div>

            <div class="program-actions">
              <AddToPlaylistButton
                :program-id="program.id"
                :show-text="true"
                size="large"
                @added="handleAddedToPlaylist"
              />
            </div>
          </div>
        </div>
      </header>

      <!-- 节目描述 -->
      <section class="program-description">
        <div class="content-container">
          <h2 class="section-title">节目介绍</h2>
          <div class="description-content">
            <p>{{ program.description }}</p>
          </div>
        </div>
      </section>

      <!-- 评论区域 -->
      <section class="comments-section" v-if="program">
        <div class="content-container">
          <CommentList :program-id="program.id" />
        </div>
      </section>

      <!-- 相关推荐 -->
      <section class="related-programs" v-if="relatedPrograms.length > 0">
        <div class="content-container">
          <h2 class="section-title">相关推荐</h2>
          <div class="programs-grid">
            <ProgramCard
              v-for="relatedProgram in relatedPrograms"
              :key="relatedProgram.id"
              :program="relatedProgram"
              class="animate__animated animate__fadeInUp"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- 音频播放器 -->
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";
import { useProgramStore, usePlayerStore } from "@/stores/counter";
import { utils } from "@/services/api";
import type { Program } from "@/types";
import ProgramCard from "@/components/ProgramCard.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
import LikeButton from "@/components/LikeButton.vue";
import AddToPlaylistButton from "@/components/AddToPlaylistButton.vue";
import CommentList from "@/components/CommentList.vue";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const playerStore = usePlayerStore();

const program = ref<Program | null>(null);
const relatedPrograms = ref<Program[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// 计算属性
const playerState = computed(() => playerStore.playerState);
const isCurrentProgram = computed(
  () => playerState.value.currentProgram?.id === program.value?.id
);

const programTags = computed(() =>
  program.value?.tags
    ? program.value.tags.split(",").map((tag) => tag.trim())
    : []
);

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProgramDetail();
    }
  },
  { immediate: true }
);

// 初始化
onMounted(() => {
  loadProgramDetail();
});

// 加载节目详情
const loadProgramDetail = async () => {
  const programId = Number(route.params.id);
  if (!programId) {
    error.value = "无效的节目ID";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await programStore.fetchProgramDetail(programId);
    if (result) {
      program.value = result;
      // 加载相关推荐（同分类的其他节目）
      await loadRelatedPrograms(result.categoryId, programId);
    } else {
      error.value = "节目不存在";
    }
  } catch (err) {
    error.value = "加载节目详情失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 加载相关推荐
const loadRelatedPrograms = async (categoryId: number, excludeId: number) => {
  try {
    const response = await programStore.fetchPrograms({
      categoryId,
      limit: 6,
      sortBy: "playsCount_desc",
    });
    // 排除当前节目
    relatedPrograms.value = programStore.programs.filter(
      (p) => p.id !== excludeId
    );
  } catch (err) {
    console.error("加载相关推荐失败:", err);
  }
};

// 播放处理
const handlePlay = async () => {
  if (!program.value) return;

  if (isCurrentProgram.value && playerState.value.isPlaying) {
    playerStore.pauseProgram();
  } else if (isCurrentProgram.value && !playerState.value.isPlaying) {
    playerStore.resumeProgram();
  } else {
    await playerStore.playProgram(program.value);
  }
};

// 喜欢状态变化处理
const handleLikeChanged = (isLiked: boolean, newCount: number) => {
  if (program.value) {
    program.value.likesCount = newCount;
  }
};

// 添加到歌单处理
const handleAddedToPlaylist = (playlist: any) => {
  console.log(`节目已添加到歌单:`, playlist.name);
};

// 工具函数
const formatDuration = (seconds: number) => utils.formatDuration(seconds);
const formatPlayCount = (count: number) => utils.formatPlayCount(count);
const formatDate = (dateString: string) => utils.formatDate(dateString);
</script>

<style scoped>
.program-detail-container {
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
.program-header {
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

.background-image {
  width: 100%;
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

.program-cover {
  position: relative;
  flex-shrink: 0;
}

.cover-image {
  width: 240px;
  height: 240px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.play-button-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.program-cover:hover .play-button-overlay {
  opacity: 1;
}

.program-info {
  flex: 1;
  color: white;
  min-width: 0;
}

.featured-badge {
  margin-bottom: 12px;
}

.program-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.program-meta {
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

.program-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.program-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.program-actions {
  margin-top: 20px;
}

/* 内容区域样式 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.program-description {
  padding: 48px 0;
  background: white;
}

.description-content {
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
}

.comments-section {
  padding: 48px 0;
  background: #f8fafc;
}

.related-programs {
  padding: 48px 0;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .program-header {
    height: 300px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
    gap: 20px;
  }

  .cover-image {
    width: 180px;
    height: 180px;
  }

  .program-title {
    font-size: 24px;
  }

  .program-meta {
    justify-content: center;
    gap: 16px;
  }

  .program-stats {
    justify-content: center;
    gap: 20px;
  }

  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .content-container {
    padding: 0 16px;
  }
}
</style>
