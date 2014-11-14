'use strict';

var utilities = require('canvas-utilities/lib/utilities');
var _ = require('lodash');

var FONT_SIZE = 32;
var PADDING = FONT_SIZE;
var LINE_HEIGHT = Math.round(FONT_SIZE * 1.6);

module.exports = function (context, width, height, text, background, foreground) {
  utilities.prettyContext(context);

  context.font = FONT_SIZE + 'pt Helvetica';

  context.textAlign = 'left';
  context.textBaseline = 'top';

  function splitIntoLines(words) {
    var i;
    var line;
    var splitLines = [];

    while (words.length) {
      for (i = 1; i <= words.length; i++) {
        line = words.slice(0, i).join(' ');

        var lineWidth = context.measureText(line).width;

        if (lineWidth + (PADDING * 2) > width) {
          splitLines.push(words.slice(0, i - 1).join(' '));

          words = words.slice(i - 1);

          break;
        } else if (i === words.length) {
          splitLines.push(words.slice(0, i).join(' '));

          words = words.slice(i);

          break;
        }
      }
    }

    return splitLines;
  }

  var lines = _(text.split('\n'))
    .map(function (words) {
      return splitIntoLines(words.split(' '));
    })
    .flatten()
    .value();

  var textHeight = lines.length * LINE_HEIGHT;

  // Center the image within Twitter's center preview
  var twoToOneHeight = width / 2;
  var twoToOnePadding = (height - twoToOneHeight) / 2;

  var randomOffset = _.random(twoToOnePadding + PADDING,
                              height - textHeight - PADDING - twoToOnePadding);

  context.beginPath();
  context.rect(PADDING / 2,
               randomOffset - (PADDING / 2),
               width - PADDING,
               (lines.length * LINE_HEIGHT) + PADDING);
  context.fillStyle = background;
  context.fill();

  context.fillStyle = foreground;

  lines.forEach(function (line, i) {
    var x = PADDING;
    var y = randomOffset + (LINE_HEIGHT * i);

    context.fillText(line, x, y);
  });
};
