/*
  * @Description: 登录🎨 背景动画实现详解
  1. 整体架构
  动画系统采用了三层结构：
  
  外层容器 (.login-container): 提供渐变背景和定位参考
  动画容器 (.background-animation): 承载所有动画元素，使用绝对定位
  形状容器 (.floating-shapes): 直接包含动画小球
  2. 动画元素生成
  3. 动态样式系统
  getShapeStyle() 函数为每个小球生成独特属性：
  
  随机位置: Math.random() * 100 + '%' 确保分布均匀
  循环配色: 8种颜色通过模运算循环分配
  多样尺寸: 5种大小创造层次感
  错开时间: 随机延迟(0-10s)和持续时间(20-30s)避免同步
  4. 关键帧动画
  @keyframes float 定义了完整的运动轨迹：
  
  0%: 从屏幕底部外侧开始，小尺寸、低透明度
  50%: 运动到屏幕中央，最大尺寸、高透明度
  100%: 到达屏幕顶部外侧，回到小尺寸、低透明度
  5. 视觉效果增强
  透明度变化: 0.4 → 0.9 → 0.4，营造淡入淡出效果
  旋转动画: 0° → 360°，增加动感
  缩放效果: 0.5 → 1 → 0.5，创造远近层次
  发光效果: box-shadow 添加白色光晕
  毛玻璃背景: backdrop-filter: blur(10px) 增强层次感
  6. 性能优化
  pointer-events: none: 禁用鼠标事件，避免干扰用户操作
  transform属性: 使用硬件加速，性能更佳
  overflow: hidden: 隐藏边界外的元素，避免滚动条
*/
<template>
    <div class="login-container">      
        <!-- 背景动效容器 - 用于承载所有的浮动动画元素 -->
      <div class="background-animation">
        <!-- 浮动形状容器 - 专门用来放置动画小球 -->
        <div class="floating-shapes">
          <!-- 使用 v-for 循环生成35个动画小球，每个小球都有唯一的样式 -->
          <!-- :key="i" 为每个元素提供唯一标识，确保Vue正确追踪元素 -->
          <!-- :style="getShapeStyle(i)" 为每个小球动态分配位置、颜色、大小等样式 -->
          <div v-for="i in 35" :key="i" class="shape" :style="getShapeStyle(i)"></div>
        </div>
      </div>
  
      <!-- 主内容区域 -->
      <div class="main-content">
        <!-- 左侧展示区 -->
        <div class="left-panel">
          <div class="welcome-content">
            <h1 class="welcome-title">欢迎来到心理疗愈电台</h1>
            <p class="welcome-subtitle">这里，每一刻倾诉都被温柔接纳，每一次成长都被静静见证</p>
            <div class="feature-list">
              <div class="feature-item">
                <t-icon name="check-circle" size="20px" />
                <span>我们以严谨的隐私守护为您筑起安全空间</span>
              </div>
              <div class="feature-item">
                <t-icon name="mail" size="20px" />
                <span>只需邮箱验证码，即可推开疗愈之门——无需重负轻装前来</span>
              </div>
              <div class="feature-item">
                <t-icon name="user" size="20px" />
                <span>我们将随您的情绪四季，为您定制温暖的陪伴。</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 右侧表单区 -->
        <div class="right-panel">
          <div class="form-container">
            <h2 class="form-title">现在深呼吸，即刻登录让心灵慢慢着陆</h2>
            <!-- 标签页切换 -->
            <t-tabs 
              v-model="activeTab" 
              placement="top"
              size="large"
              class="custom-tabs"
            >
              <!-- 验证码登录 -->
              <t-tab-panel value="code-login" label="验证码登录">
                <t-form
                  ref="codeLoginForm"
                  :data="codeLoginData"
                  :rules="codeLoginRules"
                  layout="vertical"
                  class="login-form"
                >
                  <t-form-item label="邮箱地址" name="email">
                    <t-input
                      v-model="codeLoginData.email"
                      placeholder="请输入您的邮箱地址"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="mail" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-form-item label="验证码" name="code">
                    <div class="code-input-group">
                      <t-input
                        v-model="codeLoginData.code"
                        placeholder="请输入验证码"
                        size="large"
                        style="flex: 1; margin-right: 12px"
                      >
                        <template #prefix-icon>
                          <t-icon name="secured" />
                        </template>
                      </t-input>                      <t-button
                        :disabled="codeCountdown > 0 || sendingCode"
                        :loading="sendingCode"
                        size="large"
                        variant="outline"
                        @click="sendVerificationCode('code-login')"
                      >
                        {{ 
                          sendingCode ? '发送中...' : 
                          codeCountdown > 0 ? `${codeCountdown}s` : 
                          '获取验证码' 
                        }}
                      </t-button>
                    </div>
                  </t-form-item>
  
                  <t-button
                    size="large"
                    theme="primary"
                    block
                    :loading="loggingIn"
                    @click="loginWithCode"
                    class="submit-btn"
                  >
                    登录
                  </t-button>
                </t-form>
              </t-tab-panel>
  
              <!-- 密码登录 -->
              <t-tab-panel value="password-login" label="密码登录">
                <t-form
                  ref="passwordLoginForm"
                  :data="passwordLoginData"
                  :rules="passwordLoginRules"
                  layout="vertical"
                  class="login-form"
                >
                  <t-form-item label="邮箱地址" name="email">
                    <t-input
                      v-model="passwordLoginData.email"
                      placeholder="请输入您的邮箱地址"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="mail" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-form-item label="密码" name="password">
                    <t-input
                      v-model="passwordLoginData.password"
                      type="password"
                      placeholder="请输入您的密码"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-button
                    size="large"
                    theme="primary"
                    block
                    :loading="loggingIn"
                    @click="login"
                    class="submit-btn"
                  >
                    登录
                  </t-button>
                </t-form>
              </t-tab-panel>
  
              <!-- 注册 -->
              <t-tab-panel value="register" label="注册">
                <t-form
                  ref="registerForm"
                  :data="registerData"
                  :rules="registerRules"
                  layout="vertical"
                  class="login-form"
                >
                  <t-form-item label="邮箱地址" name="email">
                    <t-input
                      v-model="registerData.email"
                      placeholder="请输入您的邮箱地址"
                      size="large"
                      clearable
                    >
                      <template #prefix-icon>
                        <t-icon name="mail" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-form-item label="验证码" name="code">
                    <div class="code-input-group">
                      <t-input
                        v-model="registerData.code"
                        placeholder="请输入验证码"
                        size="large"
                        style="flex: 1; margin-right: 12px"
                      >
                        <template #prefix-icon>
                          <t-icon name="secured" />
                        </template>
                      </t-input>                      <t-button
                        :disabled="codeCountdown > 0 || sendingCode"
                        :loading="sendingCode"
                        size="large"
                        variant="outline"
                        @click="sendVerificationCode('register')"
                      >
                        {{ 
                          sendingCode ? '发送中...' : 
                          codeCountdown > 0 ? `${codeCountdown}s` : 
                          '获取验证码' 
                        }}
                      </t-button>
                    </div>
                  </t-form-item>                  <t-form-item label="密码" name="password">
                    <t-input
                      v-model="registerData.password"
                      type="password"
                      placeholder="请输入密码（至少8位，包含字母和数字）"
                      size="large"
                      clearable
                      @blur="validatePasswordField"
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-form-item label="确认密码" name="confirmPassword">
                    <t-input
                      v-model="registerData.confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      size="large"
                      clearable
                      @blur="validateConfirmPasswordField"
                    >
                    >
                      <template #prefix-icon>
                        <t-icon name="lock-on" />
                      </template>
                    </t-input>
                  </t-form-item>
  
                  <t-button
                    size="large"
                    theme="primary"
                    block
                    :loading="registering"
                    @click="register"
                    class="submit-btn"
                  >
                    注册
                  </t-button>
                </t-form>
              </t-tab-panel>            
            </t-tabs>
            <div v-if="activeTab === 'code-login'" class="auto-register-tip">
              如果您没有账号，发送验证码我们将会为您自动注册
            </div>
         </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { Message, MessagePlugin } from 'tdesign-vue-next'
  
  const router = useRouter()
    // 响应式数据
  const activeTab = ref('code-login')
  const sendingCode = ref(false)
  const loggingIn = ref(false)
  const registering = ref(false)
  const codeCountdown = ref(0)
  
  // 表单数据
  const codeLoginData = reactive({
    email: '',
    code: ''
  })
  
  const passwordLoginData = reactive({
    email: '',
    password: ''
  })
  
  const registerData = reactive({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  })
  
  // 表单验证规则
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  }
  
  const validateCode = (code: string): boolean => {
    return /^\d{6}$/.test(code)
  }
  
  const codeLoginRules = {
    email: [
      { required: true, message: '请输入邮箱地址' },
      { 
        validator: (val: string) => validateEmail(val),
        message: '请输入有效的邮箱地址'
      }
    ],
    code: [
      { required: true, message: '请输入验证码' },
      {
        validator: (val: string) => validateCode(val),
        message: '验证码格式不正确'
      }
    ]
  }
  
  const passwordLoginRules = {
    email: [
      { required: true, message: '请输入邮箱地址' },
      { 
        validator: (val: string) => validateEmail(val),
        message: '请输入有效的邮箱地址'
      }
    ],
    password: [
      { required: true, message: '请输入密码' },
      {
        validator: (val: string) => validatePassword(val),
        message: '密码至少8位且包含字母和数字'
      }
    ]
  }
  
  const registerRules = {
    email: [
      { required: true, message: '请输入邮箱地址' },
      { 
        validator: (val: string) => validateEmail(val),
        message: '请输入有效的邮箱地址'
      }
    ],
    code: [
      { required: true, message: '请输入验证码' },
      {
        validator: (val: string) => validateCode(val),
        message: '验证码格式不正确'
      }
    ],
    password: [
      { required: true, message: '请输入密码' },
      {
        validator: (val: string) => validatePassword(val),
        message: '密码至少8位且包含字母和数字'
      }
    ],    confirmPassword: [
      { required: true, message: '请确认密码' },
      {
        validator: (val: string) => {
          if (!val) return false
          return val === registerData.password
        },
        message: '两次输入的密码不一致'
      }
    ]
  }
  
  // 表单引用
  const codeLoginForm = ref()
  const passwordLoginForm = ref()
  const registerForm = ref()
  
  // 密码字段验证函数
  const validatePasswordField = () => {
    registerForm.value?.validateField(['password'])
  }
  
  // 确认密码字段验证函数
  const validateConfirmPasswordField = () => {
    registerForm.value?.validateField(['confirmPassword'])
  }
  
  // 发送验证码
  const sendVerificationCode = async (type: string) => {

    const email = type === 'code-login' ? codeLoginData.email : registerData.email
    
    if (!validateEmail(email)) {
      MessagePlugin.warning('请输入有效的邮箱地址')
      return
    }
    sendingCode.value = true
    
    // 如果邮箱已注册，禁止发送验证码
    if (type === 'register') {
      
      try {
        const response = await fetch("http://localhost:8080/user/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.exists) {

            MessagePlugin.error("此邮箱已注册，无法再次注册。请使用其他邮箱或前往登录。")
            sendingCode.value = false
            return
          }
        }
      } catch (error) {
        console.error("邮箱检查失败:", error)
        MessagePlugin.error("邮箱检查失败，请稍后再试")
        sendingCode.value = false
        return
      }
    }
    
    try {
      console.log("发送验证码请求:", email)
      const response = await fetch("http://localhost:8080/code/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      console.log("响应状态:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("发送验证码失败:", errorText)
        throw new Error("发送验证码失败: " + errorText)
      }      
      MessagePlugin.success("验证码已发送，请检查您的邮箱")
      startCountdown()
    } catch (error) {
      console.error("发送验证码失败:", error)
      MessagePlugin.error("发送验证码失败，请稍后再试")
    } finally {
      sendingCode.value = false
    }
  }
    // 倒计时
  const startCountdown = () => {
    codeCountdown.value = 60
    const interval = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value === 0) {
        clearInterval(interval)
      }
    }, 1000)
  }

  // 验证码登录
  const loginWithCode = async () => {
    const valid = await codeLoginForm.value?.validate()
    if (!valid) return
  
    const { email, code } = codeLoginData
    const avatar = "/img/avatar01.png"
    const bio = "这个人很懒，还没有填写他的个人简介"
  
    loggingIn.value = true
  
    try {
      const response = await fetch("http://localhost:8080/code/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`验证码验证失败: ${errorText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        const userResponse = await fetch("http://localhost:8080/user/check-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
        
        if (!userResponse.ok) {
          const userErrorText = await userResponse.text()
          throw new Error(`用户检查失败: ${userErrorText}`)
        }
        const userResult = await userResponse.json()
        if (userResult.exists) {
          MessagePlugin.success("登录成功")
          localStorage.setItem("userEmail", email)
          // 设置标记显示AI助手介绍
          localStorage.setItem("showAIWelcome", "true")
          router.push('/index')
        } else {
          const registerResponse = await fetch("http://localhost:8080/user/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password: " ", avatar, bio}),
          })
          
          if (!registerResponse.ok) {
            const registerErrorText = await registerResponse.text()
            throw new Error(`自动注册失败: ${registerErrorText}`)
          }
          // 没有注册过系统会自动注册
          localStorage.setItem("userEmail", email)
          // 设置标记显示AI助手介绍
          localStorage.setItem("showAIWelcome", "true")
          MessagePlugin.success("自动注册成功，正在登录中...")
          router.push('/index')
        }
      } else {
        throw new Error(`验证码验证失败: ${result.message}`)
      }
    } catch (error: any) {
      console.error("验证码验证失败:", error)
      MessagePlugin.error(`验证码验证失败，请稍后再试: ${error.message}`)
    } finally {
      loggingIn.value = false
    }
  }
  
  // 密码登录
  const login = async () => {
    const valid = await passwordLoginForm.value?.validate()
    if (!valid) return
  
    const { email, password } = passwordLoginData
  
    loggingIn.value = true
  
    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        throw new Error("登录失败")
      }
      
      const result = await response.json()
      console.log("登录结果:", result)
      if (result.success) {
        localStorage.setItem("userEmail", email)
        // 设置标记显示AI助手介绍
        localStorage.setItem("showAIWelcome", "true")
        MessagePlugin.success("登录成功")
        router.push('/index')
      } else {
        MessagePlugin.error("登录失败：" + result.message)
      }
    } catch (error) {
      console.error("登录失败:", error)
      MessagePlugin.error("登录失败，请稍后再试")
    } finally {
      loggingIn.value = false
    }
  }

  // 注册
  const register = async () => {
    try {
      const valid = await registerForm.value?.validate()
      if (!valid) {
        MessagePlugin.warning('请检查表单填写是否正确')
        return
      }
    } catch (error) {
      console.error('表单验证失败:', error)
      MessagePlugin.error('表单验证失败，请检查输入')
      return
    }
    
    const { email, code, password } = registerData
    
    // 前端额外验证密码规则
    if (!validatePassword(password)) {
      MessagePlugin.error('密码至少8位且包含字母和数字')
      return
    }
    
    // 前端验证密码确认
    if (password !== registerData.confirmPassword) {
      MessagePlugin.error('两次输入的密码不一致')
      return
    }
    
    const avatar = "/img/avatar01.png"
    const bio = "这个人很懒，还没有填写他的个人简介"

    registering.value = true

    try {
      // 最终的邮箱注册状态检查
      const checkResponse = await fetch("http://localhost:8080/user/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      if (checkResponse.ok) {
        const checkResult = await checkResponse.json()
        if (checkResult.exists) {
          MessagePlugin.warning("您已经注册过账号，请前去登录")
          registering.value = false
          return
        }
      }
      
      // 先校验验证码
      const codeRes = await fetch("http://localhost:8080/code/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      })
      if (!codeRes.ok) {
        const errorText = await codeRes.text()
        MessagePlugin.error("验证码校验失败：" + errorText)
        throw new Error("验证码校验失败: " + errorText)
      }
      const codeResult = await codeRes.json()
      if (!codeResult.success) {
        MessagePlugin.error("验证码错误或已过期")
        throw new Error("验证码错误或已过期")
      }

      // 验证码通过后再注册
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, avatar, bio }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("Duplicate entry")) {
          MessagePlugin.warning("您已经注册过账号，请前去登录")
        } else {
          MessagePlugin.error("注册失败：" + errorText)
        }
        throw new Error("注册失败: " + errorText)
      }
      
      const result = await response.json()
      if (result.success) {
        MessagePlugin.success("注册成功")
        activeTab.value = 'password-login'
        // 清空注册表单
        Object.assign(registerData, { email: '', code: '', password: '', confirmPassword: '' })
      } else {
        MessagePlugin.error("注册失败：" + result.message)
      }
    } catch (error) {
      console.error("注册失败:", error)
    } finally {
      registering.value = false
    }
  }



  // 背景动画形状样式生成函数 - 这是动画实现的核心函数
  const getShapeStyle = (index: number) => {
    // 定义8种不同的颜色，用于创造丰富的视觉效果
    // 包含蓝色系、绿色系、红色系、橙色系、紫色系，营造渐变和谐的色彩搭配
    const colors = ['#0052D9', '#0366D6', '#40A9FF', '#73D13D', '#52C41A', '#FF7875', '#FFA940', '#B37FEB']
    
    // 定义5种不同的尺寸（像素），从小到大，创造层次感
    const sizes = [15, 25, 35, 45, 55]
    
    // 返回动态样式对象，每个形状都有独特的属性
    return {
      // 水平位置：Math.random() * 100 生成0-100之间的随机数，确保形状在屏幕宽度范围内随机分布
      left: Math.random() * 100 + '%',
      
      // 垂直位置：同样随机分布在屏幕高度范围内
      top: Math.random() * 100 + '%',
      
      // 背景颜色：使用模运算(%)循环使用颜色数组，确保每个形状都有颜色
      backgroundColor: colors[index % colors.length],
      
      // 宽度：使用模运算循环使用尺寸数组
      width: sizes[index % sizes.length] + 'px',
      
      // 高度：与宽度相同，确保形状为正圆形
      height: sizes[index % sizes.length] + 'px',
      
      // 动画延迟：Math.random() * 10 生成0-10秒的随机延迟
      // 这样不同的形状会在不同时间开始动画，避免所有形状同时出现
      animationDelay: Math.random() * 10 + 's',
      
      // 动画持续时间：Math.random() * 10 + 20 生成20-30秒的随机持续时间
      // 不同的持续时间让形状以不同速度移动，增加动画的自然感
      animationDuration: (Math.random() * 10 + 20) + 's'
    }
  }
  </script>

