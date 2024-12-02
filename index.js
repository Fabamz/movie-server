const http = require("http");
const path = require("path");
const fs = require("fs");

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
};

const server = http.createServer((req, res) => {
    console.log(`Request URL: ${req.url}`);

    // Handle root path (serve index.html)
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    }
    // Serve API
    else if (req.url === '/api') {
        
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        fs.readFile(path.join(__dirname, 'public', 'db.json'), 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        });
    }
    // Serve static files (CSS, images)
    else {
        const filePath = path.join(__dirname, 'public', req.url);
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - Page Not Found</h1>');
                } else {
                    // Server error
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>500 - Internal Server Error</h1>');
                }
                return;
            }
            // Serve the file with the correct content type
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    }
});

const PORT = process.env.PORT || 5959;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));