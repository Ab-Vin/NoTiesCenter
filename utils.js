const path = require('path');
const fs = require('fs');
const config = require('./config');

function getDeviceTokenFromID(ID) {
    readUserDirectories(config.dirname)
        .then(userDirs => {
            userDirs.forEach(userDir => {
                const userDirPath = path.join(config.dirname, userDir);
                readFilesInDirectory(userDirPath)
                    .then(files => {
                        files.forEach(file => {
                            if (ID == userDir)
                            return file.content.trim();
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
    console.warn('Could not find the ID ' + ID + '.');
    return null;
}

function readUserDirectories(dirPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, entries) => {
            if (err) return reject(err);

            const userDirs = entries.filter(entry => fs.statSync(path.join(dirPath, entry)).isDirectory());
            resolve(userDirs);
        });
    });
}

function readFilesInDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) return reject(err);

            const filePromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const filePath = path.join(dirPath, file);
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) return reject(err);
                        resolve({ content: data, fileName: file });
                    });
                });
            });

            Promise.all(filePromises)
                .then(results => resolve(results))
                .catch(reject);
        });
    });
}

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

module.exports = { checkOrder, fileExists, readFilesInDirectory, readUserDirectories, getDeviceTokenFromID };
