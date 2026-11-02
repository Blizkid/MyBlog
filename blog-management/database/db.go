package database

import (
	"blog-management/config"
	"blog-management/database/model"
	"blog-management/logger"
	"os"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDb() {
	dsn := os.Getenv("MYSQL_DSN")
	if dsn == "" {
		dsn = config.Cfg.Database.DSN
	}
	if dsn == "" {
		panic("请设置 MYSQL_DSN 环境变量或 config.yaml 中的 database.dsn")
	}
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	err = DB.AutoMigrate(
		&model.User{},
		&model.Post{},
		&model.SavedBlog{},
		&model.Comment{},
		&model.FavoriteGame{},
		&model.DevelopedGame{},
		&model.Moment{},
		&model.VisitedCity{},
		&model.MomentComment{},
		&model.Movie{},
		&model.Music{},
		&model.Book{},
		&model.LifeTimeAllocation{},
		&model.WordCloudTag{},
		&model.WorkExperience{},
		&model.PersonalProject{},
		&model.RecommendedRepo{},
		&model.PageView{},
	)
	if err != nil {
		logger.Logger.Error("failed to migrate", zap.Error(err))
		return
	}

	initSeedData()
}

func initSeedData() {
	var userCount int64
	DB.Model(&model.User{}).Count(&userCount)
	if userCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
		user := model.User{
			Username:    "admin",
			Password:    string(hashedPassword),
			Email:       "admin@example.com",
			ChineseName: "管理员",
			EnglishName: "Admin",
			Bio:         "热爱技术，热爱分享",
		}
		DB.Create(&user)
		logger.Logger.Info("Created default user: admin / 123456")

		var postCount int64
		DB.Model(&model.Post{}).Count(&postCount)
		if postCount == 0 {
			post1Content := `## Go语言并发模型概述

Go语言提供了独特的并发编程模型，基于CSP（Communicating Sequential Processes）理论。与传统的共享内存并发模型不同，Go倡导"不要通过共享内存来通信，而通过通信来共享内存"。

### Goroutine

Goroutine是Go中最基本的并发单元。它比线程更轻量级，栈大小可以动态增长和收缩。

启动一个Goroutine很简单：在函数调用前加上go关键字。

### Channel

Channel是Goroutine之间通信的主要方式。它可以是带缓冲的或不带缓冲的。

可以使用make创建channel：ch := make(chan int, 10)

发送数据：ch <- 42
接收数据：value := <-ch

### 同步原语

除了Channel，Go还提供了传统的同步原语：
- sync.Mutex - 互斥锁
- sync.RWMutex - 读写锁
- sync.WaitGroup - 等待组
- sync.Once - 一次性执行
- sync.Cond - 条件变量

### 最佳实践

1. 优先使用Channel进行通信
2. 对于简单的状态保护，使用Mutex
3. 使用context进行取消和超时控制
4. 避免在goroutine中使用全局变量`

			post2Content := `## 什么是智能合约？

智能合约是运行在区块链上的自动执行代码。它们定义了规则和逻辑，当满足特定条件时自动执行。

### Solidity语言基础

Solidity是以太坊上最流行的智能合约编程语言。

一个简单的存储合约示例：
- 定义一个私有变量存储数值
- store函数用于存储新值
- retrieve函数用于读取当前值

### 合约部署

使用Hardhat或Foundry等工具可以轻松部署智能合约。

编写部署脚本，然后运行部署命令即可。

### 与前端交互

使用ethers.js或web3.js可以与部署的合约进行交互。

调用只读方法：直接调用合约函数
调用修改状态的方法：需要签名和发送交易

### 安全考虑

智能合约安全至关重要：
- 重入攻击
- 整数溢出
- 访问控制
- 前端运行攻击`

			post3Content := `## React Hooks简介

React Hooks是React 16.8引入的特性，允许在函数组件中使用状态和其他React特性。

### useState

useState是最基本的Hook，用于管理组件状态。

可以存储简单值如数字、字符串，也可以存储对象。

### useEffect

useEffect用于处理副作用，如数据获取、订阅等。

依赖数组控制effect的执行时机：
- 空数组：只在挂载时执行一次
- 包含依赖：依赖变化时执行
- 无数组：每次渲染都执行

### useContext

useContext用于消费Context，避免props drilling。

创建Context后，在子组件中使用useContext获取值。

### useReducer

useReducer用于管理复杂状态逻辑。

类似于Redux的reducer模式：
- 定义初始状态
- 定义reducer函数处理不同action
- 组件中使用dispatch发送action

### 自定义Hooks

可以创建自定义Hooks来复用逻辑。

例如创建useLocalStorage Hook来管理本地存储数据：
- 读取localStorage中的值
- 提供setValue方法更新值
- 自动同步到localStorage

### Hooks规则

1. 只在顶层调用Hooks
2. 只在React函数中调用Hooks
3. 使用ESLint插件强制规则`

			posts := []model.Post{
				{
					Title:    "深入理解Go语言的并发模型",
					Excerpt:  "本文深入探讨了Go语言的并发模型，包括Goroutine、Channel、以及同步原语的使用场景和最佳实践。",
					Content:  post1Content,
					Tags:     "Go,并发,Channel,Goroutine",
					Category: "Backend",
					Featured: true,
					Views:    1256,
					UserID:   1,
				},
				{
					Title:    "Web3开发入门：智能合约基础",
					Excerpt:  "从零开始学习以太坊智能合约开发，包括Solidity语言基础、合约部署、以及与前端交互的方法。",
					Content:  post2Content,
					Tags:     "Web3,Blockchain,Solidity,智能合约",
					Category: "Blockchain",
					Featured: true,
					Views:    892,
					UserID:   1,
				},
				{
					Title:    "React Hooks最佳实践指南",
					Excerpt:  "全面介绍React Hooks的使用方法和最佳实践，包括useState、useEffect、useContext、useReducer等核心Hook。",
					Content:  post3Content,
					Tags:     "React,Hooks,Frontend,JavaScript",
					Category: "Frontend",
					Featured: false,
					Views:    643,
					UserID:   1,
				},
			}
			DB.Create(&posts)
			logger.Logger.Info("Created sample blog posts")

			comments := []model.Comment{
				{
					Content: "写得太好了！对理解Go并发很有帮助",
					PostID:  1,
					UserID:  1,
				},
				{
					Content: "能否出一篇关于context的详细文章？",
					PostID:  1,
					UserID:  1,
				},
				{
					Content: "Solidity的例子很实用，建议加上安全注意事项",
					PostID:  2,
					UserID:  1,
				},
			}
			DB.Create(&comments)
			logger.Logger.Info("Created sample comments")

			var workExperienceCount int64
			DB.Model(&model.WorkExperience{}).Count(&workExperienceCount)
			if workExperienceCount == 0 {
				workExperiences := []model.WorkExperience{
					{
						Company:      "某科技公司",
						Role:         "区块链开发工程师",
						Period:       "2022 - 至今",
						Description:  "负责智能合约开发、跨链桥设计与实现，参与多个DeFi项目的架构设计与安全审计。",
						TechStack:    "Solidity,Golang,Ethereum,Cosmos SDK,Web3.js",
						Achievements: "主导开发了跨链桥协议，支持5条公链资产互通|优化智能合约gas费用，降低约30%|参与安全审计，发现并修复多个关键漏洞",
						UserID:       1,
					},
					{
						Company:      "某互联网公司",
						Role:         "后端开发工程师",
						Period:       "2020 - 2022",
						Description:  "负责微服务架构设计与开发，参与高并发系统的优化，使用Go语言构建高性能后端服务。",
						TechStack:    "Golang,Kubernetes,gRPC,Redis,MySQL",
						Achievements: "设计并实现了分布式任务调度系统|优化API响应时间，从500ms降至150ms|搭建CI/CD流水线，提升团队开发效率",
						UserID:       1,
					},
					{
						Company:      "某创业公司",
						Role:         "全栈开发工程师",
						Period:       "2019 - 2020",
						Description:  "从0到1构建产品，负责前端、后端及数据库设计，快速迭代并交付产品。",
						TechStack:    "React,Node.js,TypeScript,PostgreSQL,AWS",
						Achievements: "独立完成MVP开发，3个月内上线|实现实时通讯功能，支持万级并发|搭建监控告警系统，保障服务稳定性",
						UserID:       1,
					},
				}
				DB.Create(&workExperiences)
				logger.Logger.Info("Created sample work experiences")
			}

			var personalProjectCount int64
			DB.Model(&model.PersonalProject{}).Count(&personalProjectCount)
			if personalProjectCount == 0 {
				personalProjects := []model.PersonalProject{
					{
						Name:        "跨链资产桥协议",
						Description: "一个基于Cosmos IBC的跨链资产桥，支持Ethereum、BSC、Polygon等多条公链的资产跨链转移。采用多签验证机制，确保资产安全。",
						TechStack:   "Solidity,Golang,Cosmos SDK,Relayer",
						Github:      "https://github.com/sample/cross-chain-bridge",
						Demo:        "https://bridge.demo.com",
						Status:      "已完成",
						Stars:       128,
						Commits:     342,
						Tags:        "DeFi,Cross-Chain,Cosmos",
						UserID:      1,
					},
					{
						Name:        "智能合约安全审计工具",
						Description: "一个自动化的智能合约安全审计工具，集成多种静态分析引擎，可检测重入攻击、整数溢出等常见漏洞。支持Solidity和Vyper。",
						TechStack:   "Python,Solidity,Slither,Mythril",
						Github:      "https://github.com/sample/security-audit",
						Status:      "开发中",
						Stars:       89,
						Commits:     156,
						Tags:        "Security,Audit,Web3",
						UserID:      1,
					},
					{
						Name:        "去中心化交易所(DEX)",
						Description: "一个基于Uniswap V2协议的去中心化交易所，支持代币交换、流动性挖矿、闪兑等功能。前端使用React构建，后端使用The Graph索引数据。",
						TechStack:   "Solidity,React,ethers.js,The Graph,Hardhat",
						Github:      "https://github.com/sample/dex-protocol",
						Demo:        "https://dex.demo.com",
						Status:      "已完成",
						Stars:       256,
						Commits:     512,
						Tags:        "DEX,AMM,DeFi",
						UserID:      1,
					},
					{
						Name:        "AI智能体框架",
						Description: "一个用于构建自主AI智能体的框架，支持多智能体协作、工具调用、记忆管理等功能。可用于构建自动化工作流和智能应用。",
						TechStack:   "Python,LangChain,FastAPI,PostgreSQL",
						Github:      "https://github.com/sample/ai-agent-framework",
						Status:      "开发中",
						Stars:       67,
						Commits:     89,
						Tags:        "AI,Agent,Autonomous",
						UserID:      1,
					},
				}
				DB.Create(&personalProjects)
				logger.Logger.Info("Created sample personal projects")
			}

			var recommendedRepoCount int64
			DB.Model(&model.RecommendedRepo{}).Count(&recommendedRepoCount)
			if recommendedRepoCount == 0 {
				recommendedRepos := []model.RecommendedRepo{
					{
						Name:        "go-ethereum",
						Author:      "ethereum",
						Description: "Ethereum协议的官方Go语言实现，是Ethereum生态系统的核心基础设施。",
						Github:      "https://github.com/ethereum/go-ethereum",
						Stars:       45600,
						Language:    "Go",
						Tags:        "Ethereum,Blockchain,Go",
						UserID:      1,
					},
					{
						Name:        "foundry",
						Author:      "foundry-rs",
						Description: "一个用于Solidity开发的极其快速、便携式和模块化的工具包，包含forge、cast、anvil等工具。",
						Github:      "https://github.com/foundry-rs/foundry",
						Stars:       8900,
						Language:    "Rust",
						Tags:        "Solidity,Testing,DevTools",
						UserID:      1,
					},
					{
						Name:        "openzeppelin-contracts",
						Author:      "OpenZeppelin",
						Description: "用于安全智能合约开发的标准库，包含经过审计的ERC20、ERC721、ERC1155等标准实现。",
						Github:      "https://github.com/OpenZeppelin/openzeppelin-contracts",
						Stars:       23400,
						Language:    "Solidity",
						Tags:        "Solidity,Security,Standards",
						UserID:      1,
					},
					{
						Name:        "cosmos-sdk",
						Author:      "cosmos",
						Description: "用于构建特定应用区块链的框架，采用模块化设计，支持自定义共识、治理、质押等模块。",
						Github:      "https://github.com/cosmos/cosmos-sdk",
						Stars:       6200,
						Language:    "Go",
						Tags:        "Cosmos,SDK,Cross-Chain",
						UserID:      1,
					},
					{
						Name:        "langchain",
						Author:      "langchain-ai",
						Description: "构建由大型语言模型(LLM)驱动的应用程序的框架，支持链式调用、工具集成、记忆管理等。",
						Github:      "https://github.com/langchain-ai/langchain",
						Stars:       78900,
						Language:    "Python",
						Tags:        "AI,LLM,Framework",
						UserID:      1,
					},
					{
						Name:        "uniswap-v3-core",
						Author:      "Uniswap",
						Description: "Uniswap V3的核心合约实现，引入了集中流动性、多费率等级等创新特性。",
						Github:      "https://github.com/Uniswap/v3-core",
						Stars:       5600,
						Language:    "Solidity",
						Tags:        "DEX,AMM,DeFi",
						UserID:      1,
					},
				}
				DB.Create(&recommendedRepos)
				logger.Logger.Info("Created sample recommended repos")
			}
		}
	}
}
