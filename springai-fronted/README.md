# 🎵 电台 FM - Spring AI 前端应用

一个基于 Vue 3 + TDesign 的现代化电台节目前端应用，为 Spring AI 后端提供完整的用户界面。

## ✨ 功能特性

### 🎯 核心功能

- **节目浏览**：支持分类浏览、热门推荐、最新节目
- **音频播放**：内置音频播放器，支持播放控制、进度调节、音量调节
- **搜索功能**：支持按标题、主播、标签搜索节目
- **节目详情**：详细的节目信息展示和相关推荐
- **个性化互动**：喜欢/取消喜欢节目，个人收藏管理
- **歌单管理**：创建、编辑、删除歌单，添加/移除节目
- **评论互动**：发表评论、回复评论、评论管理
- **用户中心**：个人信息管理、播放历史、喜欢列表、歌单管理、评论管理
- **响应式设计**：完美适配桌面端和移动端

### 🎨 用户体验

- **现代化 UI**：基于 TDesign 组件库的精美界面
- **流畅动画**：使用 Animate.css 提供丰富的过渡效果
- **加载状态**：完善的加载和错误状态处理
- **用户友好**：直观的操作流程和交互反馈

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **UI 组件库**：TDesign Vue Next
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **类型检查**：TypeScript
- **动画库**：Animate.css
- **图标**：TDesign Icons

## 📁 项目结构

```
springai-fronted/
├── public/                 # 静态资源
│   ├── favicon.ico
│   └── default-cover.jpg   # 默认封面图片
├── src/
│   ├── components/         # 可复用组件
│   │   ├── AudioPlayer.vue # 音频播放器
│   │   ├── LikeButton.vue  # 喜欢按钮
│   │   ├── AddToPlaylistButton.vue # 添加到歌单按钮
│   │   ├── PlaylistCard.vue # 歌单卡片
│   │   ├── CommentItem.vue # 评论项组件
│   │   ├── CommentList.vue # 评论列表组件
│   │   └── ProgramCard.vue # 节目卡片
│   ├── services/          # API服务层
│   │   └── api.ts         # API接口封装
│   ├── stores/            # Pinia状态管理
│   │   └── counter.ts     # 应用状态
│   ├── types/             # TypeScript类型定义
│   │   └── index.ts       # 类型声明
│   ├── views/             # 页面组件
│   │   ├── Index.vue      # 首页
│   │   ├── LoginRegister.vue # 登录注册
│   │   ├── ProgramDetail.vue # 节目详情
│   │   ├── ProgramList.vue   # 节目列表
│   │   ├── SearchPage.vue    # 搜索页面
│   │   ├── UserProfile.vue   # 用户个人中心
│   │   ├── UserLikedPrograms.vue # 用户喜欢的节目
│   │   ├── UserPlayHistory.vue   # 播放历史
│   │   ├── UserComments.vue      # 用户评论页面
│   │   ├── PlaylistsPage.vue     # 歌单列表页面
│   │   └── PlaylistDetail.vue    # 歌单详情页面
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

## 🔧 配置说明

### 环境变量

- `VITE_API_BASE_URL`：后端 API 地址
- `VITE_APP_TITLE`：应用标题
- `VITE_APP_VERSION`：应用版本

### API 集成

项目已完整集成后端 API，包括：

- 节目列表查询（支持分页、排序、筛选）
- 节目详情获取
- 分类管理
- 播放统计
- 热门和精选节目
- 用户喜欢/取消喜欢节目
- 用户个人信息管理
- 用户播放历史和喜欢列表
- 歌单管理（创建、编辑、删除）
- 歌单内容管理（添加、移除、排序节目）
- 评论管理（发表、回复、删除评论）

## 📱 页面说明

### 首页 (`/index`)

- 精选节目轮播
- 分类导航
- 热门节目展示
- 最新节目列表

### 节目详情 (`/program/:id`)

- 节目完整信息展示
- 音频播放功能
- 相关推荐

### 节目列表 (`/programs`)

- 支持多种排序方式
- 分类和标签筛选
- 分页浏览

### 搜索页面 (`/search`)

- 关键词搜索
- 热门搜索建议
- 搜索结果筛选

### 用户中心 (`/user/profile`)

- 个人信息展示和编辑
- 用户统计数据
- 功能菜单导航

### 我的喜欢 (`/user/liked`)

- 用户喜欢的节目列表
- 支持排序和筛选
- 统计信息展示

### 播放历史 (`/user/history`)

- 用户播放记录
- 播放统计信息
- 历史记录管理

### 歌单列表 (`/playlists`)

- 用户创建的歌单列表
- 歌单创建、编辑、删除
- 歌单统计信息

### 歌单详情 (`/playlist/:id`)

- 歌单完整信息展示
- 歌单内节目列表
- 节目播放和管理
- 添加/移除节目功能

### 用户评论 (`/user/comments`)

- 用户发表的所有评论
- 评论排序和筛选
- 评论删除管理
- 快速跳转到相关节目

## 🎵 音频播放器

内置的音频播放器支持：

- 播放/暂停控制
- 进度条拖拽
- 音量调节
- 快进/快退（15 秒）
- 迷你播放器和全屏播放器切换

## 📊 状态管理

使用 Pinia 管理应用状态：

- `useProgramStore`：节目数据管理
- `useCategoryStore`：分类数据管理
- `usePlayerStore`：播放器状态管理
- `useUserStore`：用户信息和统计数据管理
- `usePlaylistStore`：歌单数据和操作管理
- `useCommentStore`：评论数据和交互管理

## 🎨 样式设计

- 采用现代化的设计语言
- 支持深色/浅色主题
- 完整的响应式布局
- 流畅的动画过渡效果

## 🎉 最新更新

### v2.0.0 - 评论功能完整实现

**新增功能**:

- 💬 完整的评论系统（发表、回复、删除）
- 🎵 歌单管理功能
- 👤 用户个人中心完善
- 📱 全面的响应式设计

**技术改进**:

- 🔧 TypeScript 类型安全
- 📊 Pinia 状态管理优化
- 🎨 现代化 UI 组件
- ⚡ 性能优化和用户体验提升

## 🔗 API 文档

详细的 API 文档请参考 `src/API_DOCUMENTATION.md`

## 🤝 开发建议

1. **组件开发**：遵循 Vue 3 Composition API 最佳实践
2. **类型安全**：充分利用 TypeScript 类型检查
3. **状态管理**：合理使用 Pinia 进行状态管理
4. **样式规范**：使用 scoped 样式避免样式冲突
5. **性能优化**：合理使用懒加载和代码分割

## 📄 许可证

MIT License
