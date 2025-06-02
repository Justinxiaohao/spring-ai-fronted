<template>
  <div class="index-container">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🎵 心理治愈电台</h1>
        </div>
        
        
        <div class="user-section">
          <t-dropdown :options="userMenuOptions" @click="handleUserMenuClick">
            <div class="user-info-trigger">
              <div class="user-avatar">
                <img :src="userAvatarUrl":alt="userEmail" class="avatar-image"/>
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
                <!-- <span>{{ formatPlayCount(program.playsCount) }} 播放</span> -->
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

      <!-- 热门节目展示 -->
      <section class="hot-programs-section">
        <div class="section-header">
          <h2 class="section-title">🔥 热门节目</h2>
          <t-button theme="primary" variant="text" @click="viewMore('programs')">
            查看更多
            <template #suffix>
              <t-icon name="chevron-right" />
            </template>
          </t-button>
        </div>

        <div v-if="hotPrograms.length > 0" class="programs-showcase">
          <ProgramCard
            v-for="program in hotPrograms.slice(0, 4)"
            :key="program.id"
            :program="program"
            class="program-showcase-item animate__animated animate__fadeInUp"
          />
        </div>

        <!-- 骨架屏加载状态 -->
        <div v-else-if="programStore.loading" class="programs-showcase">
          <t-skeleton
            v-for="i in 4"
            :key="i"
            :row-col="[{ width: '100%', height: '200px' }]"
            class="skeleton-item"
          />
        </div>
      </section>

      <!-- 最新歌单展示 -->
      <section class="playlists-section">
        <div class="section-header">
          <h2 class="section-title">🎵 最新歌单</h2>
          <t-button theme="primary" variant="text" @click="viewMore('playlists')">
            查看更多
            <template #suffix>
              <t-icon name="chevron-right" />
            </template>
          </t-button>
        </div>

        <!-- 调试信息 -->
        <div v-if="publicPlaylists.length === 0 && !playlistLoading && !playlistError" class="debug-info">
          <p>调试信息：</p>
          <p>publicPlaylists.length = {{ publicPlaylists.length }}</p>
          <p>playlistLoading = {{ playlistLoading }}</p>
          <p>playlistError = {{ playlistError }}</p>
          <p>API数据: {{ JSON.stringify(publicPlaylists, null, 2) }}</p>
        </div>

        <div v-if="publicPlaylists.length > 0" class="playlists-showcase">
          <PlaylistCard
            v-for="playlist in publicPlaylists.slice(0, 4)"
            :key="playlist.id"
            :playlist="playlist"
            :is-owner="false"
            class="playlist-showcase-item animate__animated animate__fadeInUp"
            @play="handlePlayPlaylist"
          />
        </div>

        <!-- 骨架屏加载状态 -->
        <div v-else-if="playlistLoading" class="playlists-showcase">
          <t-skeleton
            v-for="i in 4"
            :key="i"
            :row-col="[{ width: '100%', height: '200px' }]"
            class="skeleton-item"
          />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="playlistError" class="error-state">
          <t-icon name="error-circle" size="48px" />
          <p>加载歌单失败</p>
          <t-button theme="primary" @click="loadPublicPlaylists">重试</t-button>
        </div>
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
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";
import { useProgramStore, useCategoryStore, usePlaylistStore } from "@/stores/counter";
import { utils, userApi, playlistApi } from "@/services/api";
import ProgramCard from "@/components/ProgramCard.vue";
import PlaylistCard from "@/components/PlaylistCard.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
import ChatBot from "@/components/ChatBot.vue";
import AIWelcomeDialog from "@/components/AIWelcomeDialog.vue";

const router = useRouter();
const programStore = useProgramStore();
const categoryStore = useCategoryStore();
const playlistStore = usePlaylistStore();

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

// 公开歌单数据
const publicPlaylists = ref<any[]>([]);
const playlistLoading = ref(false);
const playlistError = ref<string | null>(null);

// 用户菜单选项
const userMenuOptions = [
  { content: "个人中心", value: "profile" },
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
  await Promise.all([
    loadInitialData(),
    categoryStore.fetchCategories(),
    loadPublicPlaylists()
  ]);
});

// 组件销毁时清理定时器
onUnmounted(() => {
  stopFeaturedCarousel();
});

// 监听 publicPlaylists 变化
watch(publicPlaylists, (newValue) => {
  console.log("publicPlaylists 数据变化:", newValue);
  console.log("publicPlaylists 长度:", newValue.length);
}, { immediate: true });

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

// 加载初始数据
const loadInitialData = async () => {
  try {
    await Promise.all([
      programStore.fetchFeaturedPrograms(5),
      programStore.fetchHotPrograms(4), // 获取热门节目（按播放次数排序）
    ]);

    // 启动轮播
    startFeaturedCarousel();
  } catch (error) {
    MessagePlugin.error("加载数据失败");
    console.error(error);
  }
};

