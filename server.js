const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { sendNotification } = require('./notifications');
const { checkOrder, fileExists, getDeviceTokenFromID, hasMoreThanOneKey } = require('./utils');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const parsedUrl = url.parse(req.url);
        const query = parsedUrl.query;

        if (query) {
            const queryParams = querystring.parse(query);

            const firstKey = Object.keys(queryParams)[0];
            const value = queryParams[firstKey];

            let Section = '';
            let SectionValue = '';

            if (hasMoreThanOneKey(queryParams)) {
                Section = Object.keys(queryParams)[1];
                SectionValue = queryParams[Section];
            }

            if (firstKey.startsWith('SendNotificationsToGroup')) {
                sendNotification('IOS', value, 'CSCE 102', SectionValue, 'اقترب وقت المحاضرة', Date.now() + 2000);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Successfully sent the notification to the group ' + value + ' Section ' + SectionValue);
            } else if (firstKey.startsWith('SendNotificationToUser')) {
                getDeviceTokenFromID(value)
                    .then(token => {
                        if (token) {
                            sendNotification('IOS', token, 'CSCE 102', '004', 'اقترب وقت المحاضرة', Date.now() + 2000);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Successfully sent the notification to the person with the ID ' + value);
                        } else {
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Failed to find the person with the ID ' + value);
                        }
                    })
                    .catch(err => {
                        console.error('Error: ', err);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('Internal Server Error');
                    });
            } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Invalid query parameters');
            }
        } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('No query parameters provided');
        }
    } else if (req.method === 'POST' && req.url === '/create-devicetoken') {
        let body = '';
        const decoder = new StringDecoder('utf-8');

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();
            try {
                const data = JSON.parse(body);

                const sID = data.studentid;
                const content = data.content;

                if (sID && content) {
                    const dirPath = path.join(config.dirname, 'ComputerScience/SoftwareEngineer', sID);
                    const filePath = path.join(dirPath, 'DeviceToken.json');

                    fileExists(filePath, (err, exists) => {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Error checking file existence');
                            return;
                        }

                        if (exists) {
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('File already exists');
                            return;
                        }

                        fs.mkdir(dirPath, { recursive: true }, err => {
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
            } catch (err) {
                console.error('Error parsing JSON:', err);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Invalid JSON format');
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