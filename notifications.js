const apn = require('apn');
const config = require('./config');
const schedule = require('node-schedule');
const path = require('path');
const { scheduler } = require('timers/promises');

const authKey = require('fs').readFileSync(config.authKeyPath);

const options = {
    token: {
        key: authKey,
        keyId: config.keyid,
        teamId: config.teamid,
    },
    production: true,
    topic: config.bundleId
};

function sendNotification(Platform, Targets, Title, Subtitle, Body, date) {
    switch (Targets) {
        case 'CSSE':
            const directoryPath = path.join(config.dirname, 'ComputerScience/SoftwareEngineer');

            const readDirectoryFiles = (dirPath) => {
                return new Promise((resolve, reject) => {
                    fs.readdir(dirPath, (err, files) => {
                        if (err) {
                            return reject(err);
                        }

                        
                        const filePromises = files
                            .map(file => path.join(dirPath, file)) 
                            .filter(filePath => fs.statSync(filePath).isFile())
                            .map(filePath => {
                                return new Promise((resolve, reject) => {
                                    fs.readFile(filePath, 'utf8', (err, data) => {
                                        if (err) {
                                            return reject(err);
                                        }

                                        const directory = path.dirname(filePath);
                                        const fileName = path.basename(filePath);
                                        resolve({
                                            content: data,
                                            directory: directory,
                                            fileName: fileName
                                        });  
                                    });
                                });
                            });

                        Promise.all(filePromises)
                            .then(results => resolve(results)) 
                            .catch(reject);
                    });
                });
            };

            const logEachContent = (files) => {
                files.forEach((file, index) => {
                    schedule.scheduleJob(date, sendiOSNotification(file.content, Title, Subtitle, Body));
                    console.log(`Sent a scheduled notification to ${file.fileName}`);
                });
            };

            readDirectoryFiles(directoryPath)
                .then(files => {
                    logEachContent(files);
                })
                .catch(err => {
                    console.error('Error reading directory files:', err);
                });
            break;
    }
    if (Platform == 'IOS') {
        schedule.scheduleJob(date, sendiOSNotification(Title, Subtitle, Body)
    }
}

function sendiOSNotification(Target, Title, Subtitle, Body) {
    const apnProvider = new apn.Provider(options);
    const notification = new apn.Notification();

    notification.alert = { title: Title, subtitle: Subtitle, body: Body };
    notification.badge = 1;
    notification.sound = 'null';
    notification.topic = config.bundleId;

    apnProvider.send(notification, Target)
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

module.exports = { sendiOSNotification };
