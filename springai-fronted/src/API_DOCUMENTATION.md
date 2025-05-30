# 电台节目 API 文档

## 1. 主页节目展示

### 1.1 获取节目列表

**接口地址：** `GET /api/programs`

**功能描述：** 分页查询电台节目列表，支持多种排序和筛选条件

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码（从 1 开始） |
| limit | Integer | 否 | 10 | 每页大小（最大 100） |
| sortBy | String | 否 | createdAt_desc | 排序方式 |
| categoryId | Integer | 否 | - | 分类 ID 筛选 |
| tag | String | 否 | - | 标签筛选 |

**排序方式说明：**

- `createdAt_desc`: 最新（按创建时间倒序）
- `playsCount_desc`: 最热（按播放次数倒序）
- `likesCount_desc`: 最受欢迎（按点赞次数倒序）
- `isFeatured_desc_createdAt_desc`: 精选优先，然后按时间倒序
- `commentsCount_desc`: 评论最多（按评论数倒序）

**请求示例：**

```
GET /api/programs?page=1&limit=10&sortBy=playsCount_desc&categoryId=1&tag=冥想
```

**响应格式：**

```json
{
  "code": 200,
  "message": "获取节目列表成功",
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "title": "深度冥想引导",
        "description": "一段20分钟的深度冥想引导...",
        "audioUrl": "https://example.com/audio/meditation1.mp3",
        "coverImageUrl": "https://example.com/images/meditation1.jpg",
        "categoryId": 1,
        "categoryName": "冥想音乐",
        "artistNarrator": "李静心",
        "album": "冥想系列第一季",
        "durationSeconds": 1200,
        "tags": "冥想,放松,正念",
        "publicationDate": "2024-01-15",
        "playsCount": 1250,
        "likesCount": 89,
        "commentsCount": 23,
        "isFeatured": true,
        "status": "published",
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 10,
    "pages": 10,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

### 1.2 获取节目详情

**接口地址：** `GET /api/programs/{programId}`

**功能描述：** 根据节目 ID 获取详细信息

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求示例：**

```
GET /api/programs/1
```

**响应格式：**

```json
{
  "code": 200,
  "message": "获取节目详情成功",
  "success": true,
  "data": {
    "id": 1,
    "title": "深度冥想引导",
    "description": "一段20分钟的深度冥想引导，帮助您放松身心，释放压力。",
    "audioUrl": "https://example.com/audio/meditation1.mp3",
    "coverImageUrl": "https://example.com/images/meditation1.jpg",
    "categoryId": 1,
    "categoryName": "冥想音乐",
    "artistNarrator": "李静心",
    "album": "冥想系列第一季",
    "durationSeconds": 1200,
    "tags": "冥想,放松,正念",
    "publicationDate": "2024-01-15",
    "playsCount": 1250,
    "likesCount": 89,
    "commentsCount": 23,
    "isFeatured": true,
    "status": "published",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### 1.3 播放节目（统计播放次数）

**接口地址：** `POST /api/programs/{programId}/play`

**功能描述：** 记录节目播放，增加播放次数统计

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求示例：**

```
POST /api/programs/1/play
```

**响应格式：**

```json
{
  "code": 200,
  "message": "播放统计成功",
  "success": true,
  "data": null
}
```

### 1.4 获取热门节目

**接口地址：** `GET /api/programs/hot`

**功能描述：** 获取热门节目列表（按播放次数排序）

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

### 1.5 获取精选节目

**接口地址：** `GET /api/programs/featured`

**功能描述：** 获取精选节目列表

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

## 2. 个性化互动

### 2.1 喜欢节目

**接口地址：** `POST /api/programs/{programId}/like`

**功能描述：** 用户喜欢某个节目，会增加节目的喜欢次数

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID（临时实现，生产环境应使用 JWT） |

**请求示例：**

```
POST /api/programs/1/like
Headers:
  User-Id: 123
```

**响应格式：**

```json
{
  "code": 200,
  "message": "喜欢成功",
  "success": true,
  "data": null
}
```

**错误响应：**

```json
{
  "code": 400,
  "message": "您已经喜欢过这个节目了",
  "success": false,
  "data": null
}
```

### 2.2 取消喜欢节目

**接口地址：** `DELETE /api/programs/{programId}/like`

**功能描述：** 用户取消喜欢某个节目，会减少节目的喜欢次数

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID（临时实现，生产环境应使用 JWT） |

**请求示例：**

```
DELETE /api/programs/1/like
Headers:
  User-Id: 123
```

**响应格式：**

```json
{
  "code": 200,
  "message": "取消喜欢成功",
  "success": true,
  "data": null
}
```

**错误响应：**

```json
{
  "code": 400,
  "message": "您还没有喜欢过这个节目",
  "success": false,
  "data": null
}
```

### 2.3 检查喜欢状态

**接口地址：** `GET /api/programs/{programId}/like-status`

**功能描述：** 检查用户是否喜欢某个节目

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 否 | 用户 ID（未登录时返回 false） |

**请求示例：**

```
GET /api/programs/1/like-status
Headers:
  User-Id: 123
```

**响应格式：**

```json
{
  "code": 200,
  "message": "获取喜欢状态成功",
  "success": true,
  "data": true
}
```

## 3. 歌单管理

### 3.1 创建歌单

**接口地址：** `POST /api/playlists`

**功能描述：** 用户创建新的歌单

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID（临时实现，生产环境应使用 JWT） |

**请求体：**

```json
{
  "name": "我的冥想歌单",
  "description": "收集各种冥想音乐",
  "isPublic": true
}
```

**请求参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | String | 是 | 歌单名称，最大 100 字符 |
| description | String | 否 | 歌单描述 |
| isPublic | Boolean | 否 | 是否公开，默认 true |

**响应格式：**

```json
{
  "code": 200,
  "message": "创建歌单成功",
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "name": "我的冥想歌单",
    "description": "收集各种冥想音乐",
    "isPublic": true,
    "createdAt": "2024-01-20T10:30:00",
    "updatedAt": "2024-01-20T10:30:00",
    "itemCount": 0
  }
}
```

### 3.2 获取用户歌单列表

**接口地址：** `GET /api/playlists`

**功能描述：** 获取当前用户创建的所有歌单

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取歌单列表成功",
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 123,
      "name": "我的冥想歌单",
      "description": "收集各种冥想音乐",
      "isPublic": true,
      "createdAt": "2024-01-20T10:30:00",
      "updatedAt": "2024-01-20T10:30:00",
      "itemCount": 5
    }
  ]
}
```

### 3.3 获取歌单详情

**接口地址：** `GET /api/playlists/{playlistId}`

**功能描述：** 获取歌单详细信息，包含歌单内的节目列表

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 否 | 用户 ID（用于权限检查） |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取歌单详情成功",
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "name": "我的冥想歌单",
    "description": "收集各种冥想音乐",
    "isPublic": true,
    "createdAt": "2024-01-20T10:30:00",
    "updatedAt": "2024-01-20T10:30:00",
    "itemCount": 2,
    "items": [
      {
        "id": 1,
        "playlistId": 1,
        "programId": 1,
        "displayOrder": 1,
        "addedAt": "2024-01-20T11:00:00",
        "programTitle": "深度冥想引导",
        "programCoverImageUrl": "https://example.com/images/meditation1.jpg",
        "programArtistNarrator": "李静心",
        "programDurationSeconds": 1200
      }
    ]
  }
}
```

