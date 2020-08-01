const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron')

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 500,
        minWidth: 650,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })

    // and load the index.html of the app.
    win.loadFile('index.html')
    win.once('ready-to-show', () => {
        win.show()
    })

    // Open the DevTools.
    // win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.handle('get-path', (event, arg) => {
    return app.getPath(arg)
})
ipcMain.on('upload-dialog', (event, arg) => {
    dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
        title: 'Select a File to Upload',
        buttonLabel: 'Upload',
        properties: ['openFile']
    }).then(result => {
        //console.log(result)
        if (!result.canceled) {
            event.reply('upload-dialog-closed', result.filePaths[0])
        }
    }).catch(err => {
        console.log(err)
    })
})
/*
ipcMain.on('download-dialog', (event, arg) => {
    dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
        title: 'Select Save Location',
        buttonLabel: 'Save',
        properties: ['openDirectory', 'createDirectory']
    }).then(result => {
        //console.log(result)
        if (!result.canceled) {
            event.reply('download-dialog-closed', result.filePaths[0])
        }
    }).catch(err => {
        console.log(err)
    })
})
*/