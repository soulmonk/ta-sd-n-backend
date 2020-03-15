'use strict'

const cors = require('cors')

module.exports = cors({

  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204

})
