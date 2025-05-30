<template>
  <div class="index-container">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🎵 电台FM</h1>
        </div>

        <div class="search-section">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索节目、主播或标签..."
            clearable
            @enter="handleSearch"
          >
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </div>

        <div class="user-section">
          <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
            <div class="user-info-trigger">
              <div class="user-avatar">
                <img
                  :src="userAvatarUrl"
                  :alt="userEmail"
                  class="avatar-image"
                  @error="handleAvatarError"
                />
              </div>
              <span class="user-email">{{ userEmail }}</span>
              <t-icon name="chevron-down" class="dropdown-icon" />
            </div>
          </t-dropdown>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 分类导航 -->
      <section class="category-nav" v-if="categories.length > 0">
        <div class="nav-container">
          <t-button
            v-for="category in categories"
            :key="category.id"
            :theme="selectedCategoryId === category.id ? 'primary' : 'default'"
            :variant="selectedCategoryId === category.id ? 'base' : 'outline'"
            size="small"
            @click="selectCategory(category.id)"
            class="category-btn"
          >
            {{ category.name }}
          </t-button>
          <t-button
            :theme="selectedCategoryId === null ? 'primary' : 'default'"
            :variant="selectedCategoryId === null ? 'base' : 'outline'"
            size="small"
            @click="selectCategory(null)"
            class="category-btn"
          >
            全部
          </t-button>
        </div>
      </section>

      <!-- 精选节目轮播 -->
      <section class="featured-section" v-if="featuredPrograms.length > 0">
        <h2 class="section-title">🌟 精选推荐</h2>
        <div class="featured-carousel">
          <div
            v-for="(program, index) in featuredPrograms"
            :key="program.id"
            class="featured-card"
            :class="{ active: index === currentFeaturedIndex }"
            @click="goToProgram(program.id)"
          >
            <img
              :src="program.coverImageUrl"
              :alt="program.title"
              class="featured-image"
            />
            <div class="featured-overlay">
              <h3 class="featured-title">{{ program.title }}</h3>
              <p class="featured-description">{{ program.description }}</p>
              <div class="featured-meta">
                <span>{{ program.artistNarrator }}</span>
                <span>{{ formatPlayCount(program.playsCount) }} 播放</span>
              </div>
            </div>
          </div>

          <!-- 轮播指示器 -->
          <div class="carousel-indicators">
            <button
              v-for="(_, index) in featuredPrograms"
              :key="index"
              class="indicator"
              :class="{ active: index === currentFeaturedIndex }"
              @click="setFeaturedIndex(index)"
            />
          </div>

          <!-- 轮播控制按钮 -->
          <button class="carousel-btn prev" @click="prevFeatured">
            <t-icon name="chevron-left" />
          </button>
          <button class="carousel-btn next" @click="nextFeatured">
            <t-icon name="chevron-right" />
          </button>
        </div>
      </section>

      <!-- 热门节目 -->
      <section class="hot-section">
        <div class="section-header">
          <h2 class="section-title">🔥 热门节目</h2>
          <t-button theme="primary" variant="text" @click="viewMore('hot')">
            查看更多
            <template #suffix>
              <t-icon name="chevron-right" />
            </template>
          </t-button>
        </div>

        <div class="programs-grid" v-if="hotPrograms.length > 0">
          <ProgramCard
            v-for="program in hotPrograms.slice(0, 8)"
            :key="program.id"
            :program="program"
            class="animate__animated animate__fadeInUp"
          />
        </div>

        <t-skeleton
          v-else-if="programStore.loading"
          :row-col="[{ width: '100%', height: '200px' }]"
          class="skeleton-grid"
        />
      </section>

      <!-- 最新节目 -->
      <section class="latest-section">
        <div class="section-header">
          <h2 class="section-title">🆕 最新节目</h2>
          <t-button theme="primary" variant="text" @click="viewMore('latest')">
            查看更多
            <template #suffix>
              <t-icon name="chevron-right" />
            </template>
          </t-button>
        </div>

        <div class="programs-grid" v-if="programs.length > 0">
          <ProgramCard
            v-for="program in programs.slice(0, 8)"
            :key="program.id"
            :program="program"
            class="animate__animated animate__fadeInUp"
          />
        </div>

        <t-skeleton
          v-else-if="programStore.loading"
          :row-col="[{ width: '100%', height: '200px' }]"
          class="skeleton-grid"
        />
      </section>
    </main>

    <!-- 音频播放器 -->
    <AudioPlayer />

    <!-- AI聊天机器人 -->
    <ChatBot ref="chatBotRef" />

    <!-- AI助手欢迎弹窗 -->
    <AIWelcomeDialog
      v-model="showAIWelcome"
      @start-chat="handleStartChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";
