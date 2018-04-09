const {app , BrowserWindow, globalShortcut} = require('electron');
const url = require('url');

let win = null

function boot() {
    win = new BrowserWindow({
        width: 700,
        height: 500,
        frame: false
    })
    win.loadURL(`file://${__dirname}/index.html`)

    win.on('closed', () =>{
        win = null
    })

    globalShortcut.register('Alt+Q', () => {
        console.log('key pressed!')
        win.close()
    });
}

app.on('ready', boot);