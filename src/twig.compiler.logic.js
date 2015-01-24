//  Twig.compiler.logic.js
//  Copyright (c) 2015 Egor Sharapov
//  Available under the MIT License
//  https://github.com/egych/twig.compiler.js
(function (Twig) {
  Twig.extend(function (Twig) {
    var _utils = {};

    if (!Twig.logic) {
      throw new Twig.Error("Twig.logic not found.");
    }

    _utils.ifElseIf = function (token, expr) {
      var output,
          result = Twig.expression.toJS.apply(this, [token.stack]);

      expr = expr || 'if';

      output = expr + '(' + result + '){';
      output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';
      output += '}';

      return output;
    };

    Twig.logic.handler['Twig.logic.type.if'].toJS = function (token, logic_options) {
      return _utils.ifElseIf(token);
    };

    Twig.logic.handler['Twig.logic.type.else'].toJS = function (token, logic_options) {
      var output = 'else {';

      switch (logic_options.from) {
        case 'for':
          logic_options = {};
          break;

        default:
          output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';
          output += '}';
      }

      return output;
    };

    Twig.logic.handler['Twig.logic.type.elseif'].toJS = function (token, logic_options) {
      return _utils.ifElseIf(token, 'elseif');
    };

    Twig.logic.handler['Twig.logic.type.set'].toJS = function (token, logic_options) {
      var output,
          value = Twig.expression.toJS.apply(this, [token.expression]);

      return Twig.compiler.js.vars.context + '["' + token.key + '"]=' + value + ';';
    };

    Twig.logic.handler['Twig.logic.type.setcapture'].toJS = function (token, logic_options) {
      var output,
          value = Twig.compiler.toJS.apply(this, [token.output]);

      return Twig.compiler.js.vars.context + '["' + token.key + '"]=' + value + ';';
    };

    Twig.logic.handler['Twig.logic.type.filter'].toJS = function (token, logic_options) {
      var unfiltered = Twig.compiler.toJS.apply(this, [token.output]),
          stack  = [{
            type: Twig.expression.type.number,
            value: unfiltered.replace(/\;$/, '')
          }].concat(token.stack);

      return Twig.compiler.js.vars.output + ' += ' + Twig.expression.toJS.apply(this, [stack]) + ';';
    };

    Twig.logic.handler['Twig.logic.type.spaceless'].toJS = function (token, logic_options) {
      var unfiltered = Twig.compiler.toJS.apply(this, [token.output]);

      return Twig.compiler.js.vars.output + ' += ' + unfiltered
        .replace(Twig.compiler.js.helpers.regex.space_between_tags, '><')
        .replace(Twig.compiler.js.helpers.regex.new_lines_between_tags, '')
        .trim();
    };

    Twig.logic.toJS = function (token, logic_options) {
      var output = '',
          token_template;

      token_template = Twig.logic.handler[token.type];

      if (token_template.toJS) {
        output = token_template.toJS.apply(this, [token, logic_options]);
      }

      return output;
    };
  });
}(Twig || {}));
