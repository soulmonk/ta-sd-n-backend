'use strict'

const bcrypt = require('bcrypt')
// const hyperid = require('hyperid')
const jwt = require('jsonwebtoken')
const config = require('../config')

class UserRepository {
  constructor (db, jwtOpts, usrOpts) {
    this.db = db
    this.jwtOpts = jwtOpts
    this.usrOpts = usrOpts
  }

  async create (data) {
    const password = await this.crypt(data.password)

    const sql = `INSERT INTO "user" (name, email, password, created_at, updated_at)
                 VALUES ($1, $2, $3, now(), now())
                 RETURNING id, created_at, updated_at`

    const { rows } = await this.db.query(sql, [data.name, data.email, password])

    return rows[0]
  }

  async getUserById (id) {
    if (id === null || isNaN(Number(id))) {
      throw new Error('invalid arguments: id is required')
    }
    // todo optimise query
    const { rows } = await this.db.query('SELECT * FROM "user" WHERE id=$1 limit 1', [
      id
    ])

    return rows && rows.length && rows[0]
  }

  // todo jsdoc
  async getUserByName (username) {
    if (username === null || typeof username !== 'string') {
      throw new Error('invalid arguments: username is required')
    }
    // todo optimise query
    const { rows } = await this.db.query('SELECT * FROM "user" WHERE name=$1 limit 1', [
      username
    ])

    return rows && rows.length && rows[0]
  }

  // async storeRefreshToken (id, token) {
  //   if (id === null || isNaN(Number(id)) || token === null || typeof token !== 'string') {
  //     throw new Error('invalid arguments: "id" and "token" are required')
  //   }
  //   const { rowCount } = await this.db.query('UPDATE "tokens" SET refresh_token=$2, updated_at = now() WHERE user_id=$1', [
  //     id,
  //     token
  //   ])
  //
  //   return rowCount === 1
  // }

  // async getUserByRefreshToken (token) {
  //   if (token === null || typeof token !== 'string') {
  //     throw new Error('invalid arguments: "token" is required')
  //   }
  //
  //   const { rows } = await this.db.query('SELECT id, enabled FROM "tokens" WHERE refresh_token=$1 limit 1', [
  //     token
  //   ])
  //
  //   return rows && rows.length && rows[0]
  // }

  crypt (password) {
    return bcrypt.hash(password, this.usrOpts.rounds)
  }

  async checkPassword (plain, stored) {
    if (!plain || !stored) {
      return false
    }
    return bcrypt.compare(plain, stored)
  }

  async generateToken (user) {
    const expiresIn = this.jwtOpts.expiresIn

    return jwt.sign({ id: user.id }, this.jwtOpts.secret, {
      expiresIn
    })
    //
    // const refreshToken = hyperid().uuid
    //
    // await this.storeRefreshToken(user.id, refreshToken)

    // return { /*success: true, */ token /*, refreshToken, expiresIn*/ }
  }
}

module.exports = new UserRepository(require('../libs/db').instance(), config.jwt, config.user)
