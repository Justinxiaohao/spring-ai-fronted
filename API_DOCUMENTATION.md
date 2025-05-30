# 电台节目API文档

## 1. 主页节目展示

### 1.1 获取节目列表
**接口地址：** `GET /api/programs`

**功能描述：** 分页查询电台节目列表，支持多种排序和筛选条件

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码（从1开始） |
| limit | Integer | 否 | 10 | 每页大小（最大100） |
| sortBy | String | 否 | createdAt_desc | 排序方式 |
| categoryId | Integer | 否 | - | 分类ID筛选 |
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

**功能描述：** 根据节目ID获取详细信息

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| programId | Integer | 是 | 节目ID |

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
| programId | Integer | 是 | 节目ID |

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
| limit | Integer | 否 | 10 | 每页大小（最大50） |

### 1.5 获取精选节目
**接口地址：** `GET /api/programs/featured`

**功能描述：** 获取精选节目列表

**请求参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | Integer | 否 | 1 | 页码 |
| limit | Integer | 否 | 10 | 每页大小（最大50） |

## 2. 分类管理

### 2.1 获取所有分类
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

### 2.2 获取分类详情
**接口地址：** `GET /api/categories/{categoryId}`

### 2.3 创建分类
**接口地址：** `POST /api/categories`

**请求体：**
```json
{
    "name": "新分类",
    "description": "分类描述"
}
```

## 3. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 4. 使用示例

### 4.1 获取首页推荐节目
```javascript
// 获取精选节目（首页轮播）
fetch('/api/programs/featured?limit=5')

// 获取最新节目
fetch('/api/programs?sortBy=createdAt_desc&limit=10')

// 获取热门节目
fetch('/api/programs/hot?limit=10')
```

### 4.2 分类筛选
```javascript
// 获取冥想音乐分类的节目
fetch('/api/programs?categoryId=1&sortBy=likesCount_desc')

// 按标签筛选
fetch('/api/programs?tag=冥想&sortBy=playsCount_desc')
```

### 4.3 播放统计
```javascript
// 用户开始播放节目时调用
fetch('/api/programs/1/play', { method: 'POST' })
```
