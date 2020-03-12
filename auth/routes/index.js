'use strict'

const { authenticated } = require('./helpers')

function init (app) {
  app.get('/api/status', (req, res) => {
    res.json({ data: 'ok' })
  })

  app.use('*', authenticated, (req, res, next) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(require('./errors'))
}

module.exports = init
