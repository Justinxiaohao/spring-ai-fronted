<template>
  <t-dropdown
    :options="dropdownOptions"
    @click="handleDropdownClick"
    placement="bottom-right"
    :disabled="loading"
  >
    <t-button
      theme="primary"
      variant="outline"
      :loading="loading"
      :size="size"
      class="add-to-playlist-btn"
    >
      <template #icon>
        <t-icon name="add" />
      </template>
      <span v-if="showText">添加到歌单</span>
    </t-button>
  </t-dropdown>

  <!-- 创建歌单对话框 -->
  <t-dialog
    v-model:visible="showCreateDialog"
    title="创建新歌单"
    width="500px"
    :confirm-btn="{ content: '创建', loading: creating }"
    @confirm="createNewPlaylist"
  >
    <t-form
      ref="formRef"
      :model="createForm"
      :rules="formRules"
      label-width="80px"
    >
      <t-form-item label="歌单名称" name="name">
        <t-input 
          v-model="createForm.name" 
          placeholder="请输入歌单名称"
          :maxlength="100"
        />
      </t-form-item>
      
      <t-form-item label="歌单描述" name="description">
        <t-textarea 
          v-model="createForm.description" 
          placeholder="请输入歌单描述（可选）"
          :maxlength="500"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </t-form-item>
      
      <t-form-item label="公开设置" name="isPublic">
        <t-radio-group v-model="createForm.isPublic">
          <t-radio :value="true">公开歌单</t-radio>
          <t-radio :value="false">私人歌单</t-radio>
        </t-radio-group>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { usePlaylistStore } from '@/stores/counter'
import type { Playlist } from '@/types'

interface Props {
  programId: number
  showText?: boolean
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  (e: 'added', playlist: Playlist): void
}

const props = withDefaults(defineProps<Props>(), {
  showText: true,
  size: 'medium'
})

const emit = defineEmits<Emits>()

const playlistStore = usePlaylistStore()
const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const formRef = ref()

// 创建歌单表单
const createForm = reactive({
  name: '',
  description: '',
  isPublic: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入歌单名称', type: 'error' },
    { max: 100, message: '歌单名称不能超过100个字符', type: 'error' }
  ],
  description: [
    { max: 500, message: '歌单描述不能超过500个字符', type: 'error' }
  ]
}

// 计算属性
const dropdownOptions = computed(() => {
  const options = []
  
  // 添加现有歌单选项
  if (playlistStore.playlists.length > 0) {
    options.push({
      content: '选择歌单',
      value: 'divider',
      disabled: true
    })
    
    playlistStore.playlists.forEach(playlist => {
      options.push({
        content: `${playlist.name} (${playlist.itemCount}首)`,
        value: `playlist_${playlist.id}`,
        icon: playlist.isPublic ? 'public' : 'lock'
      })
    })
    
    options.push({ content: '---', value: 'divider2', disabled: true })
  }
  
  // 添加创建新歌单选项
  options.push({
    content: '创建新歌单',
    value: 'create_new',
    icon: 'add'
  })
  
  return options
})

// 初始化
onMounted(async () => {
  await loadPlaylists()
})

// 加载歌单列表
const loadPlaylists = async () => {
  try {
    await playlistStore.fetchUserPlaylists()
  } catch (error) {
    console.error('加载歌单列表失败:', error)
  }
}

// 处理下拉菜单点击
const handleDropdownClick = async (data: any) => {
  if (data.value === 'create_new') {
    showCreateDialog.value = true
    return
  }
  
  if (data.value.startsWith('playlist_')) {
    const playlistId = parseInt(data.value.replace('playlist_', ''))
    await addToPlaylist(playlistId)
  }
}

// 添加到歌单
const addToPlaylist = async (playlistId: number) => {
  // 检查是否登录
  const userEmail = localStorage.getItem('userEmail')
  if (!userEmail) {
    MessagePlugin.warning('请先登录')
    return
  }

  loading.value = true
  
  try {
    await playlistStore.addProgramToPlaylist(playlistId, props.programId)
    
    const playlist = playlistStore.playlists.find(p => p.id === playlistId)
    if (playlist) {
      MessagePlugin.success(`已添加到歌单"${playlist.name}"`)
      emit('added', playlist)
    }
  } catch (error: any) {
    console.error('添加到歌单失败:', error)
    MessagePlugin.error(error.message || '添加失败，请重试')
  } finally {
    loading.value = false
  }
}

// 创建新歌单
const createNewPlaylist = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return false

  creating.value = true
  
  try {
    const newPlaylist = await playlistStore.createPlaylist({
      name: createForm.name,
      description: createForm.description || undefined,
      isPublic: createForm.isPublic
    })
    
    // 创建成功后直接添加节目到新歌单
    await playlistStore.addProgramToPlaylist(newPlaylist.id, props.programId)
    
    MessagePlugin.success(`已创建歌单"${newPlaylist.name}"并添加节目`)
    emit('added', newPlaylist)
    
    // 重置表单
    createForm.name = ''
    createForm.description = ''
    createForm.isPublic = true
    showCreateDialog.value = false
  } catch (error: any) {
    console.error('创建歌单失败:', error)
    MessagePlugin.error(error.message || '创建失败，请重试')
  } finally {
    creating.value = false
  }
  
  return true
}
</script>

<style scoped>
.add-to-playlist-btn {
  transition: all 0.3s ease;
}

.add-to-playlist-btn:hover {
  transform: translateY(-1px);
}

.add-to-playlist-btn:disabled {
  transform: none;
}
</style>
