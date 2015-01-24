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
        '_twig.test("' + token.filter + '",' + value + ',' + params + ')' +
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

    // Twig.expression.handler['Twig.expression.type.string'].toJS = Twig.expression.fn.parse.push_value;
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
        value = Twig.expression.toJSON.apply(this, [token.params]);
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

    Twig.expression.handler['Twig.expression.type.object.end'].toJS = function (end_token, stack, context) {
      var obj;

      Twig.expression.handler['Twig.expression.type.object.end'].parse.apply({}, [end_token, stack]);
      obj = stack.pop();
      delete obj._keys;

      stack.push(JSON.stringify(obj));
    };

    Twig.expression.handler['Twig.expression.type.filter'].toJS = function(token, stack) {
      var input = stack.pop(),
          params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {});

      stack.push(
        '(' +
        '_twig.filter.apply({}, ["' + token.value + '",' + input + ',' + params + '])' +
        ')'
      );
    };

    Twig.expression.handler['Twig.expression.type._function'].toJS = function(token, stack) {
      var params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {}),
          fn     = token.fn,
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
      var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
          key = token.key,
          object = stack.pop(),
          value;

      if (object === null || object === undefined) {
        if (this.options.strict_variables) {
          throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
        } else {
          return null;
        }
      }

      var capitalize = function(value) {
        return value.substr(0, 1).toUpperCase() + value.substr(1);
      };

      // Get the variable from the context
      if (typeof object === 'object' && key in object) {
        value = object[key];
      } else if (object["get"+capitalize(key)] !== undefined) {
        value = object["get"+capitalize(key)];
      } else if (object["is"+capitalize(key)] !== undefined) {
        value = object["is"+capitalize(key)];
      } else {
        value = null;
      }
      stack.push(Twig.expression.resolve(value, object, params));
    };

    Twig.expression.handler['Twig.expression.type.key.brackets'].toJS = function(token, stack, context) {
      // Evaluate key
      var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
          key = Twig.expression.parse.apply(this, [token.stack, context]),
          object = stack.pop(),
          value;

      if (object === null || object === undefined) {
          if (this.options.strict_variables) {
              throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
          } else {
              return null;
          }
      }

      // Get the variable from the context
      if (typeof object === 'object' && key in object) {
          value = object[key];
      } else {
          value = null;
      }
      stack.push(Twig.expression.resolve(value, object, params));
    };

    Twig.expression.handler['Twig.expression.type.null'].toJS = Twig.expression.fn.parse.push_value;

    Twig.expression.handler['Twig.expression.type.context'].toJS = function(token, stack, context) {
      stack.push(context);
    };

    Twig.expression.handler['Twig.expression.type.number'].toJS = Twig.expression.fn.parse.push_value;
    Twig.expression.handler['Twig.expression.type.bool'].toJS = Twig.expression.fn.parse.push_value;

    Twig.expression.toJS = function (tokens, context) {
      var that = this;

      // If the token isn't an array, make it one.
      if (!(tokens instanceof Array)) {
          tokens = [tokens];
      }

      // The output stack
      var stack = [],
          token_template = null;

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
          stack.push('(' + a + '==' + b + ')');
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

      return 'var t = function (' + Twig.compiler.js.vars.context + ') {return ' + Twig.compiler.toJS(tokens) + '};';
    };
  });
}(Twig || {}));
