# twig.compiler.js

Convert twig templates to native JavaScript code

## IMPORTANT!

* Under development
* Uses [John Roepke](https://github.com/justjohn) [twig.js](https://github.com/justjohn/twig.js) implementation

## Simple example

**template.twig**
```twig
{% if foo %}{{ bar }}{% else %}foobar{% endif %}
```

**template.js** not minified
```javascript
var t = function(ctx) {
  return (function(ctx) {
    var o = "";
    if ((ctx["foo"] !== undefined ? ctx["foo"] : "")) {
      o += (function(ctx) {
        var o = "";
        o += (ctx["bar"] !== undefined ? ctx["bar"] : "");
        return o;
      }(ctx) || "");
    } else {
      o += (function(ctx) {
        var o = "";
        o += "foobar";
        return o;
      }(ctx) || "");
    }
    return o;
  }(ctx) || "");
};
```
**template.js** uglified
```javascript
var t = function(c) {
  return function(a) {
    var b = "";
    return b = void 0 !== a.foo && a.foo ? b + (function(a) {
      return a = "" + (void 0 !== a.bar ? a.bar : "")
    }(a) || "") : b + (function(a) {
      return "foobar"
    }(a) || "")
  }(c) || ""
};
```

## Contributors

  * [Egor Sharapov](https://github.com/egych/twig.compiler.js/commits/master?author=egych) ([Home](http://egorshar.ru))

## Licence & copyright

twig.compiler.js is copyright &copy; 2015 Egor Sharapov and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included MIT-LICENSE file for more details.
