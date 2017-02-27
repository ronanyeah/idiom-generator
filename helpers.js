'use strict'

const {create, env} = require('sanctuary')

const S = create({
  checkTypes: process.env.NODE_ENV !== 'production',
  env: env
})

// Custom encoding function to comply with RFC3986:
// https://dev.twitter.com/oauth/overview/percent-encoding-parameters
const encode = str =>
  encodeURIComponent(str)
  .replace(
    /[!'()*]/g,
    c =>
      '%' + c.charCodeAt(0).toString(16)
  )

// Encodes keys and values and joins them together.
const objToParamString =
  S.pipe(
    S.toPairs,
    S.mapMaybe(
      S.pipe(
        S.mapMaybe(encode),
        S.join('=')
      )
    ),
    S.join('&')
  )

// HMAC-SHA1 hashing.
const hmacHash = (signingKey, string) =>
  crypto.createHmac('sha1', signingKey).update(string).digest()

module.exports = {
  encode,
  objToParamString,
  hmacHash
}
