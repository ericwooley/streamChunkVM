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

var client = new _webtorrentHybrid2['default']();
function getStats(torrent) {
  var progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0;
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress: progress,
    downloadSpeed: (0, _prettyBytes2['default'])(client.downloadSpeed()),
    uploadSpeed: (0, _prettyBytes2['default'])(client.uploadSpeed())

  };
}
var fileGlob = 'streams/*.mp4';
// contains list of all streams being seeded
var torrentList = [];
function addTorrent(file) {
  console.log('adding', file);
  client.seed(file, function (torrent) {
    torrentList.push(torrent.infoHash);
    console.log('\n====================================================================================\n      seeding torrent\', ' + torrent.infoHash + '\n      streamList ' + encodeURI(JSON.stringify(torrentList)) + '\n    ');
  });
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
      'default': 'yes'
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
    process.stdout.write('\r' + stats.peers + ' peers | \\/ ' + stats.downloadSpeed + ' | /\\ ' + stats.uploadSpeed + ' uploadSpeed |');
  }, 1000);
  beginWatchingStream();
});
