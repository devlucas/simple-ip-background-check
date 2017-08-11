const { spawnSync } = require('child_process')

function isIpBlocked(ipsetName, ip) {
    let result = spawnSync('ipset', ['test', ipsetName, ip])

    return `${result.stderr}`.indexOf('NOT') === -1
}

function checkBlacklist({ sourceIpset, ip }) {
    process.send(isIpBlocked(sourceIpset.split('.')[0], ip))
}

function close() {
    process.exit()
}

const handlers = { checkBlacklist, close }

process.on('message', (msg) => {
    let payload = JSON.parse(msg)

    handlers[payload.command](payload)
})
