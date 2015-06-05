'use strict';

var botUtilities = require('bot-utilities');
var fs = require('fs');
var program = require('commander');
var quoteImage = require('./lib/quote-image.js');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);
_.mixin(Twit.prototype, botUtilities.twitMixins);

program
  .command('tweet')
  .description('Generate and tweet an image')
  .option('-r, --random', 'only post a percentage of the time')
  .action(function (options) {
    if (options.random && _.percentChance(98)) {
      console.log('Skipping...');

      process.exit(0);
    }

    quoteImage(function (err, buffer) {
      if (err) {
        throw err;
      }

      var T = new Twit(botUtilities.getTwitterAuthFromEnv());

      T.updateWithMedia({status: ''}, buffer, function (updateError) {
        if (updateError) {
          return console.log('TUWM error', updateError);
        }

        console.log('TUWM OK');
      });
    });
  });

program
  .command('save <filename>')
  .description('Generate and save an image')
  .action(function (filename) {
    quoteImage(function (err, buffer) {
      if (err) {
        throw err;
      }

      fs.writeFileSync(filename, buffer);
    });
  });

program.parse(process.argv);
