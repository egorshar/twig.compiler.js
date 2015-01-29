var assert = require("assert");
var helpers = require('./helpers');

var params = {
  parser: GLOBAL.twig,
  compiler: GLOBAL.TwigCompiler,
  assert: assert,
  _twig: GLOBAL._twig
};

describe("Twig.js Regression Tests ->", function() {
  it("\#47 should not match variables starting with not", function() {
    // Define and save a template
    helpers.assert(params, [
      {
        data: '{% for note in notes %}{{note}}{% endfor %}',
        context: {notes:['a', 'b', 'c']}
      }
    ]);
  });

  // it("\#56 functions work inside parentheses", function() {
  //     // Define and save a template
  //     Twig.extendFunction('custom', function(value) {
  //         return true;
  //     });

  //     twig({data: '{% if (custom("val") and custom("val")) %}out{% endif %}'}).render({}).should.equal("out");
  // });

  it("\#83 Support for trailing commas in arrays", function() {
    helpers.assert(params, [
      '{{ [1,2,3,4,] }}'
    ]);
  });

  it("\#83 Support for trailing commas in objects", function() {
    helpers.assert(params, [
      '{{ {a:1, b:2, c:3, } }}'
    ]);
  });
});
