'use strict'

/*
i. Creating a new training session and adding it to the
training-sessions-bank
ii. Dragging training sessions from the training-sessions-bank to his training
plan to add a training session to his training plan
iii. Removing a training session from the training plan back to the bank
iv. Re-ordering his training plan by dragging the training sessions
v. Resetting the training plan (moving all the training sessions to the bank)
vi. Marking a training session as completed
vii. Deleting training plans from the bank
*/

const express = require('express')
const { body, param, validationResult } = require('express-validator')
const authenticated = require('./authenticated')
const trainingRepository = require('../repository/training')

function init (app) {
  const router = express.Router()

  function onAllSession (req, res, next) {
    const userId = req.user.id
    Promise.all([trainingRepository.getInPlan(userId), trainingRepository.getInBank(userId)])
      .then(([plan, bank]) => {
        res.json({
          data: {
            plan, bank
          }
        })
      })
      .catch(next)
  }

  function onCreateSession (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const { title, description } = req.body

    trainingRepository.createSession({ title, description, userId: req.user.id }).then(data => {
      res.json({ data })
    }).catch(next)
  }

  function onCompleteSession (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    trainingRepository.complete(req.params.id, req.user.id).then(() => {
      res.json({ success: true })
    }).catch(next)
  }

  function onRemoveSession (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    trainingRepository.removeSession(req.params.id, req.user.id).then(() => {
      res.json({ success: true })
    }).catch(next)
  }

  function onOrderPlan (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    // todo all ts must belong to the logged-in user
    trainingRepository.updatePlanOrders(req.body.orders, req.user.id).then(() => {
      res.json({ success: true })
    }).catch(next)
  }

  function onResetPlan (req, res, next) {
    trainingRepository.resetPlan(req.user.id).then(() => {
      res.json({ success: true })
    }).catch(next)
  }

  router.get('/session', onAllSession)

  router.post('/session', [
    body(['title', 'description']).isLength({ min: 3 })
  ], onCreateSession)

  router.put('/session/:id', [
    param('id').isInt()
  ], onCompleteSession)

  router.delete('/session/:id', [
    param('id').isInt()
  ], onRemoveSession)

  router.put('/plan', [body('orders').isArray({ min: 1 })], onOrderPlan)
  router.delete('/plan', onResetPlan)

  app.use('/api/training', authenticated, router)
}

module.exports = init
