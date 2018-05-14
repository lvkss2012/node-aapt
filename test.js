const packageInfo = require('./index');

let apkfile = '';

packageInfo(apkfile)
    .then(data => {
        console.log(data)
    })
    .catch(err => {
        console.log(err)
    })