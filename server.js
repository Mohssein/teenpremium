const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

http.createServer(function (request, response) {
    console.log('request ', request.url);

    // Parse URL to ignore query string
    const parsedUrl = url.parse(request.url);
    let pathname = parsedUrl.pathname;
    
    // Prevent directory traversal and normalize path
    // decodeURIComponent handles spaces/special chars in URL
    const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
    
    let filePath = path.join('.', safePath);

    fs.stat(filePath, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                // Try to serve 404.html
                fs.readFile('./404.html', function(err404, content404) {
                    if (err404) {
                        response.writeHead(404, { 'Content-Type': 'text/plain' });
                        response.end('404 Not Found: ' + filePath, 'utf-8');
                    } else {
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.end(content404, 'utf-8');
                    }
                });
            } else {
                response.writeHead(500);
                response.end('Server Error: ' + err.code);
            }
            return;
        }

        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, function(error, content) {
            if (error) {
                 if (error.code === 'ENOENT') {
                    // Directory existed but index.html didn't
                     response.writeHead(404, { 'Content-Type': 'text/plain' });
                     response.end('404 Not Found: index.html missing', 'utf-8');
                 } else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                 }
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    });

}).listen(port);

console.log(`Server running at http://localhost:${port}/`);
