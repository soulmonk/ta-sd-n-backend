'use strict'

const { test } = require('tap')
const { build, TOKEN } = require('../helper')
const DB = require('../../libs/db')

const trainingRepository = require('../../repository/training')

const sinon = require('sinon')

test('get all training session', async t => {
  const stubPlan = sinon.stub(trainingRepository, 'getInPlan')
  stubPlan.resolves([
    { id: 3, title: 'title 3', description: 'description 3', done: false, priority: 1 },
    { id: 4, title: 'title 4', description: 'description 4', done: false, priority: 2 }
  ])
  const stubBank = sinon.stub(trainingRepository, 'getInBank')
  stubBank.resolves([
    { id: 1, title: 'title 1', description: 'description 1', done: false },
    { id: 2, title: 'title 2', description: 'description 2', done: false }
  ])

  const res = await build()
    .get('/api/training/session')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, {
    data: {
      bank: [
        { id: 1, title: 'title 1', description: 'description 1', done: false },
        { id: 2, title: 'title 2', description: 'description 2', done: false }
      ],
      plan: [
        { id: 3, title: 'title 3', description: 'description 3', done: false, priority: 1 },
        { id: 4, title: 'title 4', description: 'description 4', done: false, priority: 2 }
      ]
    }
  })

  stubBank.restore()
  stubPlan.restore()
})

test('create training session', async t => {
  const stubCreate = sinon.stub(trainingRepository, 'createSession')
  stubCreate.resolves({ id: 2 })
  const res = await build()
    .post('/api/training/session')
    .send({ title: 'title 1', description: 'description 1' })
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(stubCreate.getCall(0).args[0], {
    title: 'title 1',
    description: 'description 1'
  })

  t.deepEqual(res.body, {
    data: {
      id: 2
    }
  })

  stubCreate.restore()
})

test('remove training session', async t => {
  const spyRemove = sinon.spy(trainingRepository, 'removeSession')
  const stubDbQuery = sinon.stub(DB.instance(), 'query')
  stubDbQuery.resolves({ rows: [] })
  const res = await build()
    .delete('/api/training/session/2')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.equal(spyRemove.getCall(0).args[0], '2')
  t.deepEqual(stubDbQuery.getCall(0).args, ['DELETE FROM "training_session" WHERE id = $1', ['2']])

  t.deepEqual(res.body, {
    success: true
  })

  spyRemove.restore()
  stubDbQuery.restore()
})

test('mark training session completed', async t => {
  const stubComplete = sinon.stub(trainingRepository, 'complete')
  stubComplete.resolves()
  const res = await build()
    .put('/api/training/session/2')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.equal(stubComplete.getCall(0).args[0], '2') // params are string type

  t.deepEqual(res.body, { success: true })

  stubComplete.restore()
})

// 'add training session to plan'
// 'remove training session from plan'
test('order training plan', async t => {
  const spyUpdatePlanOrders = sinon.spy(trainingRepository, 'updatePlanOrders')
  const stubDbQuery = sinon.stub(DB.instance(), 'query')
  stubDbQuery.resolves({ rows: [] })
  const res = await build()
    .put('/api/training/plan')
    .send({ orders: [3, 1, 2] })
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.equal(stubDbQuery.getCall(0).args[0], 'TRUNCATE TABLE "training_plan"')
  t.equal(stubDbQuery.getCall(1).args[0], 'INSERT INTO "training_plan" (training_session_id, priority) VALUES (3,0),(1,1),(2,2)')
  t.deepEqual(spyUpdatePlanOrders.getCall(0).args[0], [3, 1, 2])

  t.deepEqual(res.body, { success: true })

  stubDbQuery.restore()
  spyUpdatePlanOrders.restore()
})

test('reset training plan', async t => {
  const spyResetPlan = sinon.spy(trainingRepository, 'resetPlan')
  const stubDbQuery = sinon.stub(DB.instance(), 'query')
  stubDbQuery.resolves({ rows: [] })
  const res = await build()
    .delete('/api/training/plan')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + TOKEN)
    .expect('Content-Type', /json/)
    .expect(200)

  t.equal(stubDbQuery.getCall(0).args[0], 'TRUNCATE TABLE "training_plan"')
  t.ok(spyResetPlan.calledOnce)

  t.deepEqual(res.body, { success: true })

  stubDbQuery.restore()
  spyResetPlan.restore()
})
