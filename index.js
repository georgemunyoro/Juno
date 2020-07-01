const { app, BrowserWindow } = require('electron')
const { dialog } = require('electron')
const { ipcMain } = require('electron')


function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

ipcMain.on('openFolder', (event, path) => {
  const { dialog } = require('electron')

  dialog.showOpenDialog(win, {
	properties: ['openDirectory']
  },
	paths => respondWithPaths(paths)
  )

  function respondWithPaths(paths) {
	event.sender.send('openFolder', paths)
  }
})

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

