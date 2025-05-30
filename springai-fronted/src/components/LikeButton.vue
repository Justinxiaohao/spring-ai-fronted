<template>
  <t-button
    :theme="isLiked ? 'danger' : 'default'"
    :variant="isLiked ? 'base' : 'outline'"
    :loading="loading"
    @click="handleToggleLike"
    :size="size"
    class="like-button"
    :class="{ 'liked': isLiked }"
  >
    <template #icon>
      <t-icon 
        :name="isLiked ? 'heart-filled' : 'heart'" 
        :class="{ 'animate__animated animate__heartBeat': justLiked }"
      />
    </template>
    <span v-if="showCount">{{ formattedCount }}</span>
    <span v-else-if="showText">{{ isLiked ? '已喜欢' : '喜欢' }}</span>
  </t-button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { programApi, utils } from '@/services/api'

interface Props {
  programId: number
  initialLikeCount?: number
  showCount?: boolean
  showText?: boolean
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  (e: 'like-changed', isLiked: boolean, newCount: number): void
}

const props = withDefaults(defineProps<Props>(), {
  initialLikeCount: 0,
  showCount: true,
  showText: false,
  size: 'medium'
})

const emit = defineEmits<Emits>()

const isLiked = ref(false)
const likeCount = ref(props.initialLikeCount)
const loading = ref(false)
const justLiked = ref(false)

// 计算属性
const formattedCount = computed(() => {
  return utils.formatPlayCount(likeCount.value)
})

// 监听初始点赞数变化
watch(() => props.initialLikeCount, (newCount) => {
  likeCount.value = newCount
})

// 初始化
onMounted(async () => {
  await checkLikeStatus()
})

// 检查喜欢状态
const checkLikeStatus = async () => {
  try {
    const response = await programApi.getLikeStatus(props.programId)
    if (response.success) {
      isLiked.value = response.data
    }
  } catch (error) {
    console.error('检查喜欢状态失败:', error)
  }
}

// 切换喜欢状态
const handleToggleLike = async () => {
  if (loading.value) return

  // 检查是否登录
  const userEmail = localStorage.getItem('userEmail')
  if (!userEmail) {
    MessagePlugin.warning('请先登录')
    return
  }

  loading.value = true
  const originalLiked = isLiked.value
  const originalCount = likeCount.value

  try {
    if (isLiked.value) {
      // 取消喜欢
      const response = await programApi.unlikeProgram(props.programId)
      if (response.success) {
        isLiked.value = false
        likeCount.value = Math.max(0, likeCount.value - 1)
        MessagePlugin.success('已取消喜欢')
      } else {
        throw new Error(response.message || '取消喜欢失败')
      }
    } else {
      // 喜欢
      const response = await programApi.likeProgram(props.programId)
      if (response.success) {
        isLiked.value = true
        likeCount.value += 1
        justLiked.value = true
        MessagePlugin.success('喜欢成功')
        
        // 播放动画后重置
        setTimeout(() => {
          justLiked.value = false
        }, 1000)
      } else {
        throw new Error(response.message || '喜欢失败')
      }
    }

    // 发出事件
    emit('like-changed', isLiked.value, likeCount.value)
  } catch (error: any) {
    // 恢复原状态
    isLiked.value = originalLiked
    likeCount.value = originalCount
    
    console.error('操作失败:', error)
    MessagePlugin.error(error.message || '操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.like-button {
  transition: all 0.3s ease;
}

.like-button.liked {
  color: #e53e3e;
  border-color: #e53e3e;
}

.like-button:hover {
  transform: translateY(-1px);
}

.like-button.liked:hover {
  background-color: #fed7d7;
}

/* 心跳动画 */
.animate__heartBeat {
  animation-duration: 1s;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}

.animate__heartBeat {
  animation-name: heartBeat;
}
</style>
