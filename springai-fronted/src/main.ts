import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入 TDesign 组件库
import TDesign from 'tdesign-vue-next'
// 引入 TDesign 样式
import 'tdesign-vue-next/es/style/index.css'

// 引入动画库
import 'animate.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)

app.mount('#app')