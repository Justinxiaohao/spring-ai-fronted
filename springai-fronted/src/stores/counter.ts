import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Program, Category, PlayerState, UserInfo, Playlist, Comment } from '@/types'
import { programApi, categoryApi, userApi, playlistApi, commentApi } from '@/services/api'

// 节目状态管理
export const useProgramStore = defineStore('program', () => {
  const programs = ref<Program[]>([])
  const featuredPrograms = ref<Program[]>([])
  const hotPrograms = ref<Program[]>([])
  const currentProgram = ref<Program | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 分页信息
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  })

  // 获取节目列表
  const fetchPrograms = async (params: any = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await programApi.getPrograms(params)
      if (response.success) {
        programs.value = response.data.records
        pagination.value = {
          current: response.data.current,
          size: response.data.size,
          total: response.data.total,
          pages: response.data.pages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        }
      }
    } catch (err) {
      error.value = '获取节目列表失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 获取精选节目
  const fetchFeaturedPrograms = async (limit = 5) => {
    try {
      const response = await programApi.getFeaturedPrograms(1, limit)
      if (response.success) {
        featuredPrograms.value = response.data.records
      }
    } catch (err) {
      console.error('获取精选节目失败:', err)
    }
  }

  // 获取热门节目
  const fetchHotPrograms = async (limit = 10) => {
    try {
      const response = await programApi.getHotPrograms(1, limit)
      if (response.success) {
        hotPrograms.value = response.data.records
      }
    } catch (err) {
      console.error('获取热门节目失败:', err)
    }
  }

  // 获取节目详情
  const fetchProgramDetail = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await programApi.getProgramDetail(id)
      if (response.success) {
        currentProgram.value = response.data
        return response.data
      } else {
        error.value = response.message || '获取节目详情失败'
        throw new Error(response.message || '获取节目详情失败')
      }
    } catch (err: any) {
      error.value = err.message || '获取节目详情失败'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    programs,
    featuredPrograms,
    hotPrograms,
    currentProgram,
    loading,
    error,
    pagination,
    fetchPrograms,
    fetchFeaturedPrograms,
    fetchHotPrograms,
    fetchProgramDetail
  }
})

// 分类状态管理
export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const loading = ref(false)

  // 获取所有分类
  const fetchCategories = async () => {
    loading.value = true

    try {
      const response = await categoryApi.getCategories()
      if (response.success) {
        categories.value = response.data
      }
    } catch (err) {
      console.error('获取分类列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    currentCategory,
    loading,
    fetchCategories
  }
})

// 播放器状态管理
export const usePlayerStore = defineStore('player', () => {
  const playerState = ref<PlayerState>({
    currentProgram: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false
  })

  // 播放节目
  const playProgram = async (program: Program) => {
    playerState.value.currentProgram = program
    playerState.value.isLoading = true

    try {
      // 调用播放统计 API
      await programApi.playProgram(program.id)
      playerState.value.isPlaying = true
    } catch (err) {
      console.error('播放失败:', err)
    } finally {
      playerState.value.isLoading = false
    }
  }

  // 暂停播放
  const pauseProgram = () => {
    playerState.value.isPlaying = false
  }

  // 继续播放
  const resumeProgram = () => {
    playerState.value.isPlaying = true
  }

  // 停止播放
  const stopProgram = () => {
    playerState.value.isPlaying = false
    playerState.value.currentTime = 0
  }

  // 设置播放时间
  const setCurrentTime = (time: number) => {
    playerState.value.currentTime = time
  }

  // 设置总时长
  const setDuration = (duration: number) => {
    playerState.value.duration = duration
  }

  // 设置音量
  const setVolume = (volume: number) => {
    playerState.value.volume = Math.max(0, Math.min(1, volume))
  }

  return {
    playerState: computed(() => playerState.value),
    playProgram,
    pauseProgram,
    resumeProgram,
    stopProgram,
    setCurrentTime,
    setDuration,
    setVolume
  }
})

