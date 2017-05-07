#!/bin/bash
rm -rf node_modules
npm install --production
zip -FSr ./lambda.zip ./node_modules/ ./index.js ./src/idiom.js ./src/twitter.js ./src/helpers.js ./content/nouns.json ./content/qualifiers.json ./content/conditions.json
aws lambda update-function-code --function-name idiom-tweeter --zip-file fileb://./lambda.zip
rm ./lambda.zip
