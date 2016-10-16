'use strict'

const idiom   = require('./idiom.js')
const twitter = require('./twitter.js')

exports.handler =
  (event, context) =>
    twitter.tweet( idiom() )
    .then(console.log)
    .catch(console.log)
