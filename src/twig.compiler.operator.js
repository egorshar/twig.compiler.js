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
