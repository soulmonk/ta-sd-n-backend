'use strict'

const pg = require('pg')
const logger = require('./logger')

class DB {
  constructor (config) {
    this.init(config)
  }

  init (config) {
    this.pg = new pg.Pool(config)
  }

  static instance (config) {
    if (!config && !this._instance) {
      throw new Error('db should be initialized')
    }
    if (!this._instance) {
      this._instance = new DB(config)
    }
    return this._instance
  }

  async query (sql, params) {
    logger.log('query:', sql, '\nparams:', params)
    const client = await this.pg.connect()
    const res = client.query(sql, params)
    client.release()
    return res
  }

  close (done) {
    this.pg.end(done)
  }
}

module.exports = DB
