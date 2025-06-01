import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginRegister.vue'),
      meta: {
        title: '登录注册'
      }
    },
    {
      path: '/index',
      name: 'Index',
      component: () => import('../views/Index.vue'),
      meta: {
        title: '电台FM - 首页',
        requiresAuth: true
      }
    },
    {
      path: '/program/:id',
      name: 'ProgramDetail',
      component: () => import('../views/ProgramDetail.vue'),
      meta: {
        title: '节目详情',
        requiresAuth: true
      }
    },
    {
      path: '/programs',
      name: 'ProgramList',
      component: () => import('../views/ProgramList.vue'),
      meta: {
        title: '节目列表',
        requiresAuth: true
      }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/SearchPage.vue'),
      meta: {
        title: '搜索',
        requiresAuth: true
      }
    },
    {
      path: '/user/profile',
      name: 'UserProfile',
      component: () => import('../views/UserProfile.vue'),
      meta: {
        title: '个人中心',
        requiresAuth: true
      }
    },
    {
      path: '/user/liked',
      name: 'UserLikedPrograms',
      component: () => import('../views/UserLikedPrograms.vue'),
      meta: {
        title: '我的喜欢',
        requiresAuth: true
      }
    },
    {
      path: '/playlists',
      name: 'PlaylistsPage',
      component: () => import('../views/PlaylistsPage.vue'),
      meta: {
        title: '我的歌单',
        requiresAuth: true
      }
    },
    {
      path: '/playlists/public',
      name: 'PublicPlaylistsPage',
      component: () => import('../views/PublicPlaylistsPage.vue'),
      meta: {
        title: '公开歌单',
        requiresAuth: true
      }
    },
    {
      path: '/playlist/:id',
      name: 'PlaylistDetail',
      component: () => import('../views/PlaylistDetail.vue'),
      meta: {
        title: '歌单详情',
        requiresAuth: true
      }
    },
    {
      path: '/user/comments',
      name: 'UserComments',
      component: () => import('../views/UserComments.vue'),
      meta: {
        title: '我的评论',
        requiresAuth: true
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userEmail = localStorage.getItem('userEmail')
    if (!userEmail) {
      next('/login')
      return
    }
  }

  next()
})

export default router