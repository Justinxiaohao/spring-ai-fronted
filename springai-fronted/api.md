openapi: "3.0.1"
info:
title: "API Documentation"
version: "1.0"
paths:
/user/register:
post:
summary: "register"
description: "register"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/user/login:
post:
summary: "login"
description: "login"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/user/login/captcha:
post:
summary: "loginWithCaptcha"
description: "loginWithCaptcha"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/user/check-user:
post:
summary: "checkUser"
description: "checkUser"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/user:
get:
summary: "getUserInfo"
description: "getUserInfo"
parameters: - name: "email"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
id:
type: "integer"
description: "用户 ID，主键，自增"
username:
type: "string"
description: "用户名，不能为空，唯一"
email:
type: "string"
description: "邮箱，不能为空，唯一"
password:
type: "string"
description: "密码，不能为空"
avatar:
type: "string"
description: "头像 URL"
bio:
type: "string"
description: "个人简介"
createdAt:
type: "integer"
description: "创建时间，插入时自动填充"
/user/update:
put:
summary: "updateUserInfo"
description: "updateUserInfo"
parameters: - name: "email"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false - name: "nickname"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false - name: "bio"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false
requestBody:
content:
multipart/form-data:
schema:
type: "object"
properties:
avatar:
type: "string"
description: ""
format: "binary"
required: false
responses:
"200":
description: ""
content:
application/json:
schema:
type: "string"
/api/upload/avatar:
post:
summary: "上传头像"
description: "上传头像"
requestBody:
content:
multipart/form-data:
schema:
required: - "file"
type: "object"
properties:
file:
type: "string"
description: "上传的头像文件"
format: "binary"
required: true
responses:
"200":
description: "上传结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
fileName:
type: "string"
description: "文件名"
fileUrl:
type: "string"
description: "文件访问 URL"
fileSize:
type: "integer"
description: "文件大小（字节）"
format: "int64"
fileType:
type: "string"
description: "文件类型"
uploadTime:
type: "integer"
description: "上传时间戳"
format: "int64"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "上传结果"
/api/upload/avatar/{filename}:
delete:
summary: "删除头像"
description: "删除头像"
parameters: - name: "filename"
in: "path"
description: "要删除的文件名"
required: true
schema:
type: "string"
responses:
"200":
description: "删除结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "boolean"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "删除结果"
/api/upload/avatar/{filename}/exists:
get:
summary: "检查文件是否存在"
description: "检查文件是否存在"
parameters: - name: "filename"
in: "path"
description: "文件名"
required: true
schema:
type: "string"
responses:
"200":
description: "文件是否存在"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "boolean"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "文件是否存在"
/api/categories:
post:
summary: "创建新分类"
description: "创建新分类"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
id:
type: "integer"
description: "分类 ID，主键，自增"
name:
type: "string"
description: "分类名称，唯一，不能为空，最大长度 100"
description:
type: "string"
description: "分类描述"
createdAt:
type: "integer"
description: "创建时间，插入时自动填充"
description: "分类信息"
responses:
"200":
description: "创建结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "分类 ID，主键，自增"
name:
type: "string"
description: "分类名称，唯一，不能为空，最大长度 100"
description:
type: "string"
description: "分类描述"
createdAt:
type: "integer"
description: "创建时间，插入时自动填充"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "创建结果"
/api/categories/{categoryId}:
get:
summary: "根据 ID 获取分类详情"
description: "根据 ID 获取分类详情"
parameters: - name: "categoryId"
in: "path"
description: "分类 ID"
required: true
schema:
type: "integer"
responses:
"200":
description: "分类详情"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "分类 ID，主键，自增"
name:
type: "string"
description: "分类名称，唯一，不能为空，最大长度 100"
description:
type: "string"
description: "分类描述"
createdAt:
type: "integer"
description: "创建时间，插入时自动填充"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "分类详情"
/api/me:
put:
summary: "编辑用户信息"
description: "编辑用户信息"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
requestBody:
content:
application/json:
schema:
type: "object"
properties:
username:
type: "string"
description: "用户名，可选"
avatar:
type: "string"
description: "头像 URL，可选"
bio:
type: "string"
description: "个人简介，可选"
description: "更新用户资料请求"
responses:
"200":
description: "更新后的用户资料"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "用户 ID"
username:
type: "string"
description: "用户名"
email:
type: "string"
description: "邮箱"
avatar:
type: "string"
description: "头像 URL"
bio:
type: "string"
description: "个人简介"
createdAt:
type: "integer"
description: "创建时间"
likedProgramsCount:
type: "integer"
description: "统计信息"
playlistsCount:
type: "integer"
description: ""
commentsCount:
type: "integer"
description: ""
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "更新后的用户资料"
/api/me/update-with-avatar:
post:
summary: "编辑用户信息（支持头像上传）"
description: "编辑用户信息（支持头像上传）"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {} - name: "username"
in: "query"
description: "用户名（可选）"
required: false
schema:
type: "string"
nullable: false - name: "bio"
in: "query"
description: "个人简介（可选）"
required: false
schema:
type: "string"
nullable: false
requestBody:
content:
multipart/form-data:
schema:
type: "object"
properties:
avatar:
type: "string"
description: "头像文件（可选）"
format: "binary"
required: false
responses:
"200":
description: "更新后的用户资料"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "用户 ID"
username:
type: "string"
description: "用户名"
email:
type: "string"
description: "邮箱"
avatar:
type: "string"
description: "头像 URL"
bio:
type: "string"
description: "个人简介"
createdAt:
type: "integer"
description: "创建时间"
likedProgramsCount:
type: "integer"
description: "统计信息"
playlistsCount:
type: "integer"
description: ""
commentsCount:
type: "integer"
description: ""
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "更新后的用户资料"
/api/me/liked-programs:
get:
summary: "获取用户喜欢的节目"
description: "获取用户喜欢的节目"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {} - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "用户喜欢的节目列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "用户喜欢的节目列表"
/api/me/playlists:
get:
summary: "获取用户的歌单"
description: "获取用户的歌单"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "用户的歌单列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "array"
description: "响应数据"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单 ID"
userId:
type: "integer"
description: "用户 ID"
name:
type: "string"
description: "歌单名称"
description:
type: "string"
description: "歌单描述"
isPublic:
type: "boolean"
description: "是否公开"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
itemCount:
type: "integer"
description: "歌单内节目数量"
items:
type: "array"
description: "歌单内的节目列表（可选，用于详情页面）"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单项 ID"
playlistId:
type: "integer"
description: "歌单 ID"
programId:
type: "integer"
description: "节目 ID"
displayOrder:
type: "integer"
description: "显示顺序"
addedAt:
type: "integer"
description: "添加时间"
programTitle:
type: "string"
description: "节目标题"
programCoverImageUrl:
type: "string"
description: "节目封面图片 URL"
programArtistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
programDurationSeconds:
type: "integer"
description: "节目时长（秒）"
description: "歌单项数据传输对象"
description: "歌单数据传输对象"
success:
type: "boolean"
description: "请求是否成功"
description: "用户的歌单列表"
/api/me/comments:
get:
summary: "获取用户的评论"
description: "获取用户的评论"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {} - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "用户的评论列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties: {}
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "用户的评论列表"
/code/send-code:
post:
summary: "sendCode"
description: "sendCode"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/code/verify-code:
post:
summary: "verifyCode"
description: "verifyCode"
requestBody:
content:
application/json:
schema:
type: "object"
properties:
key:
type: "string"
description: ""
responses:
"200":
description: ""
content:
application/json:
schema:
type: "object"
properties:
key:
type: "object"
properties: {}
/api/programs/{programId}/comments:
get:
summary: "获取节目的评论列表"
description: "获取节目的评论列表"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer" - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "评论列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties: {}
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "评论列表"
/api/comments/{commentId}/replies:
get:
summary: "获取评论的回复列表"
description: "获取评论的回复列表"
parameters: - name: "commentId"
in: "path"
description: "评论 ID"
required: true
schema:
type: "integer"
responses:
"200":
description: "回复列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "array"
description: "响应数据"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties: {}
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
success:
type: "boolean"
description: "请求是否成功"
description: "回复列表"
/api/users/{userId}/comments:
get:
summary: "获取用户的评论列表"
description: "获取用户的评论列表"
parameters: - name: "userId"
in: "path"
description: "用户 ID"
required: true
schema:
type: "integer" - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "评论列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties: {}
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "评论列表"
/api/comments/{commentId}:
delete:
summary: "删除评论"
description: "删除评论"
parameters: - name: "commentId"
in: "path"
description: "评论 ID"
required: true
schema:
type: "integer" - name: "User-Id"
in: "header"
description: "用户 ID（临时通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
/ai/chat:
get:
summary: "chat"
description: "chat"
parameters: - name: "prompt"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false - name: "chatId"
in: "query"
description: ""
required: true
schema:
type: "string"
nullable: false
responses:
"200":
description: ""
content:
text/plain:
schema:
type: "array"
items:
type: "string"
/api/programs:
get:
summary: "主页节目展示 - 分页查询电台节目列表"
description: "主页节目展示 - 分页查询电台节目列表"
parameters: - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 100）"
required: true
schema:
type: "integer"
nullable: false
default: "10" - name: "sortBy"
in: "query"
description: "排序方式：\n - createdAt_desc: 最新\n -\
 \ playsCount_desc: 最热（播放次数）\n - likesCount_desc: 最受欢迎（点赞次数\
 ）\n - isFeatured_desc_createdAt_desc: 精选优先，然后按时间\n \
 \ - commentsCount_desc: 评论最多"
