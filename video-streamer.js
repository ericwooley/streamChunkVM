import chokidar from 'chokidar'
import prompt from 'prompt'
import glob from 'glob'
import fs from 'fs'
import WebTorrent from 'webtorrent-hybrid'
import prettyBytes from 'pretty-bytes'
import moment from 'moment'


const client = new WebTorrent()
function warn (dots = ''){
  process.stdout.write('\rKilling active torrents' + dots)
}
process.on('SIGINT', () => {
  console.log('shutting down (possible memory leak, because client.destroy never returns, try `killall node`)')
  process.exit()
  //()=>setTimeout(process.exit, 1000)
  // console.log('\n')
  // let dots = ''
  // warn(dots)
  // setInterval(() => {
  //   warn(dots)
  //   dots = dots + '.'
  // }, 200)
  // client.destroy(()=> {
  //   console.log('Shut Down Complete')
  //   /* eslint-disable */
  //   process.exit(0)
  //   /* eslint-enable */
  // })
})
function getStats(torrent) {
  const progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress,
    downloadSpeed: prettyBytes(client.downloadSpeed()),
    uploadSpeed: prettyBytes(client.uploadSpeed())

  }
}
const fileGlob = 'streams/*.processed.mp4'
// contains list of all streams being seeded
const torrentList = []
function addTorrent(file) {
  setTimeout(() =>{
    client.seed(file, (torrent) => {
      torrentList.push(torrent.infoHash)
      console.log(`
    ====================================================================================
          seeding torrent', ${torrent.infoHash}
          streamList ${encodeURI(JSON.stringify(torrentList))}
        `)
    })
  }, 10000)
}
function warn (dots) {
  console.warn('\rKilling active torrents' + dots)
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
      default: 'no'
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
    if(torrentList.length) {
      process.stdout.write('\r' + moment().format('HH:mm:ss a') + ` | ${torrentList.length} torrents | ${stats.peers} peers | ↓ ${stats.downloadSpeed} | ↑ ${stats.uploadSpeed} uploadSpeed |`)
    }
  }, 100 )
  beginWatchingStream()
})





