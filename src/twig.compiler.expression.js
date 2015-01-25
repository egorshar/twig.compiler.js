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
      // console.log(Twig.compiler.js.helpers.resolveValue(token.value));
      stack.push(Twig.compiler.js.helpers.resolveValue(token.value));
    };

    Twig.expression.handler['Twig.expression.type.key.period'].toJS = function(token, stack, context) {
      var params = JSON.stringify((token.params && Twig.expression.toJS.apply(this, [token.params])) || {}),
          key = Twig.compiler.js.helpers.isInt(token.key) ? token.key : ('"' + token.key + '"'),
          // object = '(' + stack.pop() + '||{})',
          object = stack.pop(),
          output = '(';



      // console.log(key, params, object);

      // if (object === null || object === undefined) {
      //   if (this.options.strict_variables) {
      //     throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
      //   } else {
      //     return null;
      //   }
      // }

      var capitalize = function(value) {
        return value.substr(0, 1).toUpperCase() + value.substr(1);
      };

      // Get the variable from the context
      output += '(typeof ' + object + ' === "object") && (' + key + ' in ' + object + ') && ';
      output += object + '[' + key + ']';
      output += ')||(';
      output += '(' + object + '["get" + ' + Twig.compiler.js.vars.twig + '.lib.capitalize(' + key + ')] !== undefined) && '
      output += object + '["get" + ' + Twig.compiler.js.vars.twig + '.lib.capitalize(' + key + ')]';
      output += ')||(';
      output += '(' + object + '["is" + ' + Twig.compiler.js.vars.twig + '.lib.capitalize(' + key + ')] !== undefined) && '
      output += object + '["is" + ' + Twig.compiler.js.vars.twig + '.lib.capitalize(' + key + ')]';
      output += ')||null';
      // output += ')';

      // } else if (object["is"+capitalize(key)] !== undefined) {
      //   value = object["is"+capitalize(key)];
      // } else {
      //   value = null;
      // }

      stack.push(output);
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
      console.log('asfasf');
      stack.push(Twig.expression.resolve(value, object, params));
    };

    Twig.expression.handler['Twig.expression.type.null'].toJS = Twig.expression.fn.parse.push_value;

    Twig.expression.handler['Twig.expression.type.context'].toJS = function(token, stack, context) {
      stack.push(context);
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
