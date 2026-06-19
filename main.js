const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: '小说写作助手',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false,
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 窗口准备好再显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 菜单模板
const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建小说',
        accelerator: 'Ctrl+N',
        click: () => {
          mainWindow.webContents.send('menu-new');
        }
      },
      {
        label: '打开TXT',
        accelerator: 'Ctrl+O',
        click: async () => {
          const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: '文本文件', extensions: ['txt'] }]
          });
          if (!result.canceled && result.filePaths.length > 0) {
            const content = fs.readFileSync(result.filePaths[0], 'utf-8');
            mainWindow.webContents.send('menu-open', {
              path: result.filePaths[0],
              content: content,
              name: path.basename(result.filePaths[0], '.txt')
            });
          }
        }
      },
      { type: 'separator' },
      {
        label: '保存',
        accelerator: 'Ctrl+S',
        click: () => {
          mainWindow.webContents.send('menu-save');
        }
      },
      {
        label: '另存为...',
        accelerator: 'Ctrl+Shift+S',
        click: () => {
          mainWindow.webContents.send('menu-save-as');
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'Alt+F4',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { label: '撤销', accelerator: 'Ctrl+Z', role: 'undo' },
      { label: '重做', accelerator: 'Ctrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: '剪切', accelerator: 'Ctrl+X', role: 'cut' },
      { label: '复制', accelerator: 'Ctrl+C', role: 'copy' },
      { label: '粘贴', accelerator: 'Ctrl+V', role: 'paste' },
      { label: '全选', accelerator: 'Ctrl+A', role: 'selectAll' }
    ]
  },
  {
    label: '章节',
    submenu: [
      {
        label: '新建章节',
        accelerator: 'Ctrl+Shift+N',
        click: () => {
          mainWindow.webContents.send('menu-add-chapter');
        }
      },
      {
        label: '删除当前章节',
        accelerator: 'Ctrl+Shift+D',
        click: () => {
          mainWindow.webContents.send('menu-delete-chapter');
        }
      },
      {
        label: '上一章',
        accelerator: 'Ctrl+PageUp',
        click: () => {
          mainWindow.webContents.send('menu-prev-chapter');
        }
      },
      {
        label: '下一章',
        accelerator: 'Ctrl+PageDown',
        click: () => {
          mainWindow.webContents.send('menu-next-chapter');
        }
      }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '全屏',
        accelerator: 'F11',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      },
      {
        label: '开发者工具',
        accelerator: 'F12',
        click: () => {
          mainWindow.webContents.toggleDevTools();
        }
      }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '关于',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于',
            message: '小说写作助手 v1.0.0',
            detail: '一个简洁高效的小说写作工具\n支持章节管理、自动保存、导出TXT等功能'
          });
        }
      }
    ]
  }
];

// IPC 通信
ipcMain.on('save-file', async (event, data) => {
  const { filePath, content, defaultName } = data;

  let savePath = filePath;
  if (!savePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName || '未命名小说.txt',
      filters: [{ name: '文本文件', extensions: ['txt'] }]
    });
    if (result.canceled) {
      event.reply('save-result', { success: false });
      return;
    }
    savePath = result.filePath;
  }

  try {
    fs.writeFileSync(savePath, content, 'utf-8');
    event.reply('save-result', { success: true, path: savePath });
  } catch (err) {
    event.reply('save-result', { success: false, error: err.message });
  }
});

ipcMain.on('get-app-data-path', (event) => {
  const dataPath = path.join(app.getPath('userData'), 'novels');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
  event.returnValue = dataPath;
});

ipcMain.on('write-file', (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    event.returnValue = { success: true };
  } catch (err) {
    event.returnValue = { success: false, error: err.message };
  }
});

ipcMain.on('read-file', (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    event.returnValue = { success: true, content };
  } catch (err) {
    event.returnValue = { success: false, error: err.message };
  }
});

ipcMain.on('file-exists', (event, filePath) => {
  event.returnValue = fs.existsSync(filePath);
});

app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
