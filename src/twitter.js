'use strict'

const fetch  = require('node-fetch')
const { createOauthHeader, objToParamString } = require('./helpers.js')

module.exports = (consumerKey, consumerSecret, token, tokenSecret) => ({
  tweet: content =>
    fetch(
      'https://api.twitter.com/1.1/statuses/update.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            createOauthHeader(
              'https://api.twitter.com/1.1/statuses/update.json',
              consumerKey, consumerSecret, token, tokenSecret,
              'POST',
              { status: content }
            )
        },
        body: objToParamString({ status: content })
      }
    ),

  test: () =>
    fetch(
      'https://api.twitter.com/1.1/statuses/user_timeline.json',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            createOauthHeader(
              'https://api.twitter.com/1.1/statuses/user_timeline.json',
              consumerKey, consumerSecret, token, tokenSecret
            )
        }
      }
    )
})
