const Shared = require('mmap-object')

let sharedBlacklist

function getBlacklist(storageFile) {
    if (typeof sharedBlacklist === 'undefined') {
        sharedBlacklist = new Shared.Open(storageFile)
    }

    return sharedBlacklist
}

function checkBlacklist({ storageFileName, ip }) {
    process.send(typeof getBlacklist(storageFileName)[ip] !== 'undefined')
}

function close() {
    process.exit()
}

const handlers = { checkBlacklist, close }

process.on('message', (msg) => {
    let payload = JSON.parse(msg)

    handlers[payload.command](payload)
})
