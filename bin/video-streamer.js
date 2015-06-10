'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _webtorrentHybrid = require('webtorrent-hybrid');

var _webtorrentHybrid2 = _interopRequireDefault(_webtorrentHybrid);

var _prettyBytes = require('pretty-bytes');

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var client = new _webtorrentHybrid2['default']();
function warn() {
  var dots = arguments[0] === undefined ? '' : arguments[0];

  process.stdout.write('\rKilling active torrents' + dots);
}
process.on('SIGINT', function () {
  console.log('shutting down (possible memory leak, because client.destroy never returns, try `killall node`)');
  process.exit();
});
function getStats(torrent) {
  var progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0;
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress: progress,
    downloadSpeed: (0, _prettyBytes2['default'])(client.downloadSpeed()),
    uploadSpeed: (0, _prettyBytes2['default'])(client.uploadSpeed())

  };
}
var fileGlob = 'streams/*.processed.mp4';
// contains list of all streams being seeded
var torrentList = [];
function addTorrent(file) {
  setTimeout(function () {
    client.seed(file, function (torrent) {
      torrentList.push(torrent.infoHash);
      console.log('\n    ====================================================================================\n          seeding torrent\', ' + torrent.infoHash + '\n          streamList ' + encodeURI(JSON.stringify(torrentList)) + '\n        ');
    });
  }, 10000);
}
function warn(dots) {
  console.warn('\rKilling active torrents' + dots);
}

function beginWatchingStream() {
  console.log('Waiting for stream files');
  var watcher = _chokidar2['default'].watch(fileGlob);
  watcher.on('add', addTorrent);
}
var question = {
  properties: {
    remove: {
      message: 'Remove old stream files?',
      'default': 'no'
    }
  }
};
_prompt2['default'].start();
_prompt2['default'].get(question, function (err, result) {
  if (err) {
    throw err;
  }
  if (result.remove.toLowerCase().indexOf('y') !== -1) {
    var files = _glob2['default'].sync(fileGlob);
    files.map(function (file) {
      return _fs2['default'].unlinkSync(file);
    });
    console.log('Deleted ' + files.length + ' files');
  }
  setInterval(function () {
    var stats = getStats();
    if (torrentList.length) {
      process.stdout.write('\r' + (0, _moment2['default'])().format('HH:mm:ss a') + (' | ' + torrentList.length + ' torrents | ' + stats.peers + ' peers | ↓ ' + stats.downloadSpeed + ' | ↑ ' + stats.uploadSpeed + ' uploadSpeed |'));
    }
  }, 100);
  beginWatchingStream();
});
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
