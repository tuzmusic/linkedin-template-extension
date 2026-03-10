const chokidar = require('chokidar');
const http = require('http');

const filesToWatch = [
  'manifest.json',
  'background.js',
  'content.js',
  'content.css',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js'
];

console.log('🔍 Watching for file changes...');
console.log('Make sure your extension is loaded in Chrome at chrome://extensions/');
console.log('');

let shouldReload = false;

// Create a simple HTTP server for the extension to poll
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/dev-reload-check' && req.method === 'GET') {
    if (shouldReload) {
      shouldReload = false;
      res.writeHead(200);
      res.end(JSON.stringify({ shouldReload: true }));
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({ shouldReload: false }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8765, () => {
  console.log('✓ Dev server listening on http://localhost:8765');
  console.log('');
});

const watcher = chokidar.watch(filesToWatch, {
  ignored: /node_modules|\.git/,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

watcher.on('change', (path) => {
  console.log(`📝 File changed: ${path}`);
  shouldReload = true;
  console.log('✅ Reload signal sent at', new Date().toLocaleTimeString());
});

watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  watcher.close();
  server.close();
  process.exit();
});
