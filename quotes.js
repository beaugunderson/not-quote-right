'use strict';

var fs = require('fs');
var parse = require('csv-parse');
var sentence = require('sentence-tools');
var _ = require('lodash');

var sentences = [];
var starts = [];
var ends = [];

function handleQuote(record) {
  sentence.tokenize(record.quote, function (err, quoteSentences) {
    if (err) {
      throw err;
    }

    quoteSentences.forEach(function (quoteSentence) {
      var clauses = quoteSentence.split(', ');

      if (clauses.length > 1) {
        // We only want the starting and ending clause
        var start = _.first(clauses);
        var end = _.last(clauses);

        ends.push({clause: end, author: record.author});
        starts.push({clause: start, author: record.author});
      } else if (quoteSentences.length > 1) {
        sentences.push({clause: quoteSentence, author: record.author});
      }
    });
  });
}

var parser = parse({delimiter: ';', columns: ['quote', 'author', 'genre']});

parser.on('readable', function () {
  var record;

  while ((record = parser.read())) {
    handleQuote(record);
  }
});

parser.on('finish', function () {
  console.log(starts.length, ends.length, sentences.length);

  var output = JSON.stringify({
    starts: starts,
    ends: ends,
    sentences: sentences
  }, null, 2);

  fs.writeFileSync('./data/filtered-quotes.json', output);
});

fs.createReadStream('./data/quotes.csv').pipe(parser);
