(function (global, Twig) {
  if (typeof define == 'function' && define.amd) {
    define(function() {
      return Twig;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    // Provide a CommonJS Modules/1.1 module
    module.exports = Twig;
  } else {
    // Export for browser use
    global.Twig = Twig;
  }
}(this, function (Twig) {
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
        twig: '_twig',
        context: 'ctx',
        output: 'o',
        for_loop: '_for_loop',
        for_else: '_for_else_',
        index_of_fn: '_index_of'
      },

      helpers: {}
    };

    Twig.compiler.js.helpers.regex = {
      space_between_tags: />\s+</g,
      new_lines_between_tags: />[\\n\s|\\r\s]{1,}</g,
      slashes: /\\/g,
      new_lines: /\n|\r/g,
      quotes: /(\"|\')/g
    };

    // Escape raw value
    Twig.compiler.js.helpers.escapeQuotes = function (str) {
      return (str||'')
        .toString()
        .replace(Twig.compiler.js.helpers.regex.slashes, '\\\\')
        .replace(Twig.compiler.js.helpers.regex.new_lines, '\\n')
        .replace(Twig.compiler.js.helpers.regex.quotes, '\\$1');
    };

    // Get value from context
    Twig.compiler.js.helpers.resolveValue = function (value) {
      var ctx_val = Twig.compiler.js.vars.context + '["' + Twig.compiler.js.helpers.escapeQuotes(value) + '"]';
      return '(typeof ' + ctx_val + ' == "function" ? ' + ctx_val + '() : ' + ctx_val + ')';
    };

    Twig.compiler.js.helpers.isInt = function (n) {
      return Number(n)===n && n%1===0;
    };

    Twig.compiler.js.helpers.hashCode = function (s) {
      return (s.split("").reduce(function(a, b){
        a = ((a<<5)-a)+b.charCodeAt(0);
        return a & a;
      }, 0)||"").toString().replace(/[^\d]/g, '');
    };

    Twig.compiler.js.helpers.parseValue = function (value) {
      var is_json;

      try {
        is_json = JSON.parse(value);

        switch (is_json) {
          case 'true': is_json = true; break;
          case 'false': is_json = false; break;
        }
      } catch (e) {}

      if (is_json !== undefined) {
        if ((typeof is_json === 'boolean') || (typeof is_json === 'number')) {
          return is_json;
        }
      }

      return value;
    }
  });
}(Twig || {}));

