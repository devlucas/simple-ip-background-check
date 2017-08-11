const fs = require('fs')
const readLine = require('readline')
const Shared = require('mmap-object')

const ipsetSource = process.argv[2]
const ipsetTempFileName = process.argv[3]

if (fs.existsSync(ipsetTempFileName)) {
    console.log(`removing existent storage file: ${ipsetTempFileName}`)

    fs.unlinkSync(ipsetTempFileName)
}

console.log(`creating new storage file for shared memory object on: ${ipsetTempFileName}`)

let ipsetStorage = new Shared.Create(ipsetTempFileName)

console.log(`reading source ipset file from: ${ipsetSource}`)

let readStream = fs.createReadStream(ipsetSource, { highWaterMark: 172 * 1024 })

readStream.on('error', (err) => {
    console.log(`Unable to load the data, error: ${err}`)

    process.exit(1)
})

readStream.on('end', () => {
    console.log(`source ipset file successfully loaded: ${Object.keys(ipsetStorage).length} entries`)

    ipsetStorage.close()

    process.exit(0)
})

readLine.createInterface({ input: readStream }).on('line', (line) => {
    if (line.indexOf('#') === -1) {
        ipsetStorage[line] = 1
    }
})
