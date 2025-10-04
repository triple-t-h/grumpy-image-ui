import { handleDownloadState } from '@core/api'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const appIcon = nativeImage.createFromPath(icon)
  if (appIcon.isEmpty()) {
    console.warn('App icon failed to load:', icon)
  }
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {
      icon: appIcon
    }),
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // Disable sandbox to allow Node.js modules in preload
      nodeIntegration: false, // Keep this disabled for security
      nodeIntegrationInWorker: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // SECURITY: Add Content Security Policy
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self'; " +
            "img-src 'self' data: blob:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "object-src 'none'; " +
            "base-uri 'self';"
          ]
        }
      })
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // SECURITY: Validate URLs before opening externally to prevent malicious redirects
    try {
      const url = new URL(details.url)

      // Only allow HTTPS and specific trusted domains
      const trustedDomains = [
        'github.com',
        'docs.electronjs.org',
        'nodejs.org',
        'npmjs.com',
        'microsoft.com',
        'developer.mozilla.org'
      ]

      if (url.protocol === 'https:' && trustedDomains.includes(url.hostname)) {
        console.log('[SECURITY] Opening trusted URL:', details.url)
        shell.openExternal(details.url)
      } else {
        console.warn('[SECURITY] Blocked untrusted URL:', details.url)
      }
    } catch (error) {
      console.error('[SECURITY] Invalid URL blocked:', details.url, error)
    }

    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Ensure sharp resolves native .node from unpacked directory when packaged
  try {
    if (app.isPackaged) {
      const resPath = process.resourcesPath; // .../resources
      const unpackedPath = join(resPath, 'app.asar.unpacked', 'node_modules')
      const noAsarPath = join(resPath, 'app', 'node_modules')
      const chosenModulesPath = fs.existsSync(unpackedPath) ? unpackedPath : noAsarPath
      if (!fs.existsSync(chosenModulesPath)) {
        console.warn('[sharp] expected node_modules path not found:', chosenModulesPath)
      }
      process.env.NODE_PATH = process.env.NODE_PATH ? `${chosenModulesPath}${require('path').delimiter}${process.env.NODE_PATH}` : chosenModulesPath
      require('module').Module._initPaths()
      // Optional self-test with proper 1x1 PNG
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sharp = require('sharp');
        // 1x1 transparent PNG (same as worker test)
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
        const testBuffer = Buffer.from(pngBase64, 'base64')
        sharp(testBuffer).metadata().then(() => {
          console.log('[sharp] self-test OK (main process)');
        }).catch(e => console.warn('[sharp] self-test failed (main process):', e.message));
      } catch (err) {
        console.warn('[sharp] require failed in main process:', (err as Error).message);
      }
    }
  } catch (e) {
    console.warn('[sharp] environment setup error:', (e as Error).message);
  }
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.daniel-schidlowski.grumpy-image')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handle download state from renderer to preload to main and back to renderer
  handleDownloadState()

  // Optional headless worker self-test. Set RUN_SHARP_WORKER_TEST=1 before launching the app.
  if (process.env.RUN_SHARP_WORKER_TEST === '1') {
    (async () => {
      try {
        console.log('[self-test] Starting sharp worker self-test')
        // 1x1 transparent PNG buffer
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
        const baseBuffer = Buffer.from(pngBase64, 'base64')
        const origin = { aspectRatio: 1, imageFormat: 'png', filename: 'test', height: 1, width: 1, quality: 80 }
        const resize = { aspectRatio: 1, imageFormat: 'png', filename: 'test_resized', height: 2, width: 2, quality: 80 }
        const job = { originalImageBlob: baseBuffer, origin, dimensions: [resize] }

        const resPath = process.resourcesPath
        const candidates = [
          path.join(resPath, 'app.asar.unpacked', 'dist', 'main', 'resize-and-compress-worker.js'),
          path.join(resPath, 'app', 'dist', 'main', 'resize-and-compress-worker.js'),
          path.join(app.getAppPath(), 'dist', 'main', 'resize-and-compress-worker.js')
        ]
        let workerPath = candidates.find(c => fs.existsSync(c)) || candidates[0]
        console.log('[self-test] worker candidate chosen:', workerPath)
        const worker = new Worker(workerPath, { env: { ...process.env } })
        const timeout = setTimeout(() => {
          console.warn('[self-test] worker timeout exceeded')
          worker.terminate()
        }, 15000)
        worker.once('message', (msg: any) => {
          clearTimeout(timeout)
          if (msg.success) {
            console.log('[self-test] SUCCESS zipBuffer size:', msg.zipBuffer?.length)
          } else {
            console.error('[self-test] FAIL error:', msg.error)
          }
          worker.terminate()
        })
        worker.once('error', (err) => {
          clearTimeout(timeout)
          console.error('[self-test] worker error:', err)
          worker.terminate()
        })
        worker.postMessage(job)
      } catch (e) {
        console.error('[self-test] setup error', (e as Error).message)
      }
    })()
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (process.env.ENABLE_REMOTE_DEBUG === '1') {
    app.commandLine.appendSwitch('remote-debugging-port', '9222')
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.enableSandbox()