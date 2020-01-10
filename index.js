// @ts-check

const fs = require('fs')
const path = require('path')
const { CecMonitor, Commander, LogicalAddress, OperationCode, PowerStatus, Remote } = require('hdmi-cec')
const { VLC } = require('node-vlc-http')

const host = process.env.HOST
const mediaFolder = process.env.MEDIA_FOLDER
const password = process.env.PASS
const port = parseInt(process.env.PORT, 10)

const MEDIA_DIR = path.join(__dirname, mediaFolder)

const vlc = new VLC({
  host,
  password,
  port,
  username: ''
})

const commander = new Commander(new CecMonitor())
const remote = new Remote()

fs.readdirSync(MEDIA_DIR).forEach(file => {
  const media = `${MEDIA_DIR}/${file}`
  console.log('Adding media to playlist:', media)
  vlc.addToQueue(media)
})

vlc.playlistNext()

remote.on('keypress', evt => {
  console.log(`user pressed the key "${evt.key}" with code "${evt.keyCode}"`)
})

commander.setPowerState(PowerStatus.ON)
commander.monitor.executeOperation(LogicalAddress.TV, OperationCode.REQUEST_ACTIVE_SOURCE)