import { useProgramStore, useCategoryStore } from "@/stores/counter";
import { utils, userApi } from "@/services/api";
import ProgramCard from "@/components/ProgramCard.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
import ChatBot from "@/components/ChatBot.vue";
import AIWelcomeDialog from "@/components/AIWelcomeDialog.vue";

const router = useRouter();
const programStore = useProgramStore();
const categoryStore = useCategoryStore();

const userEmail = ref("");
const userAvatarUrl = ref("");
const searchKeyword = ref("");
const selectedCategoryId = ref<number | null>(null);
const currentFeaturedIndex = ref(0);
const showAIWelcome = ref(false);
const chatBotRef = ref();
let featuredTimer: number | null = null;

// 计算属性
const programs = computed(() => programStore.programs);
const featuredPrograms = computed(() => programStore.featuredPrograms);
const hotPrograms = computed(() => programStore.hotPrograms);
const categories = computed(() => categoryStore.categories);

// 用户菜单选项
const userMenuOptions = [
  { content: "个人中心", value: "profile" },
  { content: "我的歌单", value: "playlists" },
  { content: "我的喜欢", value: "liked" },
  { content: "我的评论", value: "comments" },
  { content: "播放历史", value: "history" },
  { content: "API调试", value: "debug" },
  { content: "设置", value: "settings" },
  { content: "退出登录", value: "logout" },
];

// 初始化
onMounted(async () => {
  const email = localStorage.getItem("userEmail");
  if (!email) {
    MessagePlugin.warning("请先登录");
    router.push("/login");
    return;
  }

  userEmail.value = email;

  // 加载用户信息（包括头像）
  await loadUserInfo();

  // 检查是否需要显示AI助手欢迎弹窗
  const shouldShowAIWelcome = localStorage.getItem("showAIWelcome");
  if (shouldShowAIWelcome === "true") {
    // 延迟显示，让页面先加载完成
    setTimeout(() => {
      showAIWelcome.value = true;
      localStorage.removeItem("showAIWelcome"); // 移除标记，避免重复显示
    }, 1500);
  }

  // 加载数据
  await Promise.all([loadInitialData(), categoryStore.fetchCategories()]);
});

// 组件销毁时清理定时器
onUnmounted(() => {
  stopFeaturedCarousel();
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await userApi.getUserInfo();
    if (response.success && response.data) {
      userAvatarUrl.value = utils.getAvatarUrl(response.data.avatar);
    } else {
      // 如果获取用户信息失败，使用默认头像
      userAvatarUrl.value = utils.getAvatarUrl();
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    // 使用默认头像
    userAvatarUrl.value = utils.getAvatarUrl();
  }
};

// 头像加载错误处理
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = utils.getAvatarUrl();
};

// 加载初始数据
const loadInitialData = async () => {
  try {
    await Promise.all([
      programStore.fetchFeaturedPrograms(5),
      programStore.fetchHotPrograms(8),
      programStore.fetchPrograms({ sortBy: "createdAt_desc", limit: 8 }),
    ]);

    // 启动轮播
    startFeaturedCarousel();
  } catch (error) {
    MessagePlugin.error("加载数据失败");
    console.error(error);
  }
};

// 轮播相关函数
const startFeaturedCarousel = () => {
  if (featuredTimer) clearInterval(featuredTimer);

  featuredTimer = setInterval(() => {
    if (featuredPrograms.value.length > 1) {
      nextFeatured();
    }
  }, 4000);
};

const stopFeaturedCarousel = () => {
  if (featuredTimer) {
    clearInterval(featuredTimer);
    featuredTimer = null;
  }
};

const nextFeatured = () => {
  currentFeaturedIndex.value = (currentFeaturedIndex.value + 1) % featuredPrograms.value.length;
};

const prevFeatured = () => {
  currentFeaturedIndex.value = currentFeaturedIndex.value === 0
    ? featuredPrograms.value.length - 1
    : currentFeaturedIndex.value - 1;
};

const setFeaturedIndex = (index: number) => {
  currentFeaturedIndex.value = index;
  // 重新启动轮播
  startFeaturedCarousel();
};

