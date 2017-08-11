const fs = require('fs')
const readLine = require('readline')
const { spawnSync } = require('child_process')

const ipsetSource = process.argv[2]
const ipsetName = ipsetSource.split('.')[0]

let entriesCount = 0

function doesIpsetExists(name) {
    let result = spawnSync('ipset', ['list', name, '-n'])

    return `${result.stdout}`.replace('\n', '') != false
}

function destroyIpset(name) {
    spawnSync('ipset', ['destroy', name])
}

function createIpset(name, hashSize, maxElements) {
    spawnSync('ipset', ['create', name, 'hash:ip', 'hashsize', hashSize, 'maxelem', maxElements])
}

function addIpsetEntry(name, entry) {
    spawnSync('ipset', ['add', name, entry])
}

if (doesIpsetExists(ipsetName)) {
    console.log(`removing existent ipset: ${ipsetName}`)

    destroyIpset(ipsetName)
}

console.log(`creating new ipset for: ${ipsetName}`)

createIpset(ipsetName, 36037106, 36037106)

console.log(`reading source ipset file from: ${ipsetSource}`)

let readStream = fs.createReadStream(ipsetSource, { highWaterMark: 172 * 1024 })

readStream.on('error', (err) => {
    console.log(`Unable to load the data, error: ${err}`)

    process.exit(1)
})

readStream.on('end', () => {
    console.log(`source ipset file successfully loaded: ${entriesCount} entries`)

    ipsetStorage.close()

    process.exit(0)
})

readLine.createInterface({ input: readStream }).on('line', (line) => {
    if (line.indexOf('#') === -1) {
        entriesCount++

        addIpsetEntry(ipsetName, line)
    }
})
