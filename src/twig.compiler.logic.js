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
          output = 'if (!' + logic_options.for_else + '){';
          output += Twig.compiler.js.vars.output + ' += ' + Twig.compiler.toJS.apply(this, [token.output]) + ';';
          output += '}';

          logic_options.from = undefined;
          logic_options.for_else = undefined;
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
          loop_fn_params = '',
          for_else,
          output = '';

      if (!logic_options.for_loop_exists) {
        logic_options.for_loop_exists = true;

        output = 'var ' + Twig.compiler.js.vars.for_loop + ' = function (_for_iterator, _obj, _for_item, _for_condition, _for_key) {';

        output += 'var _keys = Object.keys(_obj),_l = _keys.length,_loop_cache,i,_for_else = false;';
        output += 'if (_l){'; // if length

        // @todo loop_cache should be a loop_cache + hash from result
        output += '_loop_cache = {';
        output +=   'loop: ' + Twig.compiler.js.vars.context + '.loop,';
        output +=   'item: ' + Twig.compiler.js.vars.context + '[_for_item]';
        output += '};'
        output += 'if (_for_key !== undefined){_loop_cache.key = ' + Twig.compiler.js.vars.context + '[_for_key];}'

        output += Twig.compiler.js.vars.context + '.loop = {'
        output +=   'first: false,';
        output +=   'index: 1,';
        output +=   'index0: 0';
        output += '};';

        output += 'if (_for_condition === undefined){';
        output += Twig.compiler.js.vars.context + '.loop.revindex = _l;';
        output += Twig.compiler.js.vars.context + '.loop.revindex0 = _l-1;';
        output += Twig.compiler.js.vars.context + '.loop.length = _l;';
        output += Twig.compiler.js.vars.context + '.loop.last = false;';
        output += '}';

        output += 'if ((_obj instanceof Object) || (_obj instanceof Array)){'; // if is array or object
        output += 'for (i in _obj) {'; // for loop
        output += 'if (_obj.hasOwnProperty(i) && (i != "_keys")) {'; // if hasOwnProperty and not _keys
        output += Twig.compiler.js.vars.context + '.loop.key = i;';
        output += 'if (_for_key !== undefined){' + Twig.compiler.js.vars.context + '[_for_key] = i;}'
        output += Twig.compiler.js.vars.context + '[_for_item] = _obj[i];';
        output += Twig.compiler.js.vars.context + '.loop.first = ' + Twig.compiler.js.vars.context + '.loop.index0 === 0;';
        output += 'if (_for_condition === undefined){';
        output += Twig.compiler.js.vars.context + '.loop.last = ' + Twig.compiler.js.vars.context + '.loop.revindex0 === 0;';
        output += '}';

        output += 'if (_for_condition === undefined || _for_condition(' + Twig.compiler.js.vars.context + ')){'; // condition start
        output += '_for_else = true;';

        output += Twig.compiler.js.vars.output + ' += _for_iterator(' + Twig.compiler.js.vars.context + ');';

        output += Twig.compiler.js.vars.context + '.loop.index += 1;';
        output += Twig.compiler.js.vars.context + '.loop.index0 += 1;';
        output += 'if (_for_condition === undefined){';
        output += Twig.compiler.js.vars.context + '.loop.revindex -= 1;';
        output += Twig.compiler.js.vars.context + '.loop.revindex0 -= 1;';
        output += '}';
        output += '}'; // condition end

        output += '}'; // if hasOwnProperty and not _keys end
        output += '}'; // for loop end
        output += '}'; // if is array or object end

        output += Twig.compiler.js.vars.context + '.loop = _loop_cache.loop;';
        output += Twig.compiler.js.vars.context + '[_for_item] = _loop_cache[_for_item];';
        output += 'if (_for_key !== undefined){' + Twig.compiler.js.vars.context + '[_for_key] = _loop_cache[_for_key];}'

        output += '}'; // if length end
        output += 'return _for_else;';
        output += '};';
      }

      loop_fn_params += 'function (' + Twig.compiler.js.vars.context + ') {return ' + Twig.compiler.toJS.apply(this, [token.output]) + '},';
      loop_fn_params += result + ',"' + token.value_var + '",';
      loop_fn_params += conditional ? 'function (' + Twig.compiler.js.vars.context + ') {return ' + conditional + ';}' : 'undefined';
      if (token.key_var) {
      loop_fn_params += ',"' + token.key_var + '"';
      }

      for_else = Twig.compiler.js.vars.for_else + Twig.compiler.js.helpers.hashCode(loop_fn_params);
      output += 'var ' + for_else + ' = ' + Twig.compiler.js.vars.for_loop + '(' + loop_fn_params + ');';

      if (conditional) {
        logic_options.from = 'for';
        logic_options.for_else = for_else;
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
