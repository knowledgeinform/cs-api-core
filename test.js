global.logLevel = 'debug'

const {CoreAPI} = require('./index.js')

var api = new CoreAPI({ipAddress: 'localhost', port: 3000})

const testService = require('./test-service.js')
testService.defaults({'A': {}, 'B': {}}, api, true)

async function start() {
    await api.initialize()
    await api.initializeUtilities()
    api.start()
}

start()