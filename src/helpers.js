'use strict'

const crypto = require('crypto')
const { toPairs, pipe, map, sortBy, head, join } = require('ramda')

// HMAC-SHA1 hashing.
const hmacHash = (signingKey, string) =>
  crypto.createHmac('sha1', signingKey).update(string).digest()

// Custom encoding function to comply with RFC3986:
// https://dev.twitter.com/oauth/overview/percent-encoding-parameters
// String -> String
const encode = str =>
  encodeURIComponent(str)
  .replace(
    /[!'()*]/g,
    c =>
      '%' + c.charCodeAt(0).toString(16)
  )

// Very complicated twitter auth header creation!
// (String * 5, ?String, ?Object) -> String
const createOauthHeader = (url, consumerKey, consumerSecret, token, tokenSecret, method = 'GET', params = {}) => {

  const nonce = crypto.randomBytes(10).toString('hex')
  const timestamp = Date.now() / 1000

  const requestParameters = [
    ['oauth_consumer_key', consumerKey],
    ['oauth_nonce', nonce],
    ['oauth_signature_method', 'HMAC-SHA1'],
    ['oauth_timestamp', timestamp],
    ['oauth_token', token],
    ['oauth_version', '1.0'],
    ...toPairs(params)
  ]

  // The process to prepare the request parameters.
  // https://dev.twitter.com/oauth/overview/creating-signatures
  // [[String, String]] -> String
  const process =
    pipe(
      map(map(encode)),
      sortBy(head),
      map(join('=')),
      join('&')
    )

  const signingKey = `${encode(consumerSecret)}&${encode(tokenSecret)}`

  const signature = `${method}&${encode(url)}&${encode(process(requestParameters))}`

  const hashedSignature =
    hmacHash(
      signingKey,
      signature
    )

  return 'OAuth ' +
    `oauth_consumer_key="${encode(consumerKey)}", ` +
    `oauth_nonce="${encode(nonce)}", ` +
    `oauth_signature="${encode(hashedSignature.toString('base64'))}", ` +
    'oauth_signature_method="HMAC-SHA1", ' +
    `oauth_timestamp="${timestamp}", ` +
    `oauth_token="${encode(token)}", ` +
    'oauth_version="1.0"'
}

// Encodes keys and values and joins them together.
// Object -> String
const objToParamString =
  pipe(
    toPairs,
    map(
      pipe(
        map(encode),
        join('=')
      )
    ),
    join('&')
  )

module.exports = {
  objToParamString,
  createOauthHeader
}
