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
