'use strict';

const exec = require('child_process').exec;
const path = require('path');
const os = require('os');
const fs = require('fs');

const aapt = path.join(__dirname, 'lib', os.type(), 'aapt');

module.exports = function (filename, callback) {
    callback = callback || function () {
    };
    return new Promise(function (resolve, reject) {
        fs.access(aapt, fs.X_OK, (err) => {
            if (err) {
                err.msg = ['Hmmm, what OS are you using?', os.type()].join(' ');
                reject(err);
                callback(err, null);
            } else {
                const cmd = [aapt, 'dump', 'badging', filename, '|', 'egrep', '"package|application:"'].join(' ');
                exec(cmd, (err, stdout, stderr) => {
                    const error = err || stderr;
                    if (error) {
                        reject(error);
                        callback(error, null);
                    } else {
                        let results = stdout.split('\n');
                        if (!results instanceof Array || results.length < 2) {
                            reject(results);
                            callback(results, null);
                            return;
                        }

                        let packageName = results[0];
                        const match = packageName.match(/name='([^']+)'[\s]*versionCode='(\d+)'[\s]*versionName='([^']+)/);
                        const info = {
                            package: match[1],
                            versionCode: match[2],
                            versionName: match[3]
                        };

                        let application = results[1];
                        const matchApp = application.match(/label='([^']+)'/);
                        info.appName = matchApp.length > 1 ? matchApp[1] : '';

                        resolve(info);
                        callback(null, info);
                    }
                });
            }
        });
    });
};
