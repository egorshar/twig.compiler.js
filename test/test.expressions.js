GLOBAL.Twig = require("Twig");
var assert = require("assert");
var _twig = require('../twig.deps');
var TwigCompiler = require("../twig.compiler");
var twig = twig || Twig.twig;

var getFn = function (fn_str) {
  return Function.apply(null, ['ctx', '_twig', fn_str + 'return t(ctx||{})']);
};

var checkAssert = function (assert, templates, contexts) {
  var tmpl, precompiled, compiled, context;

  while (templates.length) {
    tmpl = templates.shift();

    if (typeof tmpl == 'string') {
      tmpl = {
        data: tmpl,
        context: {}
      };
    }

    precompiled = twig({data: tmpl.data});
    compiled = getFn(TwigCompiler.toJS(precompiled));

    assert.equal(precompiled.render(tmpl.context), compiled(tmpl.context, _twig));
  }
};

describe("Twig.js Expressions ->", function () {
  var numeric_test_data = [
      {a: 10, b: 15},
      {a: 0, b: 0},
      {a: 1, b: 11},
      {a: 10444, b: 0.5},
      {a: 1034, b: -53},
      {a: -56, b: -1.7},
      {a: 34, b: 0},
      {a: 14, b: 14}
  ];

  describe("Basic Operators ->", function() {
    var string_data = [
      {a: 'test', b: 'string'},
      {a: 'test', b: ''},
      {a: '', b: 'string'},
      {a: '', b: ''},
    ];

    it("should parse parenthesis", function() {
      checkAssert(assert, [
        {
          data: '{{ a - (b + c) }}',
          context: {
            a: 10,
            b: 4,
            c: 2
          }
        }
      ]);
    });

    it("should parse nested parenthesis", function() {
      checkAssert(assert, [
        {
          data: '{{ a - ((b) + (1 + c)) }}',
          context: {
            a: 10,
            b: 4,
            c: 2
          }
        }
      ]);
    });

    it("should add numbers", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a + b }}',
            context: pair
          }
        ]);
      });
    });

    it("should subtract numbers", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a - b }}',
            context: pair
          }
        ]);
      });
    });

    it("should multiply numbers", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a * b }}',
            context: pair
          }
        ]);
      });
    });

    it("should divide numbers", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a / b }}',
            context: pair
          }
        ]);
      });
    });

    it("should divide numbers and return an int result", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a // b }}',
            context: pair
          }
        ]);
      });
    });

    it("should raise numbers to a power", function() {
      var pow_test_data = [
          {a: 2, b:3, c: 8}
          , {a: 4, b:.5, c: 2}
          , {a: 5, b: 1, c: 5}
      ];

      pow_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a ** b }}',
            context: pair
          }
        ]);
      });
    });

    it("should concatanate values", function() {
      checkAssert(assert, [
        {
          data: '{{ "test" ~ a }}',
          context: {
            a: 1234
          }
        },
        {
          data: '{{ a ~ "test" ~ a }}',
          context: {
            a: 1234
          }
        },
        {
          data: '{{ "this" ~ "test" }}',
          context: {
            a: 1234
          }
        }
      ]);

      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a ~ b }}',
            context: pair
          }
        ]);
      });

      string_data.forEach(function(pair) {
        checkAssert(assert, [
          {
            data: '{{ a ~ b }}',
            context: pair
          }
        ]);
      });
    });

    // twig.js not passed this test
    it("should concatenate null and undefined values and not throw an exception", function() {
      // checkAssert(assert, [
      //   '{{ a ~ b }}',
      //   {
      //     data: '{{ a ~ b }}',
      //     context: {
      //       a: null,
      //       b: null
      //     }
      //   }
      // ]);
    });

    it("should handle multiple chained operations", function() {
      checkAssert(assert, [
        {
          data: '{{a/b+c*d-e+f/g*h}}',
          context: {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002}
        }
      ]);
    });

    it("should handle parenthesis in chained operations", function() {
      checkAssert(assert, [
        {
          data: '{{a   /(b+c )*d-(e+f)/(g*h)}}',
          context: {a: 4.5, b: 10, c: 12,  d: -0.25, e:0, f: 65,  g: 21, h: -0.0002}
        }
      ]);
    });
  });

  describe("Comparison Operators ->", function() {
    var equality_data = [
      {a: true, b: "true"},
      {a: 1, b: "1"},
      {a: 1, b: 1},
      {a: 1, b: 1.0},
      {a: "str", b: "str"},
      {a: false, b: "false"}
    ];
    var boolean_data = [
      {a: true, b: true},
      {a: true, b: false},
      {a: false, b: true},
      {a: false, b: false}
    ];

    it("should support less then", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a < b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support less then or equal", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a <= b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support greater then", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a > b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support greater then or equal", function() {
      numeric_test_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a >= b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support equals", function() {
      boolean_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a == b }}',
            context: pair
          }
        ]);
      });

      equality_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a == b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support not equals", function() {
      boolean_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a != b }}',
            context: pair
          }
        ]);
      });

      equality_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a != b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support boolean or", function() {
      boolean_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a or b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support boolean and", function() {
      boolean_data.forEach(function (pair) {
        checkAssert(assert, [
          {
            data: '{{ a and b }}',
            context: pair
          }
        ]);
      });
    });

    it("should support boolean not", function() {
      checkAssert(assert, [
        {
          data: '{{ not a }}',
          context: {a: false}
        },
        {
          data: '{{ not a }}',
          context: {a: true}
        }
      ]);
    });
  });

  describe("Other Operators ->", function() {
    it("should support the ternary operator", function() {
      checkAssert(assert, [
        {
          data: '{{ a ? b:c }}',
          context: {a: true,  b: "one", c: "two"}
        },
        {
          data: '{{ a ? b:c }}',
          context: {a: false, b: "one", c: "two"}
        }
      ]);
    });

    it("should support the ternary operator with objects in it", function() {
      checkAssert(assert, [
        {
          data: '{{ (a ? {"a":e+f}:{"a":1}).a }}',
          context: {a: true, b: false, e: 1, f: 2}
        }
      ]);
    });

    it("should support the ternary operator inside objects", function() {
      checkAssert(assert, [
        {
          data: '{{ {"b" : a or b ? {"a":e+f}:{"a":1} }.b.a }}',
          context: {a: false, b: false, e: 1, f: 2}
        }
      ]);
    });

    it("should support in/containment functionality for arrays", function() {
      checkAssert(assert, [
        '{{ "a" in ["a", "b", "c"] }}',
        '{{ "d" in ["a", "b", "c"] }}'
      ]);
    });

    it("should support not in/containment functionality for arrays", function() {
      checkAssert(assert, [
        '{{ "a" not in ["a", "b", "c"] }}',
        '{{ "d" not in ["a", "b", "c"] }}'
      ]);
    });

    it("should support in/containment functionality for strings", function() {
      checkAssert(assert, [
        '{{ "at" in "hat" }}',
        '{{ "d" in "not" }}'
      ]);
    });

    it("should support not in/containment functionality for strings", function() {
      checkAssert(assert, [
        '{{ "at" not in "hat" }}',
        '{{ "d" not in "not" }}'
      ]);
    });

    it("should support in/containment functionality for objects", function() {
      checkAssert(assert, [
        '{{ "value" in {"key" : "value", "2": "other"} }}',
        '{{ "d" in {"key_a" : "no"} }}'
      ]);
    });

    it("should support not in/containment functionality for objects", function() {
      checkAssert(assert, [
        '{{ "value" not in {"key" : "value", "2": "other"} }}',
        '{{ "d" not in {"key_a" : "no"} }}'
      ]);
    });
  });
});
