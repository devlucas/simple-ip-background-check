const Shared = require('mmap-object')

let sharedBlacklist

function getBlacklist(storageFile) {
    if (typeof blacklist === 'undefined') {
        sharedBlacklist = new Shared.Open(storageFile)
    }

    return sharedBlacklist
}

process.on('message', (msg) => {
    let { storageFileName, ip } = JSON.parse(msg)

    process.send(typeof getBlacklist(storageFileName)[ip] !== 'undefined')
})
