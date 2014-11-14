'use strict';

var Canvas = require('canvas-utilities').Canvas;
var Color = require('color');
var colors = require('colour-extractor');
var glob = require('glob');
var ImageHelper = require('canvas-utilities/lib/image-helper');
var path = require('path');
var textCanvas = require('./text-canvas.js');
var utilities = require('canvas-utilities/lib/utilities');
var _ = require('lodash');

var quotes = require('../data/filtered-quotes.json');

function format(quote, author) {
  return '“' + quote + '”\n\n— ' + author;
}

function randomBackgroundImage(cb) {
  var fullPath = path.resolve(path.dirname(require.main.filename),
    'images/unsplash/*.jpg');

  glob(fullPath, function (err, files) {
    if (err) {
      return cb(err);
    }

    cb(null, _.sample(files));
  });
}

function darkestColor(fileName, cb) {
  colors.topColours(fileName, true, function (colors) {
    var sortedColors = _(colors)
      .map(function (color) {
        return new Color().rgb(color[1]);
      })
      .sortBy(function (color) {
        return color.luminosity();
      })
      .value();

    cb(_.first(sortedColors).alpha(0.6).rgbaString());
  });
}

module.exports = function (cb) {
  var quote;

  var quote1;
  var quote2;

  if (_.random(100) >= 50) {
    quote1 = _.sample(quotes.starts);
    quote2 = _.sample(quotes.ends);

    quote = [quote1.clause, quote2.clause].join(', ');
  } else {
    quote1 = _.sample(quotes.sentences);
    quote2 = _.sample(quotes.sentences);

    quote = [quote1.clause, quote2.clause].join(' ');
  }

  var author = _.flatten([
    _.first(quote1.author.split(/[ ,]/g)),
    _.rest(quote2.author.split(/[ ,]/g))
  ]).join(' ');

  randomBackgroundImage(function (err, fileName) {
    if (err) {
      return cb(err);
    }

    darkestColor(fileName, function (darkest) {
      var image = ImageHelper.fromFile(fileName);

      var scaledWidth = 1024;
      var scaledHeight = Math.round((scaledWidth / image.width) * image.height);

      var canvas = new Canvas(scaledWidth, scaledHeight);
      var context = utilities.getContext(canvas);

      image.context(context).draw(0, 0, scaledWidth, scaledHeight);

      textCanvas(context, scaledWidth, scaledHeight, format(quote, author),
        darkest, 'white');

      canvas.toBuffer(cb);
    });
  });
};
