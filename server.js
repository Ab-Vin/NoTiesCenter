const http = require('http');
const url = require('url');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { HandleRequest } = require('./POSTRequestManager');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';

        const parsedUrl = url.parse(req.url, true);
        const queryParams = parsedUrl.query;

        const ID = queryParams.ID;

        const dateOfNotification = req.headers['Date'];

        const decoder = new StringDecoder('utf-8');

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();

            HandleRequest(req, ID, body, dateOfNotification);
        });
    } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Method not allowed');
    }
});

server.listen(config.port, config.hostname, () => {
    console.log(`Server running at http://${config.hostname}:${config.port}/`);
});