### 3.4 更新歌单

**接口地址：** `PUT /api/playlists/{playlistId}`

**功能描述：** 更新歌单信息

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**请求体：**

```json
{
  "name": "更新后的歌单名称",
  "description": "更新后的描述",
  "isPublic": false
}
```

### 3.5 删除歌单

**接口地址：** `DELETE /api/playlists/{playlistId}`

**功能描述：** 删除歌单及其所有内容

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

## 4. 歌单内容管理

### 4.1 添加节目到歌单

**接口地址：** `POST /api/playlists/{playlistId}/items`

**功能描述：** 向歌单中添加节目

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**请求体：**

```json
{
  "programId": 123
}
```

**响应格式：**

```json
{
  "code": 200,
  "message": "添加节目到歌单成功",
  "success": true,
  "data": {
    "id": 1,
    "playlistId": 1,
    "programId": 123,
    "displayOrder": 1,
    "addedAt": "2024-01-20T11:00:00",
    "programTitle": "深度冥想引导",
    "programCoverImageUrl": "https://example.com/images/meditation1.jpg",
    "programArtistNarrator": "李静心",
    "programDurationSeconds": 1200
  }
}
```

### 4.2 获取歌单内容

**接口地址：** `GET /api/playlists/{playlistId}/items`

**功能描述：** 获取歌单内的节目列表

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

