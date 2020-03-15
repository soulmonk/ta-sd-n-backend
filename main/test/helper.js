'use strict'

const request = require('supertest')

// TODO override to test DB
// const DB = require('../../libs/db')
const app = require('../app')
const config = require('../config')
const jwt = require('jsonwebtoken')

const TOKEN = jwt.sign({ id: 1 }, config.jwt.secret, { })

function build () {
  return request(app)
}

module.exports = {
  TOKEN,
  build
}
