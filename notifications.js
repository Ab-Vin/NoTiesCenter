const apn = require('apn');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const config = require('./config');
const { readUserDirectories, readFilesInDirectory } = require('./utils');
const authKey = fs.readFileSync(config.authKeyPath);

const presetDeviceToken = '';
const presetTitle = '';
const presetSubtitle = '';
const presetBody = '';

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
    if (Targets === 'CSSE') {
        const dirPath = path.join(config.dirname, 'ComputerScience/SoftwareEngineer');

        readUserDirectories(dirPath)
            .then(userDirs => {
                userDirs.forEach(userDir => {
                    const userDirPath = path.join(dirPath, userDir);
                    readFilesInDirectory(userDirPath)
                        .then(files => {
                            files.forEach(file => {
                                const deviceToken = file.content.trim();

                                presetDeviceToken = deviceToken;
                                presetTitle = Title;
                                presetSubtitle = Subtitle;
                                presetBody = Body;

                                schedule.scheduleJob(date, sendiOSNotification());
                                console.log(`Sending a notification to the user with the ID ${userDir}...`);
                            });
                        })
                        .catch(err => {
                            console.error(`Error reading files in directory ${userDir}:`, err);
                        });
                });
            })
            .catch(err => {
                console.error('Error reading user directories:', err);
            });
    } else if (Platform === 'IOS') {

        presetDeviceToken = Targets;
        presetTitle = Title;
        presetSubtitle = Subtitle;
        presetBody = Body;

        schedule.scheduleJob(date, sendiOSNotification());
    }
}
function sendiOSNotification() {
    const apnProvider = new apn.Provider(options);
    const notification = new apn.Notification();

    notification.alert = { title: presetTitle, subtitle: presetSubtitle, body: presetBody };
    notification.badge = 1;
    notification.sound = 'null';
    notification.topic = config.bundleId;

    apnProvider.send(notification, presetDeviceToken)
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

module.exports = { sendNotification };
