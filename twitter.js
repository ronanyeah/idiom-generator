// @flow

'use strict'

const fetch  = require('node-fetch')
const crypto = require('crypto')
const R      = require('ramda')

const {create, env} = require('sanctuary')

const S = create({
  checkTypes: process.env.NODE_ENV !== 'production',
  env: env
})

const { encode, objToParamString, hmacHash } = require('./helpers.js')

module.exports = function (consumerKey /* :string */, consumerSecret /* :string */, token /* :string */, tokenSecret /* :string */) {

  // Very complicated twitter auth header creation!
  const createOauthHeader = (url, method, params) => {

    const nonce = crypto.randomBytes(10).toString('hex')
    const timestamp = Date.now() / 1000

    // TODO Use spread operator when AWS Lambda gets Node 6.
    const requestParameters = [
      ['oauth_consumer_key', consumerKey],
      ['oauth_nonce', nonce],
      ['oauth_signature_method', 'HMAC-SHA1'],
      ['oauth_timestamp', timestamp],
      ['oauth_token', token],
      ['oauth_version', '1.0']
    ]
    .concat(R.toPairs(params || {}))

    // The process to prepare the request parameters.
    // https://dev.twitter.com/oauth/overview/creating-signatures
    const process =
      R.pipe(R.map(R.map(encode)), R.sortBy(R.head), R.map(R.join('=')), R.join('&'))

    const signature =
      `${method || 'GET'}&${encode(url)}&${encode(process(requestParameters))}`

    const hashedSig =
      hmacHash(
        `${encode(consumerSecret)}&${encode(tokenSecret)}`, // signing key
        signature
      )

    return 'OAuth ' +
      `oauth_consumer_key="${encode(consumerKey)}", ` +
      `oauth_nonce="${encode(nonce)}", ` +
      `oauth_signature="${encode(hashedSig.toString('base64'))}", ` +
      'oauth_signature_method="HMAC-SHA1", ' +
      `oauth_timestamp="${timestamp}", ` +
      `oauth_token="${encode(token)}", ` +
      'oauth_version="1.0"'
  }

  const tweet = (content /* :string */)/* :Promise<Object> */ =>
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

  const test = (_ /* :null */)/* :Promise<Object> */ =>
    fetch(
      'https://api.twitter.com/1.1/statuses/user_timeline.json',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: createOauthHeader('https://api.twitter.com/1.1/statuses/user_timeline.json')
        }
      }
    )

  return {
    tweet,
    test
  }
}
