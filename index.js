'use strict'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
} else {
  console.log('No environment variables imported.')
}

const { CONSUMER_KEY, CONSUMER_SECRET, TOKEN, TOKEN_SECRET } = process.env

const idiom = require('./src/idiom.js')

const { tweet } = require('./src/twitter.js')(CONSUMER_KEY, CONSUMER_SECRET, TOKEN, TOKEN_SECRET)

exports.handler =
  (_event, _context) =>
    tweet( idiom() )
    .then(console.log)
    .catch(console.log)
