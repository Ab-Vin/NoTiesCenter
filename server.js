const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { sendNotification } = require('./notifications');
const { fileExists, getDeviceTokenFromID, hasMoreThanOneKey } = require('./utils');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const parsedUrl = url.parse(req.url);
        const query = parsedUrl.query;
        const dateOfNotification = req.headers['Date'];

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
                sendNotification('IOS', value, 'CSCE 102', SectionValue, 'اقترب وقت المحاضرة', Date.parse(dateOfNotification));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Successfully sent the notification to the group ' + value + ' Section ' + SectionValue);
            } else if (firstKey.startsWith('SendNotificationToUser')) {
                getDeviceTokenFromID(value)
                    .then(token => {
                        if (token) {
                            sendNotification('IOS', token, 'CSCE 102', '004', 'اقترب وقت المحاضرة', Date.parse(dateOfNotification));
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

        const dateOfNotification = req.headers['Date'];
        const Target = req.headers['Target'];

        const decoder = new StringDecoder('utf-8');

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();
            
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