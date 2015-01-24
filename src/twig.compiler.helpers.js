//  Twig.compiler.helpers.js
//  Copyright (c) 2015 Egor Sharapov
//  Available under the MIT License
//  https://github.com/egych/twig.compiler.js
(function (Twig) {
  Twig.extend(function (Twig) {
    if (!Twig.compiler) {
      throw new Twig.Error("Twig.compiler not found.");
    }

    Twig.compiler.js = {
      vars: {
        context: 'ctx',
        output: 'o'
      },

      helpers: {}
    };

    Twig.compiler.js.helpers.regex = {
      space_between_tags: />\s+</g,
      new_lines_between_tags: />[\n|\r]{1,}</g,
      slashes: /\\/g,
      new_lines: /\n|\r/g,
      quotes: /\"\'/g
    };

    // Escape raw value
    Twig.compiler.js.helpers.escapeQuotes = function (str) {
      return (str||'')
        .toString()
        .replace(Twig.compiler.js.helpers.regex.slashes, '\\\\')
        .replace(Twig.compiler.js.helpers.regex.new_lines, '\\n')
        .replace(Twig.compiler.js.helpers.regex.quotes, '\\"');
    };

    // Get value from context
    Twig.compiler.js.helpers.resolveValue = function (value) {
      var ctx_val = Twig.compiler.js.vars.context + '["' + Twig.compiler.js.helpers.escapeQuotes(value) + '"]';
      return '(' + ctx_val + ' !== undefined ? ' + ctx_val + ' : "")';
    };
  });
}(Twig || {}));
