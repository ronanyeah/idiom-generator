'use strict'

const { contains } = require('ramda')

const nouns = require('../content/nouns.json')
const qualifiers = require('../content/qualifiers.json')
const conditions = require('../content/conditions.json')

const random =
  arr => arr[ Math.floor( Math.random() * arr.length ) ]

const prefix =
  x =>
    contains( x[0], 'aeiou' )
      ? `an ${x}`
      : `a ${x}`

module.exports =
  () =>
    `As ${random(qualifiers)} as ${prefix(random(nouns))} ${random(conditions)}.`
