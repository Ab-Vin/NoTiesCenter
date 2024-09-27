const kd = require('./kewordDictionary');
const { sendNotification } = require('./notifications');
const path = require('path');

function HandleRequest(request, ID, body, date) {
    switch (request.url) {
        case kd.CreateDeviceToken:
            HandleCreateDeviceToken(ID, body);
            break;
        case kd.SendNotification:
            HandleSendNotification(body, date);
            break;
    }
}

function HandleCreateDeviceToken(ID, body) {
    try {
        const data = JSON.parse(body);

        const content = data.content;

        if (ID && content) {
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
}

function HandleSendNotification(body, date) {
    try {
        const outputJson = JSON.parse(body);

        let finalDate = "0"

        if (date == null)
            finalDate = Date.now();
        else
            Date.parse(date);

        if (!outputJson.IsSingleUser)
            sendNotification("iOS", outputJson.Targets, outputJson.Title, outputJson.Subtitle, outputJson.Body, finalDate);
        else {
            getDeviceTokenFromID(outputJson.Targets)
                .then(token => {
                    if (token) {
                        sendNotification('IOS', token, outputJson.Title, outputJson.Subtitle, outputJson.Body, finalDate);
                        console.log('Successfully sent the notification to the person with the ID ' + value);
                    } else {
                        console.error('Failed to find the person with the ID ' + value);
                    }
                })
                .catch(err => {
                    console.error('Error: ', err);
                });
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
}

module.exports = { HandleRequest }