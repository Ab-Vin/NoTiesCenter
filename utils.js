const path = require('path');
const fs = require('fs');

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

function fileExists(filePath, callback) {
    fs.stat(filePath, (err, stats) => {
        if (err) return callback(err);
        callback(null, stats.isFile());
    });
}

module.exports = { checkOrder, fileExists };
