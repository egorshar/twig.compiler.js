var assert = require("assert");
var helpers = require('./helpers');

var params = {
  parser: GLOBAL.twig,
  compiler: GLOBAL.TwigCompiler,
  assert: assert,
  _twig: GLOBAL._twig
};

describe("Twig.js Tags ->", function() {
  it("should support spaceless", function() {
    helpers.assert(params, [
      "{% spaceless %}<div>\n    <b>b</b>   <i>i</i>\n</div>{% endspaceless %}"
    ]);
  });
});
