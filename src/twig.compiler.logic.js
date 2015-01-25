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
      var output = '';

      switch (logic_options.from) {
        // if else from for loop, then use special variable `__last_for_else`
        case 'for':
          logic_options = {};
          output = 'if (!__last_for_else){';
          output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';
          output += '}';
          break;

        default:
          output = 'else {'
          output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';
          output += '}';
      }

      return output;
    };

    Twig.logic.handler['Twig.logic.type.elseif'].toJS = function (token, logic_options) {
      return _utils.ifElseIf(token, 'elseif');
    };

    Twig.logic.handler['Twig.logic.type.for'].toJS = function (token, logic_options) {
      var result = '(' + Twig.expression.toJS.apply(this, [token.expression]) + '||{})',
          conditional = token.conditional ? Twig.expression.toJS.apply(this, [token.conditional]) : false,
          output = '(function () {';

      output += 'var _obj = ' + result + ',_keys = Object.keys(_obj),_l = _keys.length,_loop_cache,i;';
      output += '__last_for_else = false;'
      output += 'if (_l){'; // if length

      // @todo loop_cache should be a loop_cache + hash from result
      output += '_loop_cache = {';
      output +=   'loop: ' + Twig.compiler.js.vars.context + '.loop,';
      output +=   token.value_var + ': ' + Twig.compiler.js.vars.context + '.' + token.value_var;
      if (token.key_var) {
      output +=   ',' + token.key_var + ': ' + Twig.compiler.js.vars.context + '.' + token.key_var;
      }
      output += '};'

      output += Twig.compiler.js.vars.context + '.loop = {'
      output +=   'first: false,';
      output +=   'index: 1,';
      output +=   'index0: 0';
      if (!conditional) {
      output +=   ',revindex: _l,';
      output +=   'revindex0: _l-1,';
      output +=   'length: _l,';
      output +=   'last: false';
      }
      output += '};';

      output += 'if ((_obj instanceof Object) || (_obj instanceof Array)){'; // if is array or object
      output += 'for (i in _obj) {'; // for loop
      output += 'if (_obj.hasOwnProperty(i) && (i != "_keys")) {'; // if hasOwnProperty and not _keys
      output += Twig.compiler.js.vars.context + '.loop.key = ' + token.value_var + ' = i;';
      if (token.key_var) {
      output += Twig.compiler.js.vars.context + '.' + token.key_var + ' = i;';
      }
      output += Twig.compiler.js.vars.context + '.' + token.value_var + ' = _obj[i];';
      output += Twig.compiler.js.vars.context + '.loop.first = ' + Twig.compiler.js.vars.context + '.loop.index0 === 0;';
      if (!conditional) {
        output += Twig.compiler.js.vars.context + '.loop.last = ' + Twig.compiler.js.vars.context + '.loop.revindex0 === 0;';
      }

      if (conditional) {
        output += 'if (' + conditional + '){';
      }
      output += '__last_for_else = true;';

      output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';

      output += Twig.compiler.js.vars.context + '.loop.index += 1;';
      output += Twig.compiler.js.vars.context + '.loop.index0 += 1;';
      if (conditional) {
        output += Twig.compiler.js.vars.context + '.loop.revindex -= 1;';
        output += Twig.compiler.js.vars.context + '.loop.revindex0 -= 1;';
        output += '}';
      }

      output += '}'; // if hasOwnProperty and not _keys end
      output += '}'; // for loop end
      output += '}'; // if is array or object end

      output += Twig.compiler.js.vars.context + '.loop = _loop_cache.loop;';
      output += Twig.compiler.js.vars.context + '.' + token.value_var + ' = _loop_cache.' + token.value_var + ';';
      if (token.key_var) {
        output += Twig.compiler.js.vars.context + '.' + token.key_var + ' = _loop_cache.' + token.key_var + ';';
      }

      if (!conditional) {

      }

      output += '}'; // if length end
      output += '}());';

      if (conditional) {
        logic_options.from = 'for';
      }

      return output;
    };

    Twig.logic.handler['Twig.logic.type.set'].toJS = function (token, logic_options) {
      var value = Twig.expression.toJS.apply(this, [token.expression]);

      return Twig.compiler.js.vars.context + '["' + token.key + '"]=' + value + ';';
    };

    Twig.logic.handler['Twig.logic.type.setcapture'].toJS = function (token, logic_options) {
      var value = Twig.compiler.toJS.apply(this, [token.output]);

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
