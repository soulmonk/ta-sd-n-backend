const express = require('express')
const app = express()

const config = require('./config')

require('./middleware')(app)
require('./routes')(app)

if (require.main === module) {
  app.listen(config.server.port, () => console.log(`Auth app listening at http://localhost:${config.server.port}!`))
}

module.exports = app
