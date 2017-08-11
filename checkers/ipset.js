const { spawnSync } = require('child_process')

function isIpBlocked(ipsetName, ip) {
    let result = spawnSync('ipset', ['test', ipsetName, ip])

    return `${result.stderr}`.indexOf('NOT') === -1
}

process.on('message', (msg) => {
    let { sourceIpset, ip } = JSON.parse(msg)

    process.send(isIpBlocked(sourceIpset.split('.')[0], ip))
})
