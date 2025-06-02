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
  </t-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { programApi } from '@/services/api'

interface Props {
  programId: number
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const emit = defineEmits<{
  (e: 'like-changed', isLiked: boolean): void
}>()

const isLiked = ref(false)
const loading = ref(false)
const justLiked = ref(false)

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

  const userEmail = localStorage.getItem('userEmail')
  if (!userEmail) {
    MessagePlugin.warning('请先登录')
    return
  }

  loading.value = true
  const originalLiked = isLiked.value

  try {
    if (isLiked.value) {
      // 取消喜欢
      const response = await programApi.unlikeProgram(props.programId)
      if (response.success) {
        isLiked.value = false
        MessagePlugin.success('已取消喜欢')
      } else {
        throw new Error(response.message || '取消喜欢失败')
      }
    } else {
      // 喜欢
      const response = await programApi.likeProgram(props.programId)
      if (response.success) {
        isLiked.value = true
        justLiked.value = true
        MessagePlugin.success('喜欢成功')
        
        setTimeout(() => {
          justLiked.value = false
        }, 1000)
      } else {
        throw new Error(response.message || '喜欢失败')
      }
    }

    emit('like-changed', isLiked.value) // 移除计数参数
  } catch (error: any) {
    isLiked.value = originalLiked
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
  border: 1px solid #0052d9; /* 边框颜色 */
  border-radius: 4px;
  padding: 6px 8px;
  background-color: #ffffff;
  color: #0052d9; /* 文字/图标颜色 */
}

.like-button.liked {
  border-color: #0052d9;
  background-color: #ffffff;
  color: #f00000; /* 喜欢状态文字/图标颜色 */
}

.like-button:hover {
  transform: translateY(-1px);
  border-color: #003da5; /* 悬停时边框颜色加深 */
  background-color: #f0f7ff; /* 悬停时背景色 */
}

.like-button.liked:hover {
  border-color: #003da5;
  background-color: #003da5; /* 喜欢状态悬停背景色 */
}

.like-button.liked .t-icon {
  color: #f00000; /* 喜欢状态图标颜色 */
}

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
</style>