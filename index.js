// @ts-check

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { CEC, CECMonitor } = require("@senzil/cec-monitor");
const { VLC } = require("node-vlc-http");

const host = process.env.HOST;
const mediaFolder = process.env.MEDIA_FOLDER;
const password = process.env.PASS;
const port = parseInt(process.env.PORT, 10);

const MEDIA_DIR = path.join(__dirname, mediaFolder);

const sleep = millis => new Promise(resolve => setTimeout(resolve, millis));

const vlc = new VLC({
  host,
  password,
  port,
  tickLengthMs: 1000,
  username: ""
});

const monitor = new CECMonitor("custom-osdname", {});

let currentTime = 0;
let isStarted = false;
let numberCode = "";
let numberCodeTimeout = null;

const updateStatus = status => {
  currentTime = status.time;
};

const mediaMap = new Map();

/**
 * @param {string} name string that starts with 00x00 format
 * @returns 4 character id
 */
const getMediaKey = name => `${name[0]}${name[1]}${name[3]}${name[4]}`;

fs.readdirSync(MEDIA_DIR).forEach(file => {
  const media = `${MEDIA_DIR}/${file}`;
  console.log("Adding media to playlist:", media);
  vlc.addToQueue(media);
  mediaMap.set(getMediaKey(file), media);
});

const turnOff = () => {
  vlc.stop();
  monitor.Stop();
  exec("shutdown now");
};

monitor.WaitForReady().then(() => {
  monitor.WriteRawMessage(`on ${CEC.LogicalAddress.TV}`);
  monitor.WriteRawMessage("as");
  monitor.WriteMessage(
    CEC.LogicalAddress.BROADCAST,
    CEC.LogicalAddress.TV,
    CEC.Opcode.GIVE_DEVICE_POWER_STATUS
  );
});

monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS, async ({ data, source }) => {
  if (isStarted || source !== CEC.LogicalAddress.TV) {
    return;
  }

  if (data.str === "ON") {
    isStarted = true;
    vlc.playlistNext();
  }

  if (data.str === "IN_TRANSITION_STANDBY_TO_ON") {
    isStarted = true;
    await sleep(8000);
    vlc.playlistNext();
  }
});

monitor.on(CECMonitor.EVENTS.USER_CONTROL_PRESSED, async ({ data }) => {
  let status = null;

  if (data.str === "RIGHT" || data.str === "FAST_FORWARD") {
    console.log("FF");
    status = await vlc.seek(currentTime + 10);
    updateStatus(status);
  } else if (data.str === "LEFT" || data.str === "REWIND") {
    console.log("RW");
    status = await vlc.seek(currentTime - 10);
    updateStatus(status);
  } else if (
    data.str === "SELECT" ||
    data.str === "PLAY" ||
    data.str === "PAUSE"
  ) {
    console.log("Play/PAUSE");
    status = await vlc.pause();
    updateStatus(status);
  } else if (data.str === "CHANNEL_UP" || data.str === "UP") {
    console.log("playlist next");
    status = await vlc.playlistNext();
  } else if (data.str === "CHANNEL_DOWN" || data.str === "DOWN") {
    console.log("playlist previous");
    status = await vlc.playlistPrevious();
  } else if (data.str.startsWith("NUMBER")) {
    clearTimeout(numberCodeTimeout);
    numberCode += data.str[6];

    if (numberCode.length < 4) {
      numberCodeTimeout = setTimeout(() => {
        numberCode = "";
      }, 3000);
      return;
    }

    if (numberCode === "9999") {
      console.log("toggleRandom");
      status = await vlc.toggleRandom();
    } else if (numberCode === "0000") {
      turnOff();
    } else if (mediaMap.has(numberCode)) {
      console.log("play:", mediaMap.get(numberCode));
      status = await vlc.addToQueueAndPlay(mediaMap.get(numberCode));
    }

    numberCode = "";
  }

  if (status) {
    updateStatus(status);
  }
});

vlc.on("update", updateStatus);

process.on("SIGINT", function() {
  vlc.stop();
  process.exit();
});
