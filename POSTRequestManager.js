const kd = require('./kewordDictionary');

function HandleRequest(request, ID, body) {
    switch (request)
    {
        case kd.CreateDeviceToken:
        HandleCreateDeviceToken(ID, body);
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