// 用户状态管理
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // 获取用户信息
  const fetchUserInfo = async () => {
    loading.value = true

    try {
      const response = await userApi.getUserInfo()
      if (response.success) {
        userInfo.value = response.data
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateUserInfo = async (data: Partial<UserInfo>) => {
    try {
      const response = await userApi.updateUserInfo(data)
      if (response.success) {
        userInfo.value = response.data
        return response.data
      }
    } catch (err) {
      console.error('更新用户信息失败:', err)
      throw err
    }
  }

  return {
    userInfo: computed(() => userInfo.value),
    loading: computed(() => loading.value),
    fetchUserInfo,
    updateUserInfo
  }
})

// 歌单状态管理
export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref<Playlist[]>([])
  const currentPlaylist = ref<Playlist | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取用户歌单列表
  const fetchUserPlaylists = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await playlistApi.getUserPlaylists()
      if (response.success) {
        playlists.value = response.data
      } else {
        error.value = response.message || '获取歌单列表失败'
      }
    } catch (err) {
      error.value = '获取歌单列表失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 获取歌单详情
  const fetchPlaylistDetail = async (playlistId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await playlistApi.getPlaylistDetail(playlistId)
      if (response.success) {
        currentPlaylist.value = response.data
        return response.data
      } else {
        error.value = response.message || '获取歌单详情失败'
      }
    } catch (err) {
      error.value = '获取歌单详情失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 创建歌单
  const createPlaylist = async (data: { name: string; description?: string; isPublic?: boolean }) => {
    try {
      const response = await playlistApi.createPlaylist(data)
      if (response.success) {
        playlists.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || '创建歌单失败')
      }
    } catch (err) {
      console.error('创建歌单失败:', err)
      throw err
    }
  }

  // 更新歌单
  const updatePlaylist = async (playlistId: number, data: { name?: string; description?: string; isPublic?: boolean }) => {
    try {
      const response = await playlistApi.updatePlaylist(playlistId, data)
      if (response.success) {
        // 更新本地数据
        const index = playlists.value.findIndex(p => p.id === playlistId)
        if (index !== -1) {
          playlists.value[index] = response.data
        }
        if (currentPlaylist.value?.id === playlistId) {
          currentPlaylist.value = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || '更新歌单失败')
      }
    } catch (err) {
      console.error('更新歌单失败:', err)
      throw err
    }
  }

  // 删除歌单
  const deletePlaylist = async (playlistId: number) => {
    try {
      const response = await playlistApi.deletePlaylist(playlistId)
      if (response.success) {
        // 从本地数据中移除
        playlists.value = playlists.value.filter(p => p.id !== playlistId)
        if (currentPlaylist.value?.id === playlistId) {
          currentPlaylist.value = null
        }
        return true
      } else {
        throw new Error(response.message || '删除歌单失败')
      }
    } catch (err) {
      console.error('删除歌单失败:', err)
      throw err
    }
  }

  // 添加节目到歌单
  const addProgramToPlaylist = async (playlistId: number, programId: number) => {
    try {
      const response = await playlistApi.addProgramToPlaylist(playlistId, { programId })
      if (response.success) {
        // 更新歌单项数量
        const playlist = playlists.value.find(p => p.id === playlistId)
        if (playlist) {
          playlist.itemCount += 1
        }
        if (currentPlaylist.value?.id === playlistId) {
          currentPlaylist.value.itemCount += 1
          if (currentPlaylist.value.items) {
            currentPlaylist.value.items.push(response.data)
          }
        }
        return response.data
      } else {
        throw new Error(response.message || '添加节目失败')
      }
    } catch (err) {
      console.error('添加节目到歌单失败:', err)
      throw err
    }
  }

  // 移除歌单内节目
  const removePlaylistItem = async (playlistId: number, itemId: number) => {
    try {
      const response = await playlistApi.removePlaylistItem(playlistId, itemId)
      if (response.success) {
        // 更新歌单项数量
        const playlist = playlists.value.find(p => p.id === playlistId)
        if (playlist) {
          playlist.itemCount = Math.max(0, playlist.itemCount - 1)
        }
        if (currentPlaylist.value?.id === playlistId) {
          currentPlaylist.value.itemCount = Math.max(0, currentPlaylist.value.itemCount - 1)
          if (currentPlaylist.value.items) {
            currentPlaylist.value.items = currentPlaylist.value.items.filter(item => item.id !== itemId)
          }
        }
        return true
      } else {
        throw new Error(response.message || '移除节目失败')
      }
    } catch (err) {
      console.error('移除歌单内节目失败:', err)
      throw err
    }
  }

  // 调整歌单顺序
  const updatePlaylistOrder = async (playlistId: number, itemIds: number[]) => {
    try {
      const response = await playlistApi.updatePlaylistOrder(playlistId, { itemIds })
      if (response.success) {
        // 重新获取歌单详情以更新顺序
        await fetchPlaylistDetail(playlistId)
        return true
      } else {
        throw new Error(response.message || '调整顺序失败')
      }
    } catch (err) {
      console.error('调整歌单顺序失败:', err)
      throw err
    }
  }

  return {
    playlists: computed(() => playlists.value),
    currentPlaylist: computed(() => currentPlaylist.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchUserPlaylists,
    fetchPlaylistDetail,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addProgramToPlaylist,
    removePlaylistItem,
    updatePlaylistOrder
  }
})

