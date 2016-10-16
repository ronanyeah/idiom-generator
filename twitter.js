'use strict'

const fetch  = require('node-fetch')
const crypto = require('crypto')
const R      = require('ramda')

const keys = require('./keys.json')

// Custom encoding function to comply with RFC3986:
// https://dev.twitter.com/oauth/overview/percent-encoding-parameters
const encode = str =>
  encodeURIComponent(str).replace(
    /[!'()*]/g,
    c =>
      '%' + c.charCodeAt(0).toString(16)
  )

// Encodes keys and values and joins them together.
const objToParamString = R.pipe(R.toPairs, R.map(R.pipe(R.map(encode), R.join('='))), R.join('&'))

// HMAC-SHA1 hashing.
const hmacHash = (signingKey, string) =>
  crypto.createHmac('sha1', signingKey).update(string).digest()

// Very complicated twitter auth header creation!
const createOauthHeader = (url, method, params) => {

  const nonce = Math.random().toString(16).substring(2)
  const timestamp = Date.now() / 1000

  // TODO Use spread operator when AWS Lambda gets Node 6.
  const requestParameters = [
    ['oauth_consumer_key', keys.consumer_key],
    ['oauth_nonce', nonce],
    ['oauth_signature_method', 'HMAC-SHA1'],
    ['oauth_timestamp', timestamp],
    ['oauth_token', keys.token],
    ['oauth_version', '1.0']
  ]
  .concat(R.toPairs(params || {}))

  // The process to prepare the request parameters.
  // https://dev.twitter.com/oauth/overview/creating-signatures
  const process =
    R.pipe(R.map(R.map(encode)), R.sortBy(R.head), R.map(R.join('=')), R.join('&'))

  const signature = `${method || 'GET'}&${encode(url)}&${encode(process(requestParameters))}`

  const hashedSig =
    hmacHash(
      `${encode(keys.consumer_secret)}&${encode(keys.token_secret)}`, // signing key
      signature
    )

  return 'OAuth ' +
    `oauth_consumer_key="${encode(keys.consumer_key)}", ` +
    `oauth_nonce="${encode(nonce)}", ` +
    `oauth_signature="${encode(hashedSig.toString('base64'))}", ` +
    'oauth_signature_method="HMAC-SHA1", ' +
    `oauth_timestamp="${timestamp}", ` +
    `oauth_token="${encode(keys.token)}", ` +
    'oauth_version="1.0"'
}

const tweet = content =>
  fetch(
    'https://api.twitter.com/1.1/statuses/update.json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          createOauthHeader(
            'https://api.twitter.com/1.1/statuses/update.json',
            'POST',
            { status: content }
          )
      },
      body: objToParamString({ status: content })
    }
  )

const test = _ =>
  fetch(
    'https://api.twitter.com/1.1/statuses/user_timeline.json',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: createOauthHeader('https://api.twitter.com/1.1/statuses/user_timeline.json')
      }
    }
  )

module.exports = {
  tweet,
  test
}
