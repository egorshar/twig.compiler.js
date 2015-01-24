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
