'use strict'

const { consumerKey, consumerSecret, token, tokenSecret } =
  require('./keys.json')
const idiom =
  require('./idiom.js')
const twitter =
  require('./twitter.js')( consumerKey, consumerSecret, token, tokenSecret )

exports.handler =
  (event, context) =>
    twitter.tweet( idiom() )
    .then(console.log)
    .catch(console.log)
