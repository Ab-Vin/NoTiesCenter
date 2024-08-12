const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { sendiOSNotification } = require('./notifications');
const { checkOrder, fileExists } = require('./utils');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const parsedUrl = url.parse(req.url);
        const query = parsedUrl.query;

        if (query) {
            const queryParams = querystring.parse(query);

            for (const key in queryParams) {
                const value = queryParams[key];
                if (key.startsWith('CS/SW/getdevicetoken')) {
                    const filePath = path.join(config.dirname, 'ComputerScience/SoftwareEngineer', value, 'DeviceToken.json');

                    fileExists(filePath, (err, exists) => {
                        if (err || !exists) {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('File not found');
                            return;
                        }

                        fs.readFile(filePath, 'utf8', (err, data) => {
                            if (err) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end('Error reading file');
                                return;
                            }

                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end(data);
                        });
                    });
                    return;
                }
            }

            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Invalid parameter');
        } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No query parameters found');
        }
    } else if (req.method === 'POST' && req.url === '/create-devicetoken') {
        let body = '';
        const decoder = new StringDecoder('utf-8');

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();
            const data = JSON.parse(body);

            const sID = data.studentid;
            const content = data.content;

            if (sID && content) {
                const dirPath = path.join(config.dirname, 'ComputerScience/SoftwareEngineer', sID);
                const filePath = path.join(dirPath, 'DeviceToken.json');

                fileExists(filePath, (err, exists) => {
                    if (exists) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('File already exists');
                        return;
                    }

                    fs.mkdir(dirPath, { recursive: true }, (err) => {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Error creating directories');
                            return;
                        }

                        fs.writeFile(filePath, content, err => {
                            if (err) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end('Error writing file');
                                return;
                            }

                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('File created successfully');
                        });
                    });
                });
            } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Invalid data');
            }
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