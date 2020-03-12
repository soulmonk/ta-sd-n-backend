'use strict'

const authenticated = require('./authenticated')

function init (app) {
  app.get('/api/status', (req, res) => {
    res.json({ data: 'ok' })
  })

  // routes

  app.use('*', authenticated, (req, res, next) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(require('../../shared/routes/errors'))
}

module.exports = init
