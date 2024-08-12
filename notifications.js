const apn = require('apn');
const config = require('./config');

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

function sendiOSNotification(Title, Subtitle, Body) {
    const apnProvider = new apn.Provider(options);
    const notification = new apn.Notification();

    notification.alert = { title: Title, subtitle: Subtitle, body: Body };
    notification.badge = 1;
    notification.sound = 'null';
    notification.topic = config.bundleId;

    apnProvider.send(notification, config.deviceToken)
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
