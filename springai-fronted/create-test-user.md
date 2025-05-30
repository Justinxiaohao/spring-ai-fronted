# 测试用户创建指南

## 问题说明
前端现在使用 `User-Email` 请求头进行身份验证，但后端可能还没有对应的测试用户数据。

## 解决方案

### 方案1：使用调试页面测试
1. 访问 http://localhost:5174/debug
2. 在"用户身份设置"区域输入一个测试邮箱，例如：`test@example.com`
3. 点击"设置测试用户"
4. 点击"测试获取用户信息 (/api/me)"查看结果

### 方案2：后端创建测试用户
如果后端支持，可以通过以下方式创建测试用户：

```sql
-- 示例SQL（根据实际数据库结构调整）
INSERT INTO users (email, username, avatar, bio, created_at, liked_programs_count, playlists_count, comments_count)
VALUES ('test@example.com', 'TestUser', '', '这是一个测试用户', NOW(), 0, 0, 0);
```

### 方案3：注册功能
如果有用户注册功能，可以通过注册页面创建新用户。

## 测试步骤
1. 设置测试用户邮箱
2. 测试用户信息API
3. 测试个人中心页面
4. 测试节目详情页面
5. 测试歌单功能

## 常见测试邮箱
- test@example.com
- user@test.com
- demo@radio.fm
- admin@localhost
