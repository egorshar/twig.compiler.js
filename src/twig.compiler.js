//  Twig.compiler.js
//  Copyright (c) 2015 Egor Sharapov
//  Available under the MIT License
//  https://github.com/egych/twig.compiler.js
(function (Twig) {
  Twig.extend(function (Twig) {
    if (!Twig.compiler) {
      throw new Twig.Error("Twig.compiler not found.");
    }

    // It all starts here
    Twig.compiler.toJS = function (tokens) {
      var logic_options = {},
          _this = this,
          output = '(function (' + Twig.compiler.js.vars.context + ') {var ' + Twig.compiler.js.vars.output + ' = "";';

      Twig.forEach(tokens, function parseToken(token) {
        switch (token.type) {
          // Raw output
          case Twig.token.type.raw:
            output += Twig.compiler.js.vars.output + ' += "' + Twig.compiler.js.helpers.escapeQuotes(token.value) + '";';
            break;

          // Logic expression (tags)
          case Twig.token.type.logic:
            output += Twig.logic.toJS.apply(_this, [token.token, logic_options]);
            break;

          case Twig.token.type.comment:
            // Do nothing, comments should be ignored
            break;

          // Resolve expression
          case Twig.token.type.output:
            output += Twig.compiler.js.vars.output + ' += ' + Twig.expression.toJS.apply(_this, [token.stack]) + ';';
            break;
        }
      });

      output += 'return ' + Twig.compiler.js.vars.output + ';}(' + Twig.compiler.js.vars.context + ')||"");';

      return output;
    };

    Twig.exports.toJS = function (template) {
      var tokens = template.tokens;

      return 'var t = function (' + Twig.compiler.js.vars.context + ') {var __last_for_else=false;return ' + Twig.compiler.toJS(tokens) + '};';
    };
  });
}(Twig || {}));
