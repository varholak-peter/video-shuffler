// @ts-check

const fs = require('fs')
const path = require('path')
const { CEC, CECMonitor } = require('@senzil/cec-monitor')
const { VLC } = require('node-vlc-http')

// const host = process.env.HOST
// const mediaFolder = process.env.MEDIA_FOLDER
// const password = process.env.PASS
// const port = parseInt(process.env.PORT, 10)

// const MEDIA_DIR = path.join(__dirname, mediaFolder)

// const vlc = new VLC({
//   host,
//   password,
//   port,
//   username: ''
// })

// fs.readdirSync(MEDIA_DIR).forEach(file => {
//   const media = `${MEDIA_DIR}/${file}`
//   console.log('Adding media to playlist:', media)
//   vlc.addToQueue(media)
// })

// vlc.playlistNext()

const monitor = new CECMonitor('custom-osdname', {})

monitor.WaitForReady().then(() => console.log('rdy'))

// process.on( 'SIGINT', function() {
//   vlc.stop();
//   process.exit();
// });