// 事件处理
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`);
  }
};

const handleUserMenuClick = (data: any) => {
  switch (data.value) {
    case "logout":
      logout();
      break;
    case "profile":
      router.push("/user/profile");
      break;
    case "playlists":
      router.push("/playlists");
      break;
    case "liked":
      router.push("/user/liked");
      break;
    case "comments":
      router.push("/user/comments");
      break;
    case "history":
      router.push("/user/history");
      break;
    case "debug":
      router.push("/debug");
      break;
    case "settings":
      MessagePlugin.info("设置功能开发中...");
      break;
  }
};

const logout = () => {
  localStorage.removeItem("userEmail");
  MessagePlugin.success("已退出登录");
  router.push("/login");
};

const selectCategory = async (categoryId: number | null) => {
  selectedCategoryId.value = categoryId;
  const params = categoryId ? { categoryId, limit: 8 } : { limit: 8 };
  await programStore.fetchPrograms(params);
};

const goToProgram = (programId: number) => {
  router.push(`/program/${programId}`);
};

const viewMore = (type: string) => {
  router.push(`/programs?type=${type}`);
};

const formatPlayCount = (count: number) => {
  return utils.formatPlayCount(count);
};

// AI助手相关处理
const handleStartChat = (question?: string) => {
  if (chatBotRef.value) {
    // 打开AI助手
    chatBotRef.value.toggleChat();

    // 如果有预设问题，发送问题
    if (question) {
      setTimeout(() => {
        chatBotRef.value.sendQuickQuestion(question);
      }, 500);
    }
  }
};
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 80px; /* 为播放器留出空间 */
}

/* 顶部导航样式 */
.app-header {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-section {
  flex-shrink: 0;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.user-section {
  flex-shrink: 0;
}

.user-info-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info-trigger:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  transition: border-color 0.3s ease;
}

.user-info-trigger:hover .avatar-image {
  border-color: #3b82f6;
}

.user-email {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: #9ca3af;
  transition: transform 0.3s ease, color 0.3s ease;
}

.user-info-trigger:hover .dropdown-icon {
  color: #3b82f6;
  transform: rotate(180deg);
}

/* 主要内容样式 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
}

/* 分类导航样式 */
.category-nav {
  margin-bottom: 32px;
}

.nav-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 0;
}

.category-btn {
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* 区块标题样式 */
.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* 精选节目轮播样式 */
.featured-section {
  margin-bottom: 48px;
}

.featured-carousel {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  height: 300px;
}

.featured-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.featured-card.active {
  opacity: 1;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-card:hover .featured-image {
  transform: scale(1.05);
}

.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 40px 32px 32px;
}

.featured-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.featured-description {
  font-size: 16px;
  margin: 0 0 12px 0;
  opacity: 0.9;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  opacity: 0.8;
}

/* 轮播控制 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  border-color: white;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0;
}

.featured-carousel:hover .carousel-btn {
  opacity: 1;
}

.carousel-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn.prev {
  left: 20px;
}

.carousel-btn.next {
  right: 20px;
}

/* 节目网格样式 */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 大屏幕优化 */
@media (min-width: 1600px) {
  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 区块间距 */
.hot-section,
.latest-section {
  margin-bottom: 48px;
}

/* 动画延迟 */
.animate__fadeInUp:nth-child(1) {
  animation-delay: 0.1s;
}
.animate__fadeInUp:nth-child(2) {
  animation-delay: 0.2s;
}
.animate__fadeInUp:nth-child(3) {
  animation-delay: 0.3s;
}
.animate__fadeInUp:nth-child(4) {
  animation-delay: 0.4s;
}
.animate__fadeInUp:nth-child(5) {
  animation-delay: 0.5s;
}
.animate__fadeInUp:nth-child(6) {
  animation-delay: 0.6s;
}
.animate__fadeInUp:nth-child(7) {
  animation-delay: 0.7s;
}
.animate__fadeInUp:nth-child(8) {
  animation-delay: 0.8s;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-content {
    padding: 12px 16px;
    gap: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .featured-title {
    font-size: 24px;
  }

  .featured-overlay {
    padding: 24px 20px 20px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
  }

  .search-section {
    width: 100%;
    max-width: none;
  }

  .nav-container {
    justify-content: center;
  }

  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .featured-card {
    height: 240px;
  }

  .featured-title {
    font-size: 20px;
  }

  .featured-description {
    font-size: 14px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .main-content {
    padding: 12px;
  }

  .app-title {
    font-size: 20px;
  }
}
</style>
