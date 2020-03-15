'use strict'

function init (app) {
  app.use(require('./cors'))
  app.use(require('./logger'))
  app.use(require('./body-parser'))
  app.use(require('./get-user'))
}

module.exports = init
