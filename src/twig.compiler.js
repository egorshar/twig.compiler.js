//     Twig.compiler.js
//     Copyright (c) 2015 Egor Sharapov
//     Available under the MIT License
//     https://github.com/egych/twig.compiler.js

// ## twig.compiler.js
//
// This file handles compiling templates into JS
(function (Twig) {
  Twig.extend(function (Twig) {
    Twig.exports.toJS = function (template) {
      var tokens = template.tokens,
          id = template.id,
          that = this,
          context = {},
          output = 'var t = function (ctx) {var o = "";';

      Twig.forEach(tokens, function parseToken(token) {
        Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

        switch (token.type) {
          case Twig.token.type.raw:
            output += 'o += TwigCore.filters.raw("' + (token.value||'').replace(/\"/g, '\\"') + '");';
            // output.push(Twig.filters.raw(token.value));
            break;

          case Twig.token.type.logic:
            var logic_token = token.token,
                logic = Twig.logic.parse.apply(that, [logic_token, context, chain]);

            if (logic.chain !== undefined) {
                chain = logic.chain;
            }
            if (logic.context !== undefined) {
                context = logic.context;
            }
            if (logic.output !== undefined) {
                output.push(logic.output);
            }
            break;

          case Twig.token.type.comment:
            // Do nothing, comments should be ignored
            break;

          // case Twig.token.type.output:
          //   Twig.log.debug("Twig.parse: ", "Output token: ", token.stack);
          //   // Parse the given expression in the given context
          //   console.log()
          //   output += Twig.expression.jscompile.apply(that, [token.stack, context]);
          //   break;
        }
      });

      output += 'return o;}';

      return output;
    };
  });
}(Twig || {}));
