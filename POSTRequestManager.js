const kd = require('./kewordDictionary');
const { sendNotification } = require('./notifications');
const path = require('path');

function HandleRequest(request, ID, body, date) {
    switch (request.url) {
        case kd.CreateDeviceToken:
            return HandleCreateDeviceToken(ID, body);
        case kd.SendNotification:
            return HandleSendNotification(body, date);
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
                    return res = {
                        statusCode: 500,
                        Header: ['Content-Type', 'text/plain'],
                        end: 'Error checking file existance'
                           };
                }

                if (exists) {
                    return res = {
                        statusCode: 400,
                        Header: ['Content-Type', 'text/plain'],
                        end: 'File already exists'
                    };
                }

                fs.mkdir(dirPath, { recursive: true }, err => {
                    if (err) {
                        return res = {
                            statusCode: 500,
                            Header: ['Content-Type', 'text/plain'],
                            end: 'Error creating directories'
                        };
                    }

                    fs.writeFile(filePath, content, err => {
                        if (err) {
                            return res = {
                                statusCode: 500,
                                Header: ['Content-Type', 'text/plain'],
                                end: 'Error writing file'
                            };
                        }
                        return res = {
                            statusCode: 200,
                            Header: ['Content-Type', 'text/plain'],
                            end: 'File created successfully'
                        };
                    });
                });
            });
        } else {
            return res = {
                statusCode: 400,
                Header: ['Content-Type', 'text/plain'],
                end: 'Invalid data'
            };
        }
    } catch (err) {
        console.error('Error parsing JSON:', err);
        return res = {
            statusCode: 400,
            Header: ['Content-Type', 'text/plain'],
            end: 'Invalid JSON format'
        };
    }
}

function HandleSendNotification(body, date) {
    try {
        const outputJson = JSON.parse(body);

        let finalDate = '0';

        if (date == null)
            finalDate = Date.now();
        else
            Date.parse(date);

        if (!outputJson.IsSingleUser)
            return sendNotification("iOS", outputJson.Targets, outputJson.Title, outputJson.Subtitle, outputJson.Body, finalDate);
        else {
            getDeviceTokenFromID(outputJson.Targets)
                .then(token => {
                    if (token) {
                        sendNotification('IOS', token, outputJson.Title, outputJson.Subtitle, outputJson.Body, finalDate);
                        console.log('Successfully sent the notification to the person with the ID ' + value);
                        return res = {
                            statusCode: 200,
                            Header: ['Content-Type', 'text/plain'],
                            end: 'Successfully sent the notification to the person with the ID ' + value
                        };
                    } else {
                        console.error('Failed to find the person with the ID ' + value);
                        return res = {
                            statusCode: 400,
                            Header: ['Content-Type', 'text/plain'],
                            end: 'Failed to find the person with the ID ' + value
                        };
                    }
                })
                .catch(err => {
                    console.error('Error: ', err);
                    return res = {
                        statusCode: 400,
                        Header: ['Content-Type', 'text/plain'],
                        end: 'Error: ' + err
                    };
                });
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return res = {
            statusCode: 400,
            Header: ['Content-Type', 'text/plain'],
            end: 'Error parsing JSON: ' + error
        };
    }
}

module.exports = { HandleRequest }