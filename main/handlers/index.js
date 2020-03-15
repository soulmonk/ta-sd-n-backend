'use strict'

function init (app) {
  app.get('/api/status', (req, res) => {
    res.json({ data: 'ok' })
  })

  require('./training')(app)

  app.use('*', (req, res, next) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(require('../../shared/routes/errors'))
}

module.exports = init