// 评论状态管理
export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const currentProgramComments = ref<Comment[]>([])
  const userComments = ref<Comment[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0,
    totalPages: 0
  })

  // 获取节目评论列表
  const fetchProgramComments = async (programId: number, page = 1, limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await commentApi.getProgramComments(programId, { page, limit })
      if (response.success) {
        currentProgramComments.value = response.data.items
        pagination.value = {
          current: response.data.page,
          size: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        }

        // 为每个顶级评论加载回复
        await loadRepliesForComments(response.data.items)
      } else {
        error.value = response.message || '获取评论失败'
      }
    } catch (err) {
      error.value = '获取评论失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 为评论加载回复
  const loadRepliesForComments = async (commentList: Comment[]) => {
    const topLevelComments = commentList.filter(comment => !comment.parentCommentId)

    for (const comment of topLevelComments) {
      if (comment.replyCount && comment.replyCount > 0) {
        try {
          const response = await commentApi.getCommentReplies(comment.id)
          if (response.success) {
            comment.replies = response.data
          }
        } catch (err) {
          console.error('加载回复失败:', err)
        }
      }
    }
  }

  // 发表评论
  const createComment = async (programId: number, content: string, parentCommentId?: number) => {
    submitting.value = true

    try {
      const response = await commentApi.createComment(programId, {
        content,
        parentCommentId: parentCommentId || null
      })

      if (response.success) {
        const newComment = response.data

        if (parentCommentId) {
          // 如果是回复，添加到对应评论的回复列表
          const parentComment = findCommentById(currentProgramComments.value, parentCommentId)
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = []
            }
            parentComment.replies.push(newComment)
            parentComment.replyCount = (parentComment.replyCount || 0) + 1
          }
        } else {
          // 如果是顶级评论，添加到评论列表开头
          currentProgramComments.value.unshift(newComment)
          pagination.value.total += 1
        }

        return newComment
      } else {
        throw new Error(response.message || '发表评论失败')
      }
    } catch (err) {
      console.error('发表评论失败:', err)
      throw err
    } finally {
      submitting.value = false
    }
  }

  // 删除评论
  const deleteComment = async (commentId: number) => {
    try {
      const response = await commentApi.deleteComment(commentId)
      if (response.success) {
        // 从本地数据中移除评论
        removeCommentFromList(currentProgramComments.value, commentId)
        pagination.value.total = Math.max(0, pagination.value.total - 1)
        return true
      } else {
        throw new Error(response.message || '删除评论失败')
      }
    } catch (err) {
      console.error('删除评论失败:', err)
      throw err
    }
  }

  // 获取用户评论列表
  const fetchUserComments = async (userId: number, page = 1, limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const response = await commentApi.getUserComments(userId, { page, limit })
      if (response.success) {
        userComments.value = response.data.items
        pagination.value = {
          current: response.data.page,
          size: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        }
      } else {
        error.value = response.message || '获取用户评论失败'
      }
    } catch (err) {
      error.value = '获取用户评论失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 辅助函数：根据ID查找评论
  const findCommentById = (commentList: Comment[], commentId: number): Comment | null => {
    for (const comment of commentList) {
      if (comment.id === commentId) {
        return comment
      }
      if (comment.replies) {
        const found = findCommentById(comment.replies, commentId)
        if (found) return found
      }
    }
    return null
  }

  // 辅助函数：从列表中移除评论
  const removeCommentFromList = (commentList: Comment[], commentId: number): boolean => {
    for (let i = 0; i < commentList.length; i++) {
      if (commentList[i].id === commentId) {
        commentList.splice(i, 1)
        return true
      }
      if (commentList[i].replies) {
        if (removeCommentFromList(commentList[i].replies!, commentId)) {
          commentList[i].replyCount = Math.max(0, (commentList[i].replyCount || 0) - 1)
          return true
        }
      }
    }
    return false
  }

  // 清空当前节目评论
  const clearCurrentProgramComments = () => {
    currentProgramComments.value = []
    pagination.value = {
      current: 1,
      size: 10,
      total: 0,
      totalPages: 0
    }
  }

  return {
    comments: computed(() => comments.value),
    currentProgramComments: computed(() => currentProgramComments.value),
    userComments: computed(() => userComments.value),
    loading: computed(() => loading.value),
    submitting: computed(() => submitting.value),
    error: computed(() => error.value),
    pagination: computed(() => pagination.value),
    fetchProgramComments,
    createComment,
    deleteComment,
    fetchUserComments,
    clearCurrentProgramComments
  }
})
