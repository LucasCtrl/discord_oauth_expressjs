const express = require('express')
const path = require('path')
const hbs = require('express-handlebars')
const fetch = require('node-fetch')
const cache = require('memory-cache')

const app = express()

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/api/discord', require('./api/discord'))

app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message
      })
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message
      })
  }
})

app.get('/', (req, res) => {
  var userToken = cache.get('userToken')
  if (!userToken) {
    res.render('index', { login: true, userData: null })
  } else {
    fetch('http://discordapp.com/api/users/@me', {
      method: 'get',
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })
      .then(res => res.json())
      .then(data => { cache.put('userInfo', data) })
      .then(data => res.render('index', { login: false, userData: cache.get('userInfo'), userToken: userToken }))
  }
})

app.listen(8080, () => {
  console.info('Running on port 8080')
})
