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
        output: 'o'
      },

      helpers: {}
    };

    Twig.compiler.js.helpers.regex = {
      space_between_tags: />\s+</g,
      new_lines_between_tags: />[\n|\r]{1,}</g,
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
      var value = stack.pop(),
          params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {});

      stack.push(
        '(' +
        (token.modifier == 'not' ? '!' : '') +
        '_twig.test("' + token.filter + '",((' + value + ')||""),' + params + ')' +
        ')'
      );
    };

    Twig.expression.handler['Twig.expression.type.operator.binary'].toJS = function (token, stack) {
      if (token.key) {
        // handle ternary ':' operator
        stack.push(token);
      } else {
        Twig.expression.operator.toJS(token.value, stack);
      }
    };

    Twig.expression.handler['Twig.expression.type.operator.unary'].toJS = function(token, stack) {
      Twig.expression.operator.toJS(token.value, stack);
    };

    Twig.expression.handler['Twig.expression.type.string'].toJS = function(token, stack) {
      stack.push('"' + Twig.compiler.js.helpers.escapeQuotes(token.value) + '"');
    };

    Twig.expression.handler['Twig.expression.type.parameter.start'].toJS = Twig.expression.fn.parse.push;

    Twig.expression.handler['Twig.expression.type.parameter.end'].toJS = function(token, stack, context) {
      var new_array = [],
          array_ended = false,
          is_json = false,
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

          try {
            is_json = JSON.parse(value);
          } catch (e) {}

          new_array.unshift(is_json ? is_json : value);
        }

        if (!array_ended) {
          throw new Twig.Error("Expected end of parameter set.");
        }

        stack.push(new_array);
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

      stack.push('{' + output.join(',') + ',_keys:["' + _keys.join('","') + '"]}');
    };

    Twig.expression.handler['Twig.expression.type.filter'].toJS = function(token, stack) {
      var input = stack.pop(),
          params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {});

      stack.push(
        '(' +
        '_twig.filter.apply({}, ["' + token.value + '",((' + input + ')||""),' + params + '])' +
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

      stack.push('(' + Twig.compiler.js.vars.twig + '.lib.key(' + object + ', ' + key + '))');
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
          token_template = null;;

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

    Twig.expression.operator.toJS = function (operator, stack) {
      var a, b, c;

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
          stack.push('((' + a + '||"").toString()+(' + b + '||"").toString())');
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
          stack.push('(' + b + '.indexOf(' + a + ') === -1)');
          break;

        case 'in':
          b = stack.pop();
          a = stack.pop();
          stack.push('(' + b + '.indexOf(' + a + ') >= 0)');
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

      if (conditional) {
        output += Twig.compiler.js.vars.context + '.loop.index += 1;';
        output += Twig.compiler.js.vars.context + '.loop.index0 += 1;';
        output += '}';
      } else {
        output += Twig.compiler.js.vars.context + '.loop.index += 1;';
        output += Twig.compiler.js.vars.context + '.loop.index0 += 1;';
        output += Twig.compiler.js.vars.context + '.loop.revindex -= 1;';
        output += Twig.compiler.js.vars.context + '.loop.revindex0 -= 1;';
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

return Twig;
}(Twig)));