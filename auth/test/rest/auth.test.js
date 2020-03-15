'use strict'

const { test } = require('tap')
const { build } = require('../helper')

const sinon = require('sinon')
const DB = require('../../libs/db')
const userRepository = require('../../repository/user')

test('sign up', async t => {
  const queryStub = sinon.stub(DB.instance(), 'query')
  queryStub.onFirstCall()
    .resolves({ rows: [] })
  queryStub.resolves({ rows: [{ id: 1000 }] })

  const res = await build()
    .post('/api/auth/sign-up')
    .send({ name: 'john', password: 'q1w2e3r4', email: 'john.doe@example.com' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  const climes = JSON.parse(Buffer.from(res.body.data.token.split('.')[1], 'base64').toString('utf8'))

  t.equal(climes.id, 1000)
  t.equal(res.body.data.name, 'john')
  queryStub.restore()
})

test('sign up, user exists', async t => {
  const queryStub = sinon.stub(DB.instance(), 'query')
  queryStub.onFirstCall()
    .resolves({ rows: [{ id: 2000 }] })

  const res = await build()
    .post('/api/auth/sign-up')
    .send({ name: 'john', password: 'q1w2e3r4', email: 'john.doe@example.com' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(409)

  t.deepEqual(res.body, { errors: ['User "john" already exists'] })
  queryStub.restore()
})

test('sign in 200', async t => {
  const findByNameStub = sinon.stub(userRepository, 'getUserByEmail')
  const checkPasswordStub = sinon.stub(userRepository, 'checkPassword')
  findByNameStub.resolves({ id: 2000, name: 'john.doe' })
  checkPasswordStub.resolves(true)

  const res = await build()
    .post('/api/auth/sign-in')
    .send({ email: 'john.doe@example.com', password: 'q1w2e3r4' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  const climes = JSON.parse(Buffer.from(res.body.data.token.split('.')[1], 'base64').toString('utf8'))

  t.equal(climes.id, 2000)
  t.equal(res.body.data.name, 'john.doe')
  findByNameStub.restore()
  checkPasswordStub.restore()
})

test('sign in 4**', async t => {
  const findByNameStub = sinon.stub(userRepository, 'getUserByEmail')
  const checkPasswordStub = sinon.stub(userRepository, 'checkPassword')
  findByNameStub.resolves()

  const res = await build()
    .post('/api/auth/sign-in')
    .send({ email: 'john.doe@example.com', password: 'q1w2e3r4' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400)

  t.deepEqual(res.body, { errors: ['Wrong name or password'] })
  findByNameStub.restore()
  checkPasswordStub.restore()
})

test('sign out', async t => {
  t.ok(false, 'not implemented')
})
