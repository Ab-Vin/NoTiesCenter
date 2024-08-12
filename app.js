const apn = require('apn');
const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const authKeyPath = '/Users/Administrator/Desktop/NoTies-master/AuthKey_9S9S28TW59.p8';
const __dirname = '/Users/Administrator/Desktop/NoTiesDatabase/Students/Male/'
const keyid = '9S9S28TW59';
const teamid = 'ZPF5K5D3V4';
const bundleId = 'com.abtq.unimap';
const deviceToken = '1c834d056752e44a9f207d01a9c8d55e78decd98e910e1d6d6054b1c8d59bad0';

const hostname = '2.56.165.53';
const port = process.env.PORT || 3000;

// Read the content of the authentication key file
const authKey = fs.readFileSync(authKeyPath);

// Configure APNs with your credentials
const options = {
    
    token: {
        key: authKey,
        keyId: keyid,
        teamId: teamid,
    },
    production: true,
    topic: bundleId
};

function sendiOSNotification(Title, Subtitle, Body) {
    const apnProvider = new apn.Provider(options);

    // Prepare the notification payload
    const notification = new apn.Notification();

    // Set mandatory 'alert' field
    notification.alert = {
        title: Title,
        subtitle: Subtitle,
        body: Body
    };

    // Set mandatory 'badge' field (optional, set to 1 for example)
    notification.badge = 1;

    // Set mandatory 'sound' field
    notification.sound = 'null';

    notification.topic = bundleId;

    // Send the notification
    apnProvider.send(notification, deviceToken)
        .then(result => {
            if (result.failed.length > 0) {
                console.error('Failed to send notification:', result.failed);
            } else {
                console.log('Notification sent successfully.');
            }
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
}

const server = http.createServer((req, res) => {
    if (req.method == 'GET') {

        const parsedUrl = url.parse(req.url);
        const query = querystring.parse(parsedUrl.query);

        const expectedOrder = ['CS', 'SW'];
        const queryKeys = Object.keys(query);

        // Check if the order is correct
        if (!checkOrder(expectedOrder, queryKeys)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Parameters are not in the correct order');
            return;
        }

        // Process each dynamic parameter in the correct order
        expectedOrder.forEach(action => {
            if (query[action]) {
                const value = query[action];

                switch (action) {
                    case 'getdevicetoken':
                        // Example: If action is 'list', list files in the folder specified by the value
                        const folderPath = path.join(__dirname, 'ComputerScience/SoftwareEngineer', value, "DeviceToken.json");

                        fs.stat(folderPath, (err, stats) => {
                            if (err || !stats.isDirectory()) {
                                res.statusCode = 404;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end('Folder not found');
                                return;
                            }

                            fs.readdir(folderPath, (err, files) => {
                                if (err) {
                                    res.statusCode = 500;
                                    res.setHeader('Content-Type', 'text/plain');
                                    res.end('Error reading folder');
                                    return;
                                }

                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ files }));
                            });
                        });
                        break;
                    default:
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end(`Unknown action: ${action}`);
                }
            }
        });
    } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Method not allowed');
    }
    if (req.method === 'POST' && req.url == '/create-devicetoken') {
        let body = '';
        const decoder = new StringDecoder('utf-8');

        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        req.on('end', () => {
            body += decoder.end();

            // Parse the received data (assuming JSON format)
            const data = JSON.parse(body);

            // Expecting 'filename' and 'content' in the request body
            const sID = data.studentid;
            const content = data.content;

            if (sID && content) {
                const dirPath = path.join(__dirname, 'ComputerScience/SoftwareEngineer', sID);
                const filePath = path.join(dirPath, 'DeviceToken.json');

                // Check if the file already exists
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        res.statusCode = 400;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('File already exists');
                        return;
                    } else {
                        fs.mkdir(dirPath, { recursive: true }, (err) => {
                            if (err) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end('Error creating directories');
                                return;
                            }
                    }

                    // If file does not exist, create it
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

function checkOrder(expectedOrder, queryKeys) {
    let index = -1;
    for (const key of expectedOrder) {
        const currentIndex = queryKeys.indexOf(key);
        if (currentIndex < index) {
            return false;
        }
        index = currentIndex;
    }
    return true;
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});