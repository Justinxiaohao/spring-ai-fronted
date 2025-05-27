<template>
  <div class="login-container">
    <!-- 背景动效 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div v-for="i in 20" :key="i" class="shape" :style="getShapeStyle(i)"></div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧展示区 -->
      <div class="left-panel">
        <div class="welcome-content">
          <h1 class="welcome-title">欢迎来到心理疗愈电台</h1>
          <p class="welcome-subtitle">即可登录,开始心理疗愈新体验</p>
          <div class="feature-list">
            <div class="feature-item">
              <t-icon name="check-circle" size="20px" />
              <span>安全可靠的身份验证</span>
            </div>
            <div class="feature-item">
              <t-icon name="mail" size="20px" />
              <span>便捷的邮箱验证码登录</span>
            </div>
            <div class="feature-item">
              <t-icon name="user" size="20px" />
              <span>个性化的用户体验</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="right-panel">
        <div class="form-container">
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
                    </t-input>
                    <t-button
                      :disabled="codeCountdown > 0"
                      :loading="sendingCode"
                      size="large"
                      variant="outline"
                      @click="sendVerificationCode('code-login')"
                    >
                      {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
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
                    @blur="checkEmailExists"
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
                    </t-input>
                    <t-button
                      :disabled="codeCountdown > 0"
                      :loading="sendingCode"
                      size="large"
                      variant="outline"
                      @click="sendVerificationCode('register')"
                    >
                      {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
                    </t-button>
                  </div>
                </t-form-item>

                <t-form-item label="密码" name="password">
                  <t-input
                    v-model="registerData.password"
                    type="password"
                    placeholder="请输入密码（至少8位，包含字母和数字）"
                    size="large"
                    clearable
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'

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
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (val: string) => val === registerData.password,
      message: '两次输入的密码不一致'
    }
  ]
}

// 表单引用
const codeLoginForm = ref()
const passwordLoginForm = ref()
const registerForm = ref()

// 发送验证码
const sendVerificationCode = async (type: string) => {
  const email = type === 'code-login' ? codeLoginData.email : registerData.email
  
  if (!validateEmail(email)) {
    MessagePlugin.warning('请输入有效的邮箱地址')
    return
  }

  sendingCode.value = true
  
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
        localStorage.setItem("userEmail", email)
        MessagePlugin.success("登录成功")
        router.push('/index')
      } else {
        const registerResponse = await fetch("http://localhost:8080/user/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password: null, avatar, bio }),
        })
        
        if (!registerResponse.ok) {
          const registerErrorText = await registerResponse.text()
          throw new Error(`自动注册失败: ${registerErrorText}`)
        }
        
        localStorage.setItem("userEmail", email)
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
    if (result.success) {
      localStorage.setItem("userEmail", email)
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
  const valid = await registerForm.value?.validate()
  if (!valid) return

  const { email, code, password } = registerData
  const avatar = "/img/avatar01.png"
  const bio = "这个人很懒，还没有填写他的个人简介"

  registering.value = true

  try {
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

// 检查邮箱是否存在
const checkEmailExists = async () => {
  const email = registerData.email.trim()
  if (!email) return

  try {
    const response = await fetch("http://localhost:8080/user/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) throw new Error("网络请求失败")
    
    const result = await response.json()
    if (result.exists) {
      MessagePlugin.warning("此邮箱已注册，请使用其它邮箱或直接登录。")
    }
  } catch (error) {
    console.error("邮箱校验失败:", error)
  }
}

// 背景动画形状样式
const getShapeStyle = (index: number) => {
  const colors = ['#0052D9', '#0366D6', '#40A9FF', '#73D13D', '#52C41A']
  const sizes = [20, 30, 40, 50, 60]
  
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    backgroundColor: colors[index % colors.length],
    width: sizes[index % sizes.length] + 'px',
    height: sizes[index % sizes.length] + 'px',
    animationDelay: Math.random() * 5 + 's',
    animationDuration: (Math.random() * 10 + 10) + 's'
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.main-content {
  display: flex;
  width: 100%;
  height: 100%;
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
  background: rgba(255, 255, 255, 0.95);
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
</style>