### 4.3 移除歌单内节目

**接口地址：** `DELETE /api/playlists/{playlistId}/items/{itemId}`

**功能描述：** 从歌单中移除指定节目

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |
| itemId | Integer | 是 | 歌单项 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

### 4.4 调整歌单顺序

**接口地址：** `PUT /api/playlists/{playlistId}/items/order`

**功能描述：** 调整歌单内节目的播放顺序

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| playlistId | Integer | 是 | 歌单 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**请求体：**

```json
{
  "itemIds": [3, 1, 2]
}
```

**说明：** itemIds 数组按新的顺序排列歌单项 ID

## 5. 评论管理

### 5.1 发表评论

**接口地址：** `POST /api/programs/{programId}/comments`

**功能描述：** 用户对节目发表评论，会增加节目的评论次数

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID（临时实现，生产环境应使用 JWT） |

**请求体：**

```json
{
  "content": "这个节目很棒，很有帮助！",
  "parentCommentId": null
}
```

**请求参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content | String | 是 | 评论内容，最大 1000 字符 |
| parentCommentId | Integer | 否 | 父评论 ID，用于回复评论 |

**响应格式：**

```json
{
  "code": 200,
  "message": "发表评论成功",
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "userName": "user@example.com",
    "userEmail": "user@example.com",
    "programId": 1,
    "programTitle": "深度冥想引导",
    "parentCommentId": null,
    "parentUserName": null,
    "content": "这个节目很棒，很有帮助！",
    "createdAt": "2024-01-20T15:30:00",
    "updatedAt": "2024-01-20T15:30:00"
  }
}
```

### 5.2 回复评论

**接口地址：** `POST /api/programs/{programId}/comments`

**功能描述：** 用户回复某条评论

**请求体：**

```json
{
  "content": "我也觉得很不错！",
  "parentCommentId": 1
}
```

**说明：** 当 parentCommentId 有值时，表示这是一条回复

### 5.3 获取节目评论列表

**接口地址：** `GET /api/programs/{programId}/comments`

**功能描述：** 获取节目的评论列表（分页，只返回顶级评论）

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目 ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取评论列表成功",
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 123,
        "userName": "user@example.com",
        "programId": 1,
        "programTitle": "深度冥想引导",
        "parentCommentId": null,
        "content": "这个节目很棒，很有帮助！",
        "createdAt": "2024-01-20T15:30:00",
        "replyCount": 2
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 5.4 获取评论回复列表

**接口地址：** `GET /api/comments/{commentId}/replies`