<style scoped>  /* 登录容器 - 整个页面的根容器 */
  .login-container {
    position: relative; /* 相对定位，为内部绝对定位元素提供参考点 */
    width: 100vw; /* 视口宽度100% */
    height: 100vh; /* 视口高度100% */
    display: flex; /* 弹性布局 */
    /* 渐变背景：从左上到右下，蓝紫色渐变，营造科技感 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden; /* 隐藏溢出内容，确保动画不会显示在容器外 */
  }
  
  /* 背景动画容器 - 负责承载所有动画元素 */
  .background-animation {
    position: absolute; /* 绝对定位，脱离文档流，不影响其他元素布局 */
    top: 0; /* 定位到容器顶部 */
    left: 0; /* 定位到容器左侧 */
    width: 100%; /* 占满整个容器宽度 */
    height: 100%; /* 占满整个容器高度 */
    pointer-events: none; /* 禁用鼠标事件，确保动画不会干扰用户操作 */
    overflow: hidden; /* 隐藏溢出的动画元素 */
  }
  
  /* 浮动形状的直接容器 */
  .floating-shapes {
    position: relative; /* 相对定位，为内部的shape元素提供定位参考 */
    width: 100%; /* 占满父容器宽度 */
    height: 100%; /* 占满父容器高度 */
  }  /* 动画形状样式 - 定义每个浮动小球的基本样式 */
  .shape {
    position: absolute; /* 绝对定位，允许形状在容器内自由定位 */
    border-radius: 50%; /* 圆角50%，将方形元素变为圆形 */
    opacity: 0.7; /* 透明度0.7，让形状呈现半透明效果，不会完全遮挡背景 */
    /* 应用float动画，linear表示匀速运动，infinite表示无限循环 */
    animation: float linear infinite;
    /* 添加白色发光效果，增强视觉效果，0 0 20px表示阴影模糊半径20px */
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }

  /* 关键帧动画定义 - 控制形状从底部浮到顶部的完整运动轨迹 */
  @keyframes float {
    /* 动画起始状态 (0%) */
    0% {
      /* 
       * translateY(100vh): 垂直位移到视口高度之外(底部外侧)
       * rotate(0deg): 旋转角度为0度
       * scale(0.5): 缩放为原始大小的50%，形状较小
       */
      transform: translateY(100vh) rotate(0deg) scale(0.5);
      opacity: 0.4; /* 较低透明度，形状刚出现时比较淡 */
    }
    
    /* 动画10%时的状态 - 形状开始变得明显 */
    10% {
      opacity: 0.8; /* 透明度增加，形状变得更明显 */
    }
    
    /* 动画中点状态 (50%) - 形状运动到屏幕中央 */
    50% {
      opacity: 0.9; /* 最高透明度，形状最明显的时候 */
      /* 
       * translateY(50vh): 移动到视口高度的50%位置(屏幕中央)
       * rotate(180deg): 旋转180度，完成半圈旋转
       * scale(1): 缩放为原始大小100%，形状达到最大
       */
      transform: translateY(50vh) rotate(180deg) scale(1);
    }
    
    /* 动画90%时的状态 - 形状开始淡出 */
    90% {
      opacity: 0.8; /* 透明度开始降低 */
    }
    
    /* 动画结束状态 (100%) */
    100% {
      /* 
       * translateY(-100px): 移动到屏幕顶部外侧
       * rotate(360deg): 完成完整的360度旋转
       * scale(0.5): 缩放回50%，形状变小
       */
      transform: translateY(-100px) rotate(360deg) scale(0.5);
      opacity: 0.4; /* 透明度降低，形状淡出 */
    }
  }
    /* 主内容区域 - 放置登录表单和欢迎信息 */
  .main-content {
    display: flex; /* 弹性布局，左右分栏 */
    width: 100%; /* 占满容器宽度 */
    height: 100%; /* 占满容器高度 */
    /* 毛玻璃效果：对背景进行10px的模糊处理，增强层次感 */
    backdrop-filter: blur(10px);
  }
  
  .left-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: white;
  }
  
  .welcome-content {
    max-width: 500px;
    text-align: center;
    animation: fadeInLeft 1s ease-out;
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .welcome-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .welcome-subtitle {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }
  
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: left;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 1.1rem;
    opacity: 0.9;
  }
  
  .right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  
  .form-container {
    background: var(--td-bg-color-container);
    border-radius: 20px;
    padding: 48px 48px 40px 48px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    animation: fadeInRight 1s ease-out;
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .custom-tabs {
    --td-brand-color: #0052D9;
  }
  
  .custom-tabs :deep(.t-tabs__nav-item) {
    font-weight: 600;
    font-size: 16px;
  }
  
  .login-form {
    margin-top: 30px;
  }
  
  .code-input-group {
    display: flex;
    align-items: center;
  }
  
  .submit-btn {
    margin-top: 20px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 82, 217, 0.3);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .main-content {
      flex-direction: column;
    }
    
    .left-panel {
      flex: none;
      padding: 30px 20px;
      height: 40%;
    }
    
    .welcome-title {
      font-size: 2rem;
    }
    
    .right-panel {
      flex: none;
      height: 60%;
      padding: 20px;
    }
    
    .form-container {
      padding: 30px 20px;
      max-width: none;
    }
  }
  
  /* 表单动画效果 */
  .login-form :deep(.t-input) {
    transition: all 0.3s ease;
  }
  
  .login-form :deep(.t-input:focus-within) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 82, 217, 0.15);
  }
  
  .login-form :deep(.t-form-item) {
    margin-bottom: 24px;
  }
    .login-form :deep(.t-form__label) {
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  /* 自动注册提示信息样式 */
  .auto-register-tip {
    margin-top: 20px;
    text-align: center;
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
  }
  </style>