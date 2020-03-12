'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('get status', async t => {
  const res = await build()
    .get('/status')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'ok' })
  t.end()
})
