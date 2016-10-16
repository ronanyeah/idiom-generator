'use strict'

const R = require('ramda')

const nouns      = require('./nouns.json')
const qualifiers = require('./qualifiers.json')
const conditions = require('./conditions.json')

const random =
  arr => R.nth( Math.floor( Math.random() * arr.length ), arr )
const prefix =
  x => R.contains( R.nth(0, x), 'aeiou' ) ? `an ${x}` : `a ${x}`

module.exports =
  _ =>
    `As ${random(qualifiers)} as ${prefix(random(nouns))} ${random(conditions)}.`
