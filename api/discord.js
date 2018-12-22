const express = require('express')
const fetch = require('node-fetch')
const btoa = require('btoa')
const cache = require('memory-cache')
const { catchAsync } = require('../utils')

const config = require('../config.json')

const router = express.Router()

const CLIENT_ID = config.CLIENT_ID
const CLIENT_SECRET = config.CLIENT_SECRET
const redirect = encodeURIComponent('http://localhost:8080/api/discord/callback')

router.get('/login', (req, res) => {
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20email`)
})

router.get('/logout', (req, res) => {
  cache.clear()
  res.redirect('/')
})

router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided')
  const code = req.query.code
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`
      }
    })
  const data = await response.json()
  cache.put('userToken', data.access_token)
  res.redirect('/')
}))

module.exports = router
