// 用户相关类型
export interface LoginData {
  email: string
  code?: string
  password?: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

export interface UserCheckResponse {
  exists: boolean
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  success: boolean
  data: T
}

// 分页相关类型
export interface PaginationData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
  hasPrevious: boolean
  hasNext: boolean
}

// 节目相关类型
export interface Program {
  id: number
  title: string
  description: string
  audioUrl: string
  coverImageUrl: string
  categoryId: number
  categoryName: string
  artistNarrator: string
  album: string
  durationSeconds: number
  tags: string
  publicationDate: string
  playsCount: number
  likesCount: number
  commentsCount: number
  isFeatured: boolean
  status: string
  createdAt: string
  updatedAt: string
}

// 分类相关类型
export interface Category {
  id: number
  name: string
  description: string
  createdAt: string
}

// 查询参数类型
export interface ProgramQueryParams {
  page?: number
  limit?: number
  sortBy?: 'createdAt_desc' | 'playsCount_desc' | 'likesCount_desc' | 'isFeatured_desc_createdAt_desc' | 'commentsCount_desc'
  categoryId?: number
  tag?: string
}

// 播放器状态类型
export interface PlayerState {
  currentProgram: Program | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
}

// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt: string
  likedProgramsCount: number
  playlistsCount: number
  commentsCount: number
}

// 用户喜欢状态类型
export interface LikeStatus {
  isLiked: boolean
}

// 用户统计信息类型
export interface UserStats {
  totalPlays: number
  totalLikes: number
  totalComments: number
  favoriteCategories: string[]
}

// 歌单相关类型
export interface Playlist {
  id: number
  userId: number
  name: string
  description: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  itemCount: number
  items?: PlaylistItem[]
}

// 歌单项类型
export interface PlaylistItem {
  id: number
  playlistId: number
  programId: number
  displayOrder: number
  addedAt: string
  programTitle: string
  programCoverImageUrl: string
  programArtistNarrator: string
  programDurationSeconds: number
}

// 创建歌单请求类型
export interface CreatePlaylistRequest {
  name: string
  description?: string
  isPublic?: boolean
}

// 更新歌单请求类型
export interface UpdatePlaylistRequest {
  name?: string
  description?: string
  isPublic?: boolean
}

// 添加节目到歌单请求类型
export interface AddToPlaylistRequest {
  programId: number
}

// 调整歌单顺序请求类型
export interface UpdatePlaylistOrderRequest {
  itemIds: number[]
}

// 评论相关类型
export interface Comment {
  id: number
  userId: number
  userName: string
  userEmail?: string
  programId: number
  programTitle?: string
  parentCommentId: number | null
  parentUserName?: string | null
  content: string
  createdAt: string
  updatedAt: string
  replyCount?: number
  replies?: Comment[]
}

// 评论列表响应类型
export interface CommentListResponse {
  items: Comment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建评论请求类型
export interface CreateCommentRequest {
  content: string
  parentCommentId?: number | null
}

// 评论查询参数类型
export interface CommentQueryParams {
  page?: number
  limit?: number
}
