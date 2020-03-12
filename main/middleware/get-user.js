'use strict'

const logger = require('../libs/logger')

const config = require('../config')
const jwt = require('jsonwebtoken')

function getUser (req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.headers.authorization
  if (!token || !token.startsWith('Bearer ')) {
    return next()
  }
  jwt.verify(token.slice(7), config.jwt.secret, (err, data) => {
    if (!err) {
      req.user = {
        id: data.id
      }
      return next()
    }
    logger.error('jwt.verify', err.message || err)
    res.status(400)
    res.json({ error: 'Could not verify' })
  })
}

module.exports = getUser
