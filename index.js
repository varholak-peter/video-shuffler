// @ts-check

var { CecMonitor, Commander, LogicalAddress, OperationCode, PowerStatus, Remote } = require('hdmi-cec')
const { VLC } = require('node-vlc-http')

const host = process.env.HOST
const password = process.env.PASS
const port = parseInt(process.env.PORT, 10)

const vlc = new VLC({
  host,
  password,
  port,
  username: ''
})

const commander = new Commander(new CecMonitor())
const remote = new Remote()

vlc.addToQueue('/Users/varhope/Downloads/03x01 - Sileny Homer.mp4')
vlc.addToQueue('/Users/varhope/Downloads/03x02 - Liza na stope zloradu.mp4')

vlc.playlistNext()

remote.on('keypress', evt => {
  console.log(`user pressed the key "${evt.key}" with code "${evt.keyCode}"`)
})

commander.setPowerState(PowerStatus.ON)
commander.monitor.executeOperation(LogicalAddress.TV, OperationCode.REQUEST_ACTIVE_SOURCE)
