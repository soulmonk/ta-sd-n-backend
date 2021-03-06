'use strict'

const express = require('express')

const userRepository = require('../repository/user')
const { body, validationResult } = require('express-validator')
const authenticated = require('./authenticated')
const { useAsyncHandler } = require('./helpers')

function authHandler (app) {
  const router = express.Router()

  const signUpSchema = [
    body('name').isLength({ min: 4, max: 64 }),
    body('email').isEmail(),
    // password must be at least 6 chars long
    body('password').isLength({ min: 6 })
  ]

  const onSignUp = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body

    let user = await userRepository.getUserByEmail(email)
    if (user) {
      return res.status(409).json({ errors: [`User "${name}" already exists`] })
    }

    user = await userRepository.create({ name, email, password })

    const token = await userRepository.generateToken(user)

    res.json({ data: { name, token } })
  }
  const signInSchema = [
    body('email').isEmail(),
    // password must be at least 6 chars long
    body('password').isLength({ min: 6 })
  ]

  const onSignIn = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    const error = () => res.status(400).json({
      errors: ['Wrong name or password']
    })

    const { email, password } = req.body

    const user = await userRepository.getUserByEmail(email)
    if (!user) {
      return error()
    }

    const validPwd = await userRepository.checkPassword(password, user.password)
    if (!validPwd) {
      return error()
    }

    const token = await userRepository.generateToken(user)

    res.json({ data: { name: user.name, token } })
  }

  const onSignOut = async (req, res) => {
    res.json({ errors: ['sign-out'], message: 'not implemented' })
  }

  router.post('/sign-up', signUpSchema, useAsyncHandler(onSignUp))
  router.post('/sign-in', signInSchema, useAsyncHandler(onSignIn))
  router.post('/sign-out', authenticated, useAsyncHandler(onSignOut))

  app.use('/api/auth', router)
}

module.exports = authHandler
