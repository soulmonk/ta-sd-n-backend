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
    description: 'description 1',
    userId: 1
  })

  t.deepEqual(stubQuery.getCall(0).args, [
    'INSERT INTO "training_session" (title, description, user_id) VALUES ($1, $2, $3) RETURNING id',
    ['title 1', 'description 1', 1]
  ])

  stubQuery.restore()
})
test('INTEGRATION order training plan', async t => {
  const db = DB.instance()
  await db.query('truncate table training_session restart identity cascade;')
  await db.query(`INSERT INTO "training_session" (id, title, description, user_id)
                  VALUES (1000, 'title user 200', 'description user 200', 200),
                         (1001, 'title user 200', 'description user 200', 200),
                         (1002, 'title user 200', 'description user 200', 200),
                         (1003, 'title user 100', 'description user 100', 100),
                         (1004, 'title user 100', 'description user 100', 100),
                         (1005, 'title user 100', 'description user 100', 100)`)
  await db.query(`INSERT INTO "training_plan" (training_session_id, priority)
                  VALUES (1001, 0),
                         (1000, 1),
                         (1005, 0)`)
  await trainingRepository.resetPlan(200)

  const { rows } = await db.query('SELECT count(1) as count FROM training_plan')
  t.equal(+rows[0].count, 1)

  await db.query('truncate table training_session restart identity cascade;')
})
