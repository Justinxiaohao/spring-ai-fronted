import type {
  ApiResponse,
  Program,
  Category,
  PaginationData,
  ProgramQueryParams,
  UserInfo,
  Playlist,
  PlaylistItem,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddToPlaylistRequest,
  UpdatePlaylistOrderRequest,
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  CommentQueryParams
} from '@/types'

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 获取用户邮箱
function getUserEmail(): string | null {
  return localStorage.getItem('userEmail')
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // 确保URL构建正确
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      ...options.headers,
    },
    ...options,
  }

  // 如果不是FormData，则设置Content-Type
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers = {
      'Content-Type': 'application/json',
      ...defaultOptions.headers,
    }
  }

  // 自动添加用户邮箱到请求头
  const userEmail = getUserEmail()
  if (userEmail) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'User-Email': userEmail
    }
  }

  try {
    const response = await fetch(url, defaultOptions)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 节目相关 API
export const programApi = {
  // 获取节目列表
  async getPrograms(params: ProgramQueryParams = {}): Promise<ApiResponse<PaginationData<Program>>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/api/programs${queryString ? `?${queryString}` : ''}`
    
    return request<PaginationData<Program>>(endpoint)
  },

  // 获取节目详情
  async getProgramDetail(programId: number): Promise<ApiResponse<Program>> {
    return request<Program>(`/api/programs/${programId}`)
  },

  // 播放节目（统计播放次数）
  async playProgram(programId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/programs/${programId}/play`, {
      method: 'POST'
    })
  },

  // 获取热门节目
  async getHotPrograms(page = 1, limit = 10): Promise<ApiResponse<PaginationData<Program>>> {
    return request<PaginationData<Program>>(`/api/programs/hot?page=${page}&limit=${limit}`)
  },

  // 获取精选节目
  async getFeaturedPrograms(page = 1, limit = 10): Promise<ApiResponse<PaginationData<Program>>> {
    return request<PaginationData<Program>>(`/api/programs/featured?page=${page}&limit=${limit}`)
  },

  // 喜欢节目
  async likeProgram(programId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/programs/${programId}/like`, {
      method: 'POST'
    })
  },

  // 取消喜欢节目
  async unlikeProgram(programId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/programs/${programId}/like`, {
      method: 'DELETE'
    })
  },

  // 检查喜欢状态
  async getLikeStatus(programId: number): Promise<ApiResponse<boolean>> {
    return request<boolean>(`/api/programs/${programId}/like-status`)
  }
}

