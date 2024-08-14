const apn = require('apn');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const config = require('./config');
const { FindDeviceTokensForGroup } = require('./utils');
const authKey = fs.readFileSync(config.authKeyPath);

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

        FindDeviceTokensForGroup(dirPath).then(results => {
            results.forEach(file => {
                schedule.scheduleJob(date, function () {
                    sendiOSNotification(file.content, Title, Subtitle, Body);
                });
                console.log('Successfully sent the notification to all the people under the group ' + Targets);
            }); 
        }).catch(err => {
            console.error('Error: ', err);
        });
        
    } else if (Platform === 'IOS') {
        schedule.scheduleJob(date, function () {
            sendiOSNotification(Targets, Title, Subtitle, Body);
        });
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

module.exports = { sendNotification };
