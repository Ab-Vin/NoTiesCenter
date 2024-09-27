const path = require('path');
const fs = require('fs').promises;
const config = require('./config');

function FindDeviceTokensForGroup(startDir) {
    return fs.readdir(startDir, { withFileTypes: true })
        .then(files => {
            let promises = files.map(file => {
                const filePath = path.join(startDir, file.name);

                if (file.isDirectory()) {
                    return FindDeviceTokensForGroup(filePath);
                } else if (file.name === 'DeviceToken.json') {
                    return fs.readFile(filePath, 'utf8').then(content => {
                        return [{ path: filePath, content: content }];
                    });
                }
                return Promise.resolve([]);
            });
            return Promise.all(promises).then(results => {
                return results.flat();
            });
        });
}

function findFolderByName(directoryPath, ID) {
    return fs.readdir(directoryPath)
        .then(files => {
            const searchPromises = files.map(file => {
                const filePath = path.join(directoryPath, file);
                return fs.stat(filePath)
                    .then(stats => {
                        if (stats.isDirectory()) {
                            if (file === ID) {
                                return filePath;
                            }
                            return findFolderByName(filePath, ID);
                        }
                        return null;
                    });
            });
            return Promise.all(searchPromises)
                .then(results => {
                    return results.find(result => result !== null);
                });
        })
        .catch(err => {
            console.error('Error:', err);
            return null;
        });
}

function readFilesInDirectory(directoryPath) {
    return fs.readdir(directoryPath)
        .then(files => {
            const fileDetailsPromises = files.map(file => {
                const filePath = path.join(directoryPath, file);
                return fs.stat(filePath)
                    .then(stats => {
                        if (stats.isFile()) {
                            return fs.readFile(filePath, 'utf8')
                                .then(content => ({ name: file, content }));
                        }
                        return null;
                    });
            });
            return Promise.all(fileDetailsPromises).then(fileDetails => fileDetails.filter(Boolean));
        })
        .catch(err => {
            console.error('Error reading directory:', err);
            throw err;
        });
}

function getDeviceTokenFromID(ID) {
    return findUserByID(ID)
        .then(pathFound => {
            if (!pathFound) {
                console.warn('User not found');
                return null;
            }

            return readFilesInDirectory(pathFound)
                .then(files => {
                    for (const file of files) {
                        if (file.name === 'DeviceToken.json') {
                            return file.content.trim();
                        }
                    }

                    console.warn('DeviceToken.json file not found');
                    return null;
                });
        })
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
}

function findUserByID(ID) {
    return fs.readdir(config.dirname)
        .then(files => {
            const searchPromises = files.map(file => {
                const filePath = path.join(config.dirname, file);
                return fs.stat(filePath)
                    .then(stats => {
                        if (stats.isDirectory()) {
                            if (file === ID) {
                                return filePath;
                            }
                            return findFolderByName(filePath, ID);
                        }
                        return null;
                    });
            })
            return Promise.all(searchPromises)
                .then(results => {
                    return results.find(result => result !== null);
                });
        })
        .catch(err => {
            console.error('Error:', err);
            return null;
        });
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

function hasMoreThanOneKey(obj) {
    const keys = Object.keys(obj);
    return keys.length > 1;
}

module.exports = { checkOrder, fileExists, readFilesInDirectory, readUserDirectories, getDeviceTokenFromID, hasMoreThanOneKey, FindDeviceTokensForGroup };