//  Twig.compiler.expression.js
//  Copyright (c) 2015 Egor Sharapov
//  Available under the MIT License
//  https://github.com/egych/twig.compiler.js
(function (Twig) {
  Twig.extend(function (Twig) {
    if (!Twig.expression) {
      throw new Twig.Error("Twig.expression not found.");
    }

    Twig.expression.handler['Twig.expression.type.test'].toJS = function (token, stack) {
      var value = Twig.compiler.js.helpers.parseValue(stack.pop()),
          params = (token.params && Twig.expression.toJS.apply(this, [token.params])) || '[]',
          is_json;

      stack.push(
        '(' +
        (token.modifier == 'not' ? '!' : '') +
        '_twig.test("' + token.filter + '",(' + value + '),' + params + ')' +
        ')'
      );
    };

    Twig.expression.handler['Twig.expression.type.operator.binary'].toJS = function (token, stack, logic_options) {
      if (token.key) {
        // handle ternary ':' operator
        stack.push(token);
      } else {
        Twig.expression.operator.toJS(token.value, stack, logic_options);
      }
    };

    Twig.expression.handler['Twig.expression.type.operator.unary'].toJS = function(token, stack, logic_options) {
      Twig.expression.operator.toJS(token.value, stack, logic_options);
    };

    Twig.expression.handler['Twig.expression.type.string'].toJS = function(token, stack) {
      stack.push('"' + Twig.compiler.js.helpers.escapeQuotes(token.value) + '"');
    };

    Twig.expression.handler['Twig.expression.type.parameter.start'].toJS = Twig.expression.fn.parse.push;

    Twig.expression.handler['Twig.expression.type.parameter.end'].toJS = function(token, stack, context) {
      var new_array = [],
          array_ended = false,
          value = '';

      if (token.expression) {
        value = Twig.expression.toJS.apply(this, [token.params]);
        stack.push(value);
      } else {
        while (stack.length > 0) {
          value = stack.pop();

          // Push values into the array until the start of the array
          if (value && value.type && value.type == Twig.expression.type.parameter.start) {
            array_ended = true;
            break;
          }

          new_array.unshift(Twig.compiler.js.helpers.parseValue(value));
        }

        if (!array_ended) {
          throw new Twig.Error("Expected end of parameter set.");
        }

        stack.push('[' + new_array.join(',') + ']');
      }
    };

    Twig.expression.handler['Twig.expression.type.array.start'].toJS = Twig.expression.fn.parse.push;

    Twig.expression.handler['Twig.expression.type.array.end'].toJS = function(token, stack) {
      var arr;

      Twig.expression.handler['Twig.expression.type.array.end'].parse.apply({}, [token, stack]);
      arr = stack.pop();

      stack.push('[' + arr.join(',') + ']');
    };

    Twig.expression.handler['Twig.expression.type.object.start'].toJS = Twig.expression.fn.parse.push;

    Twig.expression.handler['Twig.expression.type.object.end'].toJS = function(end_token, stack, context) {
      var new_object = {},
          object_ended = false,
          token = null,
          has_value = false,
          value = null,
          _keys = [],
          output = [];

      while (stack.length > 0) {
        token = stack.pop();

        if (token && token.type && token.type === Twig.expression.type.object.start) {
          object_ended = true;
          break;
        }
        if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
          output.push('"' + token.key + '":' + value);
          _keys.push(token.key);

          // reset value check
          value = null;
          has_value = false;
        } else {
          has_value = true;
          value = token;
        }
      }

      stack.push('{' + output.join(',') + (output.length ? ',' : '') + (_keys.length ? '_keys:["' + _keys.reverse().join('","') + '"]' : '') + '}');
    };

    Twig.expression.handler['Twig.expression.type.filter'].toJS = function(token, stack) {
      var input = stack.pop(),
          params = (token.params && Twig.expression.toJS.apply(this, [token.params])) || '[]',
          else_output = '';

      switch (token.value) {
        case 'date':
          else_output = '||""';
          break;
        case 'json_encode':
          // strange logic, but `json_encode` should return `null`, if value `undefined`
          break;

        case 'first':
          input = '(' + input + '.length) || (' + input + '._keys) ? ' + input + ' : ""';
          break;

        case 'join':
        case 'keys':
          input = '(' + input + ')||{}';
          break;

        default:
          input = '(' + input + ')||""';
          break;
      }

      stack.push(
        '(' +
        '_twig.filter.apply({}, ["' + token.value + '",(' + input + '),' + params + '])' +
        else_output +
        ')'
      );
    };

    Twig.expression.handler['Twig.expression.type._function'].toJS = function(token, stack) {
      var params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {}),
          fn = token.fn,
          value = '';

      value = '(' +
        '(_twig.functions["' + fn + '"] && _twig.functions["' + fn + '"].apply({}, ' + params + '))||' +
        '((typeof ctx["' + fn + '"]=="function")&&(ctx["' + fn + '"].apply(ctx, ' + params + ')))||' +
        '""' +
        ')';

      stack.push(value);
    };

    Twig.expression.handler['Twig.expression.type.variable'].toJS = function(token, stack) {
      // Get the variable from the context
      stack.push(Twig.compiler.js.helpers.resolveValue(token.value));
    };

    Twig.expression.handler['Twig.expression.type.key.period'].toJS = function(token, stack, context) {
      var key = Twig.compiler.js.helpers.isInt(token.key) ? token.key : ('"' + token.key + '"'),
          object = stack.pop();

      stack.push('(' + Twig.compiler.js.vars.twig + '.lib.key((' + object + '||{}), ' + key + '))');
    };

    Twig.expression.handler['Twig.expression.type.key.brackets'].toJS = function(token, stack, context) {
      // Evaluate key
      var key = Twig.expression.toJS.apply(this, [token.stack]),
          object = stack.pop(),
          output = '((';;

      output += '((typeof ' + object + ' === "object") && (' + key + ' in ' + object + ')) &&';
      output += object + '[' + key + ']';
      output += ')||null)';

      stack.push(output);
    };

    Twig.expression.handler['Twig.expression.type.null'].toJS = Twig.expression.fn.parse.push_value;

    Twig.expression.handler['Twig.expression.type.context'].toJS = function(token, stack, context) {
      stack.push(Twig.compiler.js.vars.context);
    };

    Twig.expression.handler['Twig.expression.type.number'].toJS = Twig.expression.fn.parse.push_value;
    Twig.expression.handler['Twig.expression.type.bool'].toJS = function (token, stack) {
      stack.push('"' + token.value + '"');
    };

    Twig.expression.toJS = function (tokens, context) {
      var that = this,
          // The output stack
          stack = [],
          token_template = null;

      // If the token isn't an array, make it one.
      if (!(tokens instanceof Array)) {
        tokens = [tokens];
      }

      Twig.forEach(tokens, function (token) {
        token_template = Twig.expression.handler[token.type];

        token_template &&
        token_template.toJS &&
        token_template.toJS.apply(that, [token, stack, context]);
      });

      // Pop the final value off the stack
      return stack.pop() || '""';
    };
  });
}(Twig || {}));

