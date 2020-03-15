'use strict'

const { test } = require('tap')
const sinon = require('sinon')

// TODO init with test db
require('../../app')
const DB = require('../../libs/db')
const trainingRepository = require('../../repository/training')

test('create session', async t => {
  const stubQuery = sinon.stub(DB.instance(), 'query')
  stubQuery.resolves({ rows: [{ id: 2 }] })
  await trainingRepository.createSession({
    title: 'title 1',
    description: 'description 1'
  })

  t.deepEqual(stubQuery.getCall(0).args, [
    'INSERT INTO "training_session" (title, description) VALUES ($1, $2) RETURNING id',
    ['title 1', 'description 1']
  ])

  stubQuery.restore()
})