**功能描述：** 获取某条评论的所有回复

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| commentId | Integer | 是 | 评论 ID |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取回复列表成功",
  "success": true,
  "data": [
    {
      "id": 2,
      "userId": 124,
      "userName": "user2@example.com",
      "programId": 1,
      "parentCommentId": 1,
      "parentUserName": "user@example.com",
      "content": "我也觉得很不错！",
      "createdAt": "2024-01-20T16:00:00"
    }
  ]
}
```

### 5.5 获取用户评论列表

**接口地址：** `GET /api/users/{userId}/comments`

**功能描述：** 获取用户发表的所有评论

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Integer | 是 | 用户 ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

### 5.6 获取评论详情

**接口地址：** `GET /api/comments/{commentId}`

**功能描述：** 获取单条评论的详细信息

### 5.7 删除评论

**接口地址：** `DELETE /api/comments/{commentId}`

**功能描述：** 删除评论（只有评论作者可以删除）

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| commentId | Integer | 是 | 评论 ID |

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

## 6. 个人中心

### 6.1 获取用户信息

**接口地址：** `GET /api/me`

**功能描述：** 获取当前用户的个人资料和统计信息

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID（临时实现，生产环境应使用 JWT） |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "success": true,
  "data": {
    "id": 123,
    "username": "music_lover",
    "email": "user@example.com",
    "avatar": "/img/avatar01.png",
    "bio": "这是music_lover的心理音乐电台",
    "createdAt": "2024-01-15T10:30:00",
    "likedProgramsCount": 15,
    "playlistsCount": 3,
    "commentsCount": 8
  }
}
```

### 6.2 编辑用户信息

**接口地址：** `PUT /api/me`

**功能描述：** 更新用户个人资料

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**请求体：**

```json
{
  "username": "new_username",
  "avatar": "/img/new_avatar.png",
  "bio": "更新后的个人简介"
}
```

**请求参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 否 | 用户名，最大 50 字符，不能重复 |
| avatar | String | 否 | 头像 URL |
| bio | String | 否 | 个人简介 |

### 6.3 获取用户喜欢的节目

**接口地址：** `GET /api/me/liked-programs`

**功能描述：** 获取当前用户喜欢的节目列表

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

**响应格式：**

```json
{
  "code": 200,
  "message": "获取喜欢的节目列表成功",
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "深度冥想引导",
        "description": "帮助您进入深度冥想状态",
        "artistNarrator": "李静心",
        "durationSeconds": 1200,
        "categoryName": "冥想音乐",
        "likedAt": "2024-01-20T10:30:00"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 6.4 获取用户的歌单

**接口地址：** `GET /api/me/playlists`

**功能描述：** 获取当前用户创建的歌单列表

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

### 6.5 获取用户的评论

**接口地址：** `GET /api/me/comments`

**功能描述：** 获取当前用户发表的评论列表

**请求头：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| User-Id | Integer | 是 | 用户 ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

## 7. 节目搜索

### 7.1 搜索节目

**接口地址：** `GET /api/programs/search`

**功能描述：** 通过关键词搜索电台节目

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| q | String | 否 | - | 搜索关键词，为空时返回所有节目 |
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大 50） |

**搜索范围：**

- 节目标题 (title)
- 节目描述 (description)
- 艺术家/播讲人 (artist_narrator)
- 标签 (tags)
- 分类名称 (category name)

**响应格式：**

```json
{
  "code": 200,
  "message": "搜索节目成功，关键词：冥想",
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "深度冥想引导",
        "description": "帮助您进入深度冥想状态",
        "artistNarrator": "李静心",
        "durationSeconds": 1200,
        "categoryName": "冥想音乐",
        "tags": "冥想,放松,睡眠",
        "createdAt": "2024-01-15T10:30:00"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## 8. 分类管理

### 8.1 获取所有分类

**接口地址：** `GET /api/categories`

**功能描述：** 获取所有分类列表

**响应格式：**

```json
{
  "code": 200,
  "message": "获取分类列表成功",
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "冥想音乐",
      "description": "专注于冥想和放松的音乐节目",
      "createdAt": "2024-01-01T00:00:00"
    }
  ]
}
```

### 8.2 获取分类详情

**接口地址：** `GET /api/categories/{categoryId}`

### 8.3 创建分类

**接口地址：** `POST /api/categories`

**请求体：**

```json
{
  "name": "新分类",
  "description": "分类描述"
}
```