//  Twig.compiler.operator.js
//  Copyright (c) 2015 Egor Sharapov
//  Available under the MIT License
//  https://github.com/egych/twig.compiler.js
(function (Twig) {
  Twig.extend(function (Twig) {
    if (!Twig.expression.operator) {
      throw new Twig.Error("Twig.expression.operator not found.");
    }

    Twig.expression.operator.toJS = function (operator, stack, logic_options) {
      var a, b, c,
          fn = 'var ' +  Twig.compiler.js.vars.index_of_fn + ' = function (_b, _a) {' +
               'var i,_keys = ((typeof _b === "object") && !_b.length) ? (_b._keys || Object.keys(_b)) : false, _l=(_keys||_b).length;' +
               'if (!_keys) return _b.indexOf(_a) !== -1;' +
               'for (i = 0; i < _l; i = i + 1){' +
               'if (((_keys && _b[_keys[i]]) || (!_keys && _b[i]))===_a) return true;' +
               '}' +
               'return false;' +
               '};',

          indexOfLoop = function (a, b) {
            var output = '';

            // @notice logic_options.fn will be storage of all functions, that used in the template
            if (logic_options.fn.indexOf(fn) === -1) {
              logic_options.fn.push(fn);
            }

            output += Twig.compiler.js.vars.index_of_fn + '(' + b + ', ' + a + ')';

            return output;
          };

      switch (operator) {
        case ':':
          // Ignore
          break;

        case '?':
          c = stack.pop(); // false expr
          b = stack.pop(); // true expr
          a = stack.pop(); // conditional
          stack.push('(' + a + '?' + b + ':' + c + ')');
          break;

        case '+':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '+' + b + ')');
          break;

        case '-':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '-' + b + ')');
          break;

        case '*':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '*' + b + ')');
          break;

        case '/':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '/' + b + ')');
          break;

        case '//':
          b = stack.pop();
          a = stack.pop();
          stack.push('(parseInt(' + a + '/' + b +'))');
          break;

        case '%':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '%' + b + ')');
          break;

        case '~':
          b = stack.pop();
          a = stack.pop();
          // @todo think about how can to cache variables, because functions may perform several times
          stack.push('((' + a + ' != null ? (' + a + ').toString() : "")+(' + b + ' != null ? (' + b + ').toString() : ""))');
          break;

        case 'not':
        case '!':
          stack.push('(!' + stack.pop() + ')');
          break;

        case '<':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '<' + b + ')');
          break;

        case '<=':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '<=' + b + ')');
          break;

        case '>':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '>' + b + ')');
          break;

        case '>=':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '>=' + b + ')');
          break;

        case '===':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '===' + b + ')');
          break;

        case '==':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + ' == ' + b + ')');
          break;

        case '!==':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '!==' + b + ')');
          break;

        case '!=':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '!=' + b + ')');
          break;

        case 'or':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '||' + b + ')');
          break;

        case 'and':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + a + '&&' + b + ')');
          break;

        case '**':
          b = stack.pop();
          a = stack.pop();
          stack.push('(Math.pow(' + a + ',' + b +'))');
          break;

        case 'not in':
          b = stack.pop();
          a = stack.pop();
          stack.push('!' + indexOfLoop(a, b));
          break;

        case 'in':
          b = stack.pop();
          a = stack.pop();
          stack.push(indexOfLoop(a, b));
          break;

        case '..':
          b = stack.pop();
          a = stack.pop();
          stack.push('(_twig.functions.range(' + a + ',' + b +')');
          break;

        default:
          throw new Twig.Error(operator + " is an unknown operator.");
      }
    };
  });
}(Twig || {}));

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

        output += 'var _keys = (_obj._keys || Object.keys(_obj)),_l = _keys.length,_loop_cache,i,_key,_for_else = false;';
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

        output += 'if ((_obj instanceof Object) || (_obj instanceof Array) || (typeof _obj === "string")){'; // if is array, object or string
        output += 'for (i = 0; i < _l; i = i + 1) {'; // for loop
        output += '_key = _keys[i];';
        output += Twig.compiler.js.vars.context + '.loop.key = _key;';
        output += 'if (_for_key !== undefined){' + Twig.compiler.js.vars.context + '[_for_key] = _key;}'
        output += Twig.compiler.js.vars.context + '[_for_item] = _obj[_key];';
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
        .replace(Twig.compiler.js.helpers.regex.new_lines_between_tags, '><')
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
    Twig.compiler.toJS = function (tokens, logic_options) {
      var _this = this,
          output = '(function (' + Twig.compiler.js.vars.context + ') {var ' + Twig.compiler.js.vars.output + ' = "";';

      logic_options = logic_options || {};
      logic_options.fn = [];

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
            output += Twig.compiler.js.vars.output + ' += ' + Twig.expression.toJS.apply(_this, [token.stack, logic_options]) + ';';
            break;
        }
      });

      output += 'return ' + Twig.compiler.js.vars.output + ';}(' + Twig.compiler.js.vars.context + ')||"");';

      return output;
    };

    Twig.exports.toJS = function (template) {
      var tokens = template.tokens,
          logic_options = {},
          fn_str = Twig.compiler.toJS(tokens, logic_options);

      return 'var t = function (' + Twig.compiler.js.vars.context + ') {' +
               logic_options.fn.join('') +
               'return ' + fn_str +
             '};';
    };
  });
}(Twig || {}));

return Twig;
}(Twig)));