required: true
schema:
type: "string"
nullable: false
default: "createdAt_desc" - name: "categoryId"
in: "query"
description: "分类 ID（可选）"
required: false
schema:
type: "integer"
nullable: false - name: "tag"
in: "query"
description: "标签（可选）"
required: false
schema:
type: "string"
nullable: false
responses:
"200":
description: "分页结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "分页结果"
/api/programs/{programId}:
get:
summary: "获取节目详情"
description: "获取节目详情"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer"
responses:
"200":
description: "节目详情"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "节目详情"
/api/programs/{programId}/play:
post:
summary: "播放节目（统计播放次数）"
description: "播放节目（统计播放次数）"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer"
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
/api/programs/hot:
get:
summary: "获取热门节目"
description: "获取热门节目"
parameters: - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "热门节目列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "热门节目列表"
/api/programs/featured:
get:
summary: "获取精选节目"
description: "获取精选节目"
parameters: - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "精选节目列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "精选节目列表"
/api/programs/{programId}/like:
post:
summary: "喜欢节目"
description: "喜欢节目"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer" - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
delete:
summary: "取消喜欢节目"
description: "取消喜欢节目"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer" - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
/api/programs/{programId}/like-status:
get:
summary: "检查用户是否喜欢某个节目"
description: "检查用户是否喜欢某个节目"
parameters: - name: "programId"
in: "path"
description: "节目 ID"
required: true
schema:
type: "integer" - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "喜欢状态"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "boolean"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "喜欢状态"
/api/programs/search:
get:
summary: "搜索节目"
description: "搜索节目"
parameters: - name: "q"
in: "query"
description: "搜索关键词"
required: false
schema:
type: "string"
nullable: false - name: "page"
in: "query"
description: "页码（默认 1）"
required: true
schema:
type: "integer"
nullable: false
default: "1" - name: "limit"
in: "query"
description: "每页大小（默认 10，最大 50）"
required: true
schema:
type: "integer"
nullable: false
default: "10"
responses:
"200":
description: "搜索结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
records:
type: "array"
description: "数据列表"
items:
type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
total:
type: "integer"
description: "总记录数"
format: "int64"
current:
type: "integer"
description: "当前页码"
format: "int64"
size:
type: "integer"
description: "每页大小"
format: "int64"
pages:
type: "integer"
description: "总页数"
format: "int64"
hasPrevious:
type: "boolean"
description: "是否有上一页"
hasNext:
type: "boolean"
description: "是否有下一页"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "搜索结果"
/api/playlists:
post:
summary: "创建新歌单"
description: "创建新歌单"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
requestBody:
content:
application/json:
schema:
type: "object"
properties:
name:
type: "string"
description: "歌单名称"
description:
type: "string"
description: "歌单描述（可选）"
isPublic:
type: "boolean"
description: "是否公开（默认 false）"
description: "创建歌单请求"
responses:
"200":
description: "创建结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "object"
properties:
id:
type: "integer"
description: "歌单 ID"
userId:
type: "integer"
description: "用户 ID"
name:
type: "string"
description: "歌单名称"
description:
type: "string"
description: "歌单描述"
isPublic:
type: "boolean"
description: "是否公开"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
itemCount:
type: "integer"
description: "歌单内节目数量"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "创建结果"
get:
summary: "获取当前用户的歌单列表"
description: "获取当前用户的歌单列表"
parameters: - name: "User-Email"
in: "header"
description: "用户邮箱地址（通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "歌单列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "array"
description: "响应数据"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单 ID"
userId:
type: "integer"
description: "用户 ID"
name:
type: "string"
description: "歌单名称"
description:
type: "string"
description: "歌单描述"
isPublic:
type: "boolean"
description: "是否公开"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
itemCount:
type: "integer"
description: "歌单内节目数量"
items:
type: "array"
description: "歌单内的节目列表（可选，用于详情页面）"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单项 ID"
playlistId:
type: "integer"
description: "歌单 ID"
programId:
type: "integer"
description: "节目 ID"
displayOrder:
type: "integer"
description: "显示顺序"
addedAt:
type: "integer"
description: "添加时间"
programTitle:
type: "string"
description: "节目标题"
programCoverImageUrl:
type: "string"
description: "节目封面图片 URL"
programArtistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
programDurationSeconds:
type: "integer"
description: "节目时长（秒）"
description: "歌单项数据传输对象"
description: "歌单数据传输对象"
success:
type: "boolean"
description: "请求是否成功"
description: "歌单列表"
/api/playlists/{playlistId}:
delete:
summary: "删除歌单"
description: "删除歌单"
parameters: - name: "playlistId"
in: "path"
description: "歌单 ID"
required: true
schema:
type: "integer" - name: "User-Id"
in: "header"
description: "用户 ID（临时通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
/api/playlists/{playlistId}/items:
get:
summary: "获取歌单内的节目列表"
description: "获取歌单内的节目列表"
parameters: - name: "playlistId"
in: "path"
description: "歌单 ID"
required: true
schema:
type: "integer" - name: "User-Id"
in: "header"
description: "用户 ID（临时通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "歌单项列表"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "array"
description: "响应数据"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单项 ID"
playlistId:
type: "integer"
description: "歌单 ID"
programId:
type: "integer"
description: "节目 ID"
displayOrder:
type: "integer"
description: "显示顺序"
addedAt:
type: "integer"
description: "添加时间"
programTitle:
type: "string"
description: "节目标题"
programCoverImageUrl:
type: "string"
description: "节目封面图片 URL"
programArtistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
programDurationSeconds:
type: "integer"
description: "节目时长（秒）"
description: "歌单项数据传输对象"
success:
type: "boolean"
description: "请求是否成功"
description: "歌单项列表"
/api/playlists/{playlistId}/items/{itemId}:
delete:
summary: "从歌单中移除节目"
description: "从歌单中移除节目"
parameters: - name: "playlistId"
in: "path"
description: "歌单 ID"
required: true
schema:
type: "integer" - name: "itemId"
in: "path"
description: "歌单项 ID"
required: true
schema:
type: "integer" - name: "User-Id"
in: "header"
description: "用户 ID（临时通过请求头传递）"
required: false
schema: {}
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
/api/playlists/{playlistId}/items/order:
put:
summary: "调整歌单内节目顺序"
description: "调整歌单内节目顺序"
parameters: - name: "playlistId"
in: "path"
description: "歌单 ID"
required: true
schema:
type: "integer" - name: "User-Id"
in: "header"
description: "用户 ID（临时通过请求头传递）"
required: false
schema: {}
requestBody:
content:
application/json:
schema:
type: "object"
properties:
itemIds:
type: "array"
description: "歌单项 ID 列表，按新的顺序排列"
items:
type: "integer"
description: "顺序调整请求"
responses:
"200":
description: "操作结果"
content:
application/json:
schema:
type: "object"
properties:
code:
type: "integer"
description: "响应状态码"
message:
type: "string"
description: "响应消息"
data:
type: "string"
description: "响应数据"
success:
type: "boolean"
description: "请求是否成功"
description: "操作结果"
components:
schemas:
文件上传响应 DTO:
type: "object"
properties:
fileName:
type: "string"
description: "文件名"
fileUrl:
type: "string"
description: "文件访问 URL"
fileSize:
type: "integer"
description: "文件大小（字节）"
format: "int64"
fileType:
type: "string"
description: "文件类型"
uploadTime:
type: "integer"
description: "上传时间戳"
format: "int64"
description: "响应数据"
电台节目分类实体类:
type: "object"
properties:
id:
type: "integer"
description: "分类 ID，主键，自增"
name:
type: "string"
description: "分类名称，唯一，不能为空，最大长度 100"
description:
type: "string"
description: "分类描述"
createdAt:
type: "integer"
description: "创建时间，插入时自动填充"
description: "响应数据"
用户个人资料 DTO:
type: "object"
properties:
id:
type: "integer"
description: "用户 ID"
username:
type: "string"
description: "用户名"
email:
type: "string"
description: "邮箱"
avatar:
type: "string"
description: "头像 URL"
bio:
type: "string"
description: "个人简介"
createdAt:
type: "integer"
description: "创建时间"
likedProgramsCount:
type: "integer"
description: "统计信息"
playlistsCount:
type: "integer"
description: ""
commentsCount:
type: "integer"
description: ""
description: "响应数据"
? "电台节目数据传输对象\n 用于主页节目展示的响应数据"
: type: "object"
properties:
id:
type: "integer"
description: "节目 ID"
title:
type: "string"
description: "节目名称"
description:
type: "string"
description: "节目简介"
audioUrl:
type: "string"
description: "音频文件访问 URL"
coverImageUrl:
type: "string"
description: "封面图片 URL"
categoryId:
type: "integer"
description: "分类 ID"
categoryName:
type: "string"
description: "分类名称"
artistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
album:
type: "string"
description: "所属专辑/系列"
durationSeconds:
type: "integer"
description: "节目时长（秒）"
tags:
type: "string"
description: "标签，逗号分隔"
publicationDate:
type: "string"
description: "发布日期"
playsCount:
type: "integer"
description: "播放次数"
likesCount:
type: "integer"
description: "喜欢次数"
commentsCount:
type: "integer"
description: "评论数量"
isFeatured:
type: "boolean"
description: "是否精选/推荐"
status:
type: "string"
description: "节目状态"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
description: "电台节目数据传输对象\n 用于主页节目展示的响应数据"
歌单项数据传输对象:
type: "object"
properties:
id:
type: "integer"
description: "歌单项 ID"
playlistId:
type: "integer"
description: "歌单 ID"
programId:
type: "integer"
description: "节目 ID"
displayOrder:
type: "integer"
description: "显示顺序"
addedAt:
type: "integer"
description: "添加时间"
programTitle:
type: "string"
description: "节目标题"
programCoverImageUrl:
type: "string"
description: "节目封面图片 URL"
programArtistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
programDurationSeconds:
type: "integer"
description: "节目时长（秒）"
description: "歌单项数据传输对象"
歌单数据传输对象:
type: "object"
properties:
id:
type: "integer"
description: "歌单 ID"
userId:
type: "integer"
description: "用户 ID"
name:
type: "string"
description: "歌单名称"
description:
type: "string"
description: "歌单描述"
isPublic:
type: "boolean"
description: "是否公开"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
itemCount:
type: "integer"
description: "歌单内节目数量"
items:
type: "array"
description: "歌单内的节目列表（可选，用于详情页面）"
items:
type: "object"
properties:
id:
type: "integer"
description: "歌单项 ID"
playlistId:
type: "integer"
description: "歌单 ID"
programId:
type: "integer"
description: "节目 ID"
displayOrder:
type: "integer"
description: "显示顺序"
addedAt:
type: "integer"
description: "添加时间"
programTitle:
type: "string"
description: "节目标题"
programCoverImageUrl:
type: "string"
description: "节目封面图片 URL"
programArtistNarrator:
type: "string"
description: "艺术家/播讲人/主播名"
programDurationSeconds:
type: "integer"
description: "节目时长（秒）"
description: "歌单项数据传输对象"
description: "响应数据"
评论数据传输对象:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties:
id:
type: "integer"
description: "评论 ID"
userId:
type: "integer"
description: "用户 ID"
userName:
type: "string"
description: "用户名"
userEmail:
type: "string"
description: "用户邮箱（可选，用于显示头像等）"
programId:
type: "integer"
description: "节目 ID"
programTitle:
type: "string"
description: "节目标题"
parentCommentId:
type: "integer"
description: "父评论 ID"
parentUserName:
type: "string"
description: "父评论用户名（用于回复显示）"
content:
type: "string"
description: "评论内容"
createdAt:
type: "integer"
description: "创建时间"
updatedAt:
type: "integer"
description: "更新时间"
replies:
type: "array"
description: "回复列表（可选，用于嵌套显示）"
items:
type: "object"
properties: {}
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "评论数据传输对象"
replyCount:
type: "integer"
description: "回复数量"
description: "响应数据"
