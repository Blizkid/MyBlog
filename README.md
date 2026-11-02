# MyBlog｜个人博客与作品主页

MyBlog 是一个前后端分离的个人博客与主页项目。后端使用 Go、Gin 与 GORM 提供接口，前端使用 React、Vite 和 Tailwind CSS 展示文章、个人资料、项目经历、生活动态与兴趣收藏。

## 功能概览

- **博客与评论**：文章列表、详情、编辑、删除、评论及文章收藏管理。
- **用户资料**：注册登录、JWT 认证、头像、简介、社交链接与密码修改。
- **代码与经历**：工作经历、个人项目和推荐 GitHub 仓库展示及编辑。
- **生活与兴趣**：动态、旅行城市地图、词云、电影、音乐、书籍与时间分配。
- **游戏与 Steam**：游戏展示、自研游戏记录、Steam 资料与游戏时长查询。
- **页面体验**：Framer Motion 动效、页面切换、光标轨迹和工具弹窗。
- **基础能力**：图片与音频上传、访问量记录、数据库自动迁移与日志轮转。

各模块完整程度以当前源码为准。Steam 实时数据依赖用户自行配置 API Key、Steam ID 及账号可见性；此仓库不包含这些凭据或数据库内容。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 后端 | Go 1.23.11、Gin、GORM、JWT、bcrypt、Zap |
| 数据库 | MySQL |
| 前端 | React 18、Vite 5、Tailwind CSS、Framer Motion |
| 地图与图标 | Leaflet / React Leaflet、Lucide React |

## 项目结构

```text
MyBlog/
├── README.md
└── blog-management/
    ├── config/                 # 配置加载
    ├── config.example.yaml     # 开发配置示例
    ├── database/               # 数据模型、迁移与初始化数据
    ├── frontend/               # React 前端
    ├── internal/
    │   ├── controllers/        # 业务接口
    │   ├── middleware/         # 认证、跨域与日志中间件
    │   ├── response/           # 响应封装
    │   └── steam/              # Steam API 客户端与服务
    ├── logger/                 # 日志配置
    ├── routers/                # 路由注册
    ├── utils/                  # JWT 工具
    ├── go.mod / go.sum
    └── main.go
```

Git 仓库根目录为 `MyBlog/`，Go 模块与前端保留在 `blog-management/` 内。以下后端命令都在 `blog-management/` 执行。

## 本地运行

### 1. 准备环境

安装 Go 1.23.11 或兼容版本、Node.js 18+、npm，以及 MySQL 8 或兼容版本。

```powershell
git clone https://github.com/Blizkid/MyBlog.git
cd MyBlog/blog-management
Copy-Item config.example.yaml config.yaml
go mod download
```

### 2. 创建数据库并配置连接

在 MySQL 中为本地开发创建数据库及专用账号，例如：

```sql
CREATE DATABASE IF NOT EXISTS myblog
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'blog_user'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON myblog.* TO 'blog_user'@'localhost';
```

将示例密码替换为自己的值，在 `config.yaml` 的 `database.dsn` 中设置连接。也可以使用 `MYSQL_DSN` 环境变量覆盖：

```powershell
$env:MYSQL_DSN = 'blog_user:change_me@tcp(127.0.0.1:3306)/myblog?charset=utf8mb4&parseTime=True&loc=Local'
```

应用启动时通过 GORM 自动建表，并在空数据库中写入演示资料；请使用独立开发数据库。

### 3. 配置 JWT 并启动后端

设置自己的随机 JWT 密钥。以下命令为当前 PowerShell 会话生成一个密钥：

```powershell
$env:JWT_SECRET = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
go run .
```

如需重启后继续使用相同密钥，可将其保存在本地环境配置或被忽略的 `config.yaml` 的 `app.jwt_secret` 中。密钥变化后，旧登录令牌会失效。

配置读取顺序：

| 项目 | 优先使用 | 备用配置 |
| --- | --- | --- |
| JWT 签名密钥 | `JWT_SECRET` | `app.jwt_secret` |
| MySQL 连接串 | `MYSQL_DSN` | `database.dsn` |
| HTTP 端口 | `config.yaml` 的 `app.port` | 示例值为 8080 |
| 日志 | `config.yaml` 的 `log` | 示例输出到控制台与 `./logs` |

后端需要从 `blog-management/` 目录启动，默认监听 `http://localhost:8080`。

空库默认创建演示账号 `admin`，开发密码为 `123456`。首次使用后请修改密码；管理员初始化与示例内容可参考 `database/db.go` 和 `database/seed/admin.go`。

### 4. 启动前端

另开终端，从仓库根目录执行：

```powershell
cd blog-management/frontend
npm ci
npm run dev
```

打开 `http://localhost:6688`。当前前端组件直接请求 `http://localhost:8080` 的接口，例如 `/user/login`、`/post/list`、`/user/profile/public`；后端并没有统一的 `/api` 前缀。

若修改后端地址，需同步调整前端组件中的 `API_BASE_URL`。Vite 配置中的 `/api` 代理并不覆盖这些直接请求。

## 构建与验证

在 `blog-management/` 中：

```powershell
go test ./...
go build -o bin/myblog.exe .
```

在 `blog-management/frontend/` 中：

```powershell
npm run build
npm run preview
```

前端构建输出到 `dist/`。构建产物需由静态服务器托管，后端继续独立提供接口与 `/uploads` 文件访问；部署时应同时调整接口地址与跨域配置。

## 配置与数据说明

- `config.example.yaml` 仅提供字段示例；实际 `config.yaml` 和环境变量文件不提交。
- JWT 密钥与数据库连接通过本地配置或环境变量提供，源码不保存实际连接密码或签名密钥。
- `uploads/` 中的图片与音频、数据库数据、日志、可执行文件、IDE 配置、前端依赖和构建产物不随源码发布。
- 对外部署前请修改演示账号密码、替换示例配置，并检查上传、跨域、接口权限和 HTTPS 配置。当前版本主要面向本地开发与个人项目迭代。
