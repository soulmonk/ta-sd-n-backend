const express = require('express')
const app = express()

const config = require('./config')

require('./libs/db').instance(config.pg)

require('./middleware')(app)
require('./handlers')(app)

if (require.main === module) {
  app.listen(config.server.port, () => console.log(`Auth app listening at http://localhost:${config.server.port}!`))
}

module.exports = app
