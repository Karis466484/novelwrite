# 📚 小说写作助手 - 桌面版

一个基于 Electron 的小说写作桌面应用，支持章节管理、自动保存、导出 TXT 等功能。

## 功能特性

- ✅ **新建/打开 TXT 文件** - 支持拖拽打开
- ✅ **章节管理** - 新建、删除、排序章节
- ✅ **自动保存** - 每3秒自动备份到本地
- ✅ **字数统计** - 本章字数 + 总字数实时显示
- ✅ **快捷键支持** - Ctrl+S 保存、Ctrl+N 新建等
- ✅ **菜单栏操作** - 完整的文件/编辑/章节菜单
- ✅ **深色主题** - 护眼写作界面

## 安装运行

### 方式一：直接运行（需要 Node.js）

```bash
# 1. 进入项目目录
cd NovelWriter

# 2. 安装依赖
npm install

# 3. 启动应用
npm start
```

### 方式二：打包成安装包

```bash
# Windows 安装包
npm run build-win

# Mac 安装包
npm run build-mac

# Linux 安装包
npm run build-linux
```

打包后的文件在 `dist` 目录中。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建小说 |
| Ctrl+O | 打开 TXT |
| Ctrl+S | 保存 |
| Ctrl+Shift+S | 另存为 |
| Ctrl+Shift+N | 新建章节 |
| Ctrl+Shift+D | 删除当前章节 |
| Ctrl+PageUp | 上一章 |
| Ctrl+PageDown | 下一章 |
| F11 | 全屏 |
| Tab | 插入4空格缩进 |

## 数据存储

自动备份保存在系统应用数据目录：
- Windows: `%APPDATA%/novel-writer/novels/backup.json`
- Mac: `~/Library/Application Support/novel-writer/novels/backup.json`
- Linux: `~/.config/novel-writer/novels/backup.json`