// 分类相关 API
export const categoryApi = {
  // 获取所有分类
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return request<Category[]>('/api/categories')
  },

  // 获取分类详情
  async getCategoryDetail(categoryId: number): Promise<ApiResponse<Category>> {
    return request<Category>(`/api/categories/${categoryId}`)
  },

  // 创建分类
  async createCategory(data: { name: string; description: string }): Promise<ApiResponse<Category>> {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// 用户相关 API
export const userApi = {
  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>('/api/me')
  },

  // 更新用户信息
  async updateUserInfo(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
    return request<UserInfo>('/api/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 获取用户喜欢的节目列表
  async getLikedPrograms(page = 1, limit = 10): Promise<ApiResponse<PaginationData<Program>>> {
    return request<PaginationData<Program>>(`/api/me/liked-programs?page=${page}&limit=${limit}`)
  },

  // 获取用户的歌单
  async getUserPlaylists(): Promise<ApiResponse<Playlist[]>> {
    return request<Playlist[]>('/api/me/playlists')
  },



  // 获取用户的评论
  async getUserComments(page = 1, limit = 10): Promise<ApiResponse<CommentListResponse>> {
    return request<CommentListResponse>(`/api/me/comments?page=${page}&limit=${limit}`)
  },

  // 获取用户播放历史
  async getPlayHistory(page = 1, limit = 10): Promise<ApiResponse<PaginationData<Program>>> {
    return request<PaginationData<Program>>(`/api/me/play-history?page=${page}&limit=${limit}`)
  },

  // 清空播放历史
  async clearPlayHistory(): Promise<ApiResponse<null>> {
    return request<null>('/api/me/play-history', {
      method: 'DELETE'
    })
  }
}

// 歌单相关 API
export const playlistApi = {
  // 创建歌单
  async createPlaylist(data: CreatePlaylistRequest): Promise<ApiResponse<Playlist>> {
    return request<Playlist>('/api/playlists', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取用户歌单列表
  async getUserPlaylists(): Promise<ApiResponse<Playlist[]>> {
    return request<Playlist[]>('/api/playlists')
  },

  // 获取歌单详情
  async getPlaylistDetail(playlistId: number): Promise<ApiResponse<Playlist>> {
    return request<Playlist>(`/api/playlists/${playlistId}`)
  },

  // 更新歌单
  async updatePlaylist(playlistId: number, data: UpdatePlaylistRequest): Promise<ApiResponse<Playlist>> {
    return request<Playlist>(`/api/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  // 删除歌单
  async deletePlaylist(playlistId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/playlists/${playlistId}`, {
      method: 'DELETE'
    })
  },

  // 添加节目到歌单
  async addProgramToPlaylist(playlistId: number, data: AddToPlaylistRequest): Promise<ApiResponse<PlaylistItem>> {
    return request<PlaylistItem>(`/api/playlists/${playlistId}/items`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取歌单内容
  async getPlaylistItems(playlistId: number): Promise<ApiResponse<PlaylistItem[]>> {
    return request<PlaylistItem[]>(`/api/playlists/${playlistId}/items`)
  },

  // 移除歌单内节目
  async removePlaylistItem(playlistId: number, itemId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/playlists/${playlistId}/items/${itemId}`, {
      method: 'DELETE'
    })
  },

  // 调整歌单顺序
  async updatePlaylistOrder(playlistId: number, data: UpdatePlaylistOrderRequest): Promise<ApiResponse<null>> {
    return request<null>(`/api/playlists/${playlistId}/items/order`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

// 评论相关 API
export const commentApi = {
  // 发表评论
  async createComment(programId: number, data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    return request<Comment>(`/api/programs/${programId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取节目评论列表
  async getProgramComments(programId: number, params: CommentQueryParams = {}): Promise<ApiResponse<CommentListResponse>> {
    const { page = 1, limit = 10 } = params
    return request<CommentListResponse>(`/api/programs/${programId}/comments?page=${page}&limit=${limit}`)
  },

  // 获取评论回复列表
  async getCommentReplies(commentId: number): Promise<ApiResponse<Comment[]>> {
    return request<Comment[]>(`/api/comments/${commentId}/replies`)
  },



  // 获取评论详情
  async getCommentDetail(commentId: number): Promise<ApiResponse<Comment>> {
    return request<Comment>(`/api/comments/${commentId}`)
  },

  // 删除评论
  async deleteComment(commentId: number): Promise<ApiResponse<null>> {
    return request<null>(`/api/comments/${commentId}`, {
      method: 'DELETE'
    })
  }
}

// 搜索相关 API
export const searchApi = {
  // 搜索节目
  async searchPrograms(params: { q?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<PaginationData<Program>>> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/programs/search${queryString ? `?${queryString}` : ''}`

    return request<PaginationData<Program>>(endpoint)
  }
}

// AI聊天相关 API
export const chatApi = {
  // 发送聊天消息（流式响应）
  async sendMessage(prompt: string, chatId: string): Promise<ReadableStream<Uint8Array> | null> {
    // 确保URL构建正确
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const url = `${baseUrl}/ai/chat?prompt=${encodeURIComponent(prompt)}&chatId=${encodeURIComponent(chatId)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html; charset=utf-8',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.body
    } catch (error) {
      console.error('Chat API request failed:', error)
      throw error
    }
  }
}

// 工具函数
export const utils = {
  // 格式化时长（秒转为 mm:ss 格式）
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  // 格式化播放次数
  formatPlayCount(count: number): string {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`
    }
    return count.toString()
  },

  // 格式化日期
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  // 获取正确的头像URL
  getAvatarUrl(avatar?: string): string {
    if (!avatar) {
      return '/default-avatar.jpg'
    }

    // 如果已经是完整URL，直接返回
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }

    // 如果是相对路径，拼接后端服务器地址
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`

    return `${baseUrl}${cleanAvatar}`
  }
}
