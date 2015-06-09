import chokidar from 'chokidar'
import prompt from 'prompt'
import glob from 'glob'
import fs from 'fs'
import WebTorrent from 'webtorrent-hybrid'
import prettyBytes from 'pretty-bytes'

const client = new WebTorrent()
function getStats(torrent) {
  const progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress,
    downloadSpeed: prettyBytes(client.downloadSpeed()),
    uploadSpeed: prettyBytes(client.uploadSpeed())

  }
}
const fileGlob = 'streams/*.mp4'
// contains list of all streams being seeded
const torrentList = []
function addTorrent(file) {
  console.log('adding', file)
  client.seed(file, (torrent) => {
    torrentList.push(torrent.infoHash)
    console.log(`
====================================================================================
      seeding torrent', ${torrent.infoHash}
      streamList ${encodeURI(JSON.stringify(torrentList))}
    `)
  })
}
function beginWatchingStream() {
  console.log('Waiting for stream files')
  let watcher = chokidar.watch(fileGlob)
  watcher.on('add', addTorrent)
}
const question = {
  properties: {
    remove: {
      message: 'Remove old stream files?',
      default: 'yes'
    }
  }
}
prompt.start()
prompt.get(question, (err, result) => {
  if(err) {
    throw err
  }
  if(result.remove.toLowerCase().indexOf('y') !== -1){
    const files = glob.sync(fileGlob)
    files.map((file) => fs.unlinkSync(file))
    console.log(`Deleted ${ files.length } files`)
  }
  setInterval(() => {
    const stats = getStats()
    process.stdout.write(`\r${stats.peers} peers | \\/ ${stats.downloadSpeed} | /\\ ${stats.uploadSpeed} uploadSpeed |`)
  }, 1000 )
  beginWatchingStream()
})