// 加载公开歌单
const loadPublicPlaylists = async () => {
  playlistLoading.value = true;
  playlistError.value = null;

  try {
    console.log("开始加载公开歌单...");
    // 获取最新的公开歌单（API返回按更新时间倒序排列）
    const response = await playlistApi.getPublicPlaylists(4);
    console.log("公开歌单API响应:", response);

    if (response.success && response.data) {
      // API直接返回歌单数组，不是分页数据结构
      publicPlaylists.value = Array.isArray(response.data) ? response.data : [];
      console.log("公开歌单数据:", publicPlaylists.value);
      console.log("歌单数量:", publicPlaylists.value.length);
    } else {
      console.warn("公开歌单API返回失败或无数据:", response);
      playlistError.value = response.message || "获取歌单失败";
      publicPlaylists.value = [];
    }
  } catch (error) {
    console.error("加载公开歌单失败:", error);
    playlistError.value = "网络错误，请稍后重试";
    publicPlaylists.value = [];
  } finally {
    playlistLoading.value = false;
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

const clearSearch = () => {
  searchKeyword.value = '';
};

const handleUserMenuClick = (data: any) => {
  switch (data.value) {
    case "logout":
      logout();
      break;
    case "profile":
      router.push("/user/profile");
      break
    case "debug":
      router.push("/debug");
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
  switch (type) {
    case 'programs':
      router.push('/programs?type=hot'); // 跳转到热门节目页面
      break;
    case 'featured':
      router.push('/programs?type=featured');
      break;
    case 'playlists':
      router.push('/playlists/public'); // 跳转到公开歌单页面
      break;
    default:
      router.push('/programs');
  }
};

// 处理歌单播放
const handlePlayPlaylist = async (playlist: any) => {
  // 如果歌单为空，提示用户
  if (playlist.itemCount === 0) {
    MessagePlugin.info('歌单为空，请先添加节目');
    return;
  }

  // 跳转到歌单详情页面并开始播放
  router.push(`/playlist/${playlist.id}?autoplay=true`);
};

const formatPlayCount = (count: number) => {
  return utils.formatPlayCount(count);
};

// 获取分类图标
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, string> = {
    '冥想': '🧘',
    '放松': '😌',
    '睡眠': '😴',
    '音乐': '🎵',
    '故事': '📖',
    '学习': '📚',
    '英语': '🇺🇸',
    '正念': '🌸',
    '瑜伽': '🧘‍♀️',
    '自然': '🌿',
    '白噪音': '🌊',
    '治愈': '💚',
    '心理': '🧠',
    '健康': '💪',
    '儿童': '👶',
    '冥想指导': '🧘',
    '放松助眠': '😌',
    '纯净音乐': '🎵',
    '睡眠故事': '📖',
    '自然之声': '🌿',
    '正念练习': '🌱',
    'ASMR舒缓': '🌸'
  };
  return iconMap[categoryName] || '🎯';
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
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%);
  padding-bottom: 80px; /* 为播放器留出空间 */
  position: relative;
}

.index-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
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
  padding: 20px 100px;
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


.user-section {
  flex-shrink: 0;
  position: absolute;
  right: 60px;
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
  padding: 32px 40px;
  position: relative;
  z-index: 1;
}

/* 分类导航样式 */
.category-nav {
  margin-bottom: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.nav-container {
  padding: 20px 24px;
}

.category-scroll {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.category-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 24px;
  background: #f8fafc;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  user-select: none;
}

.category-tag:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.category-tag.active:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.category-icon {
  font-size: 16px;
  line-height: 1;
}

.category-name {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 区块标题样式 */
.section-title {
  font-size: 32px;
  font-weight: 900;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  padding: 0;
}

.section-header .t-button {
  font-weight: 700;
  border-radius: 25px;
  padding: 12px 28px;
  font-size: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.section-header .t-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.section-header .t-button:hover::before {
  left: 100%;
}

.section-header .t-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 精选节目轮播样式 */
.featured-section {
  margin-bottom: 56px;
}

/* 热门节目区块样式 */
.hot-programs-section {
  margin-bottom: 48px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 40px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.hot-programs-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* 歌单区块样式 */
.playlists-section {
  margin-bottom: 48px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 40px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.playlists-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
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
  line-clamp: 2;
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

/* 节目展示网格样式 */
.programs-showcase {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 16px;
}

.program-showcase-item {
  transition: all 0.3s ease;
}

.program-showcase-item:hover {
  transform: translateY(-8px);
}

/* 歌单展示网格样式 */
.playlists-showcase {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 16px;
}

.playlist-showcase-item {
  transition: all 0.3s ease;
}

.playlist-showcase-item:hover {
  transform: translateY(-8px);
}

/* 保留原有网格样式用于其他地方 */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 歌单网格样式（保留用于其他页面） */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 调试信息样式 */
.debug-info {
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
  margin: 16px 0;
  color: #6b7280;
  font-size: 14px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skeleton-item {
  border-radius: 12px;
}

/* 错误状态样式 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

.error-state p {
  margin: 16px 0;
  font-size: 16px;
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

  .hot-programs-section,
  .playlists-section {
    padding: 32px;
    margin-bottom: 40px;
  }

  .programs-showcase,
  .playlists-showcase {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .section-title {
    font-size: 28px;
  }

  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .playlists-grid {
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
    padding: 16px 20px;
  }

  .category-scroll {
    justify-content: center;
    gap: 8px;
  }

  .category-tag {
    padding: 8px 12px;
    font-size: 13px;
  }

  .category-icon {
    font-size: 14px;
  }

  .hot-programs-section,
  .playlists-section {
    padding: 24px;
    margin-bottom: 32px;
  }

  .programs-showcase,
  .playlists-showcase {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .programs-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .playlists-grid {
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
    padding: 0;
  }
}

@media (max-width: 480px) {
  .hot-programs-section,
  .playlists-section {
    padding: 20px;
    margin-bottom: 24px;
  }

  .programs-showcase,
  .playlists-showcase {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-title {
    font-size: 22px;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }

  .playlists-grid {
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
