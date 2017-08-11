const { fork, spawn } = require('child_process')
const http = require('http')

const port = process.argv[2]
const loader = process.argv[3]
const checker = process.argv[4]
const sourceIpset = process.argv[5]
const storageFileName = process.argv[6]

const startServer = () => {
    http.createServer(handler).listen(port, (err) => {
        if (err) {
            return console.log('Error: ', err)
        }

        console.log(`Server is listening on ${port}!`)
    })
}

const handler = (req, res) => {
    const ip = req.url.split('/')[1]

    const checkBlacklistedIp = fork(checker)

    checkBlacklistedIp.on('data', (data) => {
        console.log(`${data}`)
    })

    checkBlacklistedIp.on('message', blacklisted => {
        res.end(`IP ${ip} is blacklisted: ${blacklisted ? 'yes' : 'no'} `)
    })

    checkBlacklistedIp.send(JSON.stringify({ sourceIpset, storageFileName, ip }))
}

if (sourceIpset === 'ignore' || storageFileName === 'ignore') {
    startServer()
} else {
    const dataLoader = spawn('node', [loader, sourceIpset, storageFileName])

    dataLoader.stdout.on('data', (data) => {
        console.log(`${data}`)
    })

    dataLoader.on('exit', (code, signal) => {
        if (code) {
            return console.log('Unable to load data during startup.')
        }

        startServer()
    })
}
