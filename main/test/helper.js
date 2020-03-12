'use strict'

const request = require('supertest')
const app = require('../app')

function build () {
  return request(app)
}

module.exports = {
  build
}
