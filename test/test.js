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

describe('Twig.js Core ->', function () {
  it("should save and load a template by reference", function() {
    checkAssert(assert, [
      '{{ "test" }}'
    ]);
  });

  it("should ignore comments", function() {
    checkAssert(assert, [
      'good {# comment #}morning',
      'good{#comment#}morning'
    ]);
  });

  it("should ignore output tags within comments", function() {
    checkAssert(assert, [
      'good {# {{ "Hello" }} #}morning',
      'good{#c}}om{{m{{ent#}morning'
    ]);
  });

  it("should ignore logic tags within comments", function() {
    checkAssert(assert, [
      'test {# {% bad syntax if not in comment %} #}test',
      '{##}{##}test{# %}}}%}%{%{{% #}pass'
    ]);
  });

  // https://github.com/justjohn/twig.js/issues/95
  it("should ignore quotation marks within comments", function() {
    checkAssert(assert, [
      "good {# don't stop #}morning",
      'good{#"dont stop"#}morning',
      'good {# "don\'t stop" #}morning',
      'good{#"\'#}morning',
      'good {#"\'"\'"\'#} day',
      "a {# ' #}b{# ' #} c"
    ]);
  });

  it("should be able to parse output tags with tag ends in strings", function() {
    // Really all we care about here is not throwing exceptions.
    checkAssert(assert, [
      '{{ "test" }}',
      '{{ " }} " }}',
      '{{ " \\"}} " }}',
      "{{ ' }} ' }}",
      "{{ ' \\'}} ' }}",
      '{{ " \'}} " }}',
      "{{ ' \"}} ' }}"
    ]);
  });

  it("should be able to output numbers", function() {
    checkAssert(assert, [
      '{{ 12 }}',
      '{{ 12.64 }}',
      '{{ 0.64 }}'
    ]);
  });

  it("should be able to output booleans", function() {
    checkAssert(assert, [
      '{{ true }}',
      '{{ false }}'
    ]);
  });

  it("should be able to output strings", function() {
    checkAssert(assert, [
      '{{ "double" }}',
      "{{ 'single' }}",
      '{{ "dou\'ble" }}',
      "{{ 'sin\"gle' }}",
      '{{ "dou\\"ble" }}',
      "{{ 'sin\\'gle' }}"
    ]);
  });

  it("should be able to output arrays", function() {
    checkAssert(assert, [
      '{{ [1] }}',
      '{{ [1,2 ,3 ] }}',
      {
        data: '{{ [1,2 ,3 , val ] }}',
        context: {
          val: 4
        }
      },
      '{{ ["[to",\'the\' ,"string]" ] }}',
      '{{ ["[to",\'the\' ,"str\\"ing]" ] }}'
    ]);
  });

  it("should be able to output parse expressions in an array", function() {
    checkAssert(assert, [
      '{{ [1,2 ,1+2 ] }}',
      {
        data: '{{ [1,2 ,3 , "-", [4,5, 6] ] }}',
        context: {
          val: 4
        }
      },
      {
        data: '{{ [a,b ,(1+2) * a ] }}',
        context: {
          a: 1,
          b: 2
        }
      }
    ]);
  });

  it("should be able to output variables", function() {
    checkAssert(assert, [
      {
        data: '{{ orp }}',
        context: {
          orp: "test"
        }
      },
      {
        data: '{{ val }}',
        context: {
          val: function() {
            return "test"
          }
        }
      }
    ]);
  });

  it("should recognize null", function() {
    checkAssert(assert, [
      {
        data: '{{ null == val }}',
        context: {
          val: null
        }
      },
      {
        data: '{{ null == val }}',
        context: {
          val: undefined
        }
      },
      {
        data: '{{ null == val }}',
        context: {
          val: "test"
        }
      },
      {
        data: '{{ null == val }}',
        context: {
          val: 0
        }
      },
      {
        data: '{{ null == val }}',
        val: false
      }
    ]);
  });

  it("should recognize object literals", function() {
    checkAssert(assert, [
      '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'
    ]);
  });

  it("should recognize null in an object", function() {
    checkAssert(assert, [
      {
        data: '{% set at = {"foo": null} %}{{ at.foo == val }}',
        context: {
          val: null
        }
      }
    ]);
  });

  it("should support set capture", function() {
    checkAssert(assert, [
      '{% set foo %}bar{% endset %}{{foo}}'
    ]);
  });

  it("should support raw data", function() {
    checkAssert(assert, [
      "before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after"
    ]);
  });

  describe("Key Notation ->", function() {
    it("should support dot key notation", function() {
      checkAssert(assert, [
        {
          data: '{{ key.value }} {{ key.sub.test }}',
          context: {
            key: {
              value: "test",
              sub: {
                test: "value"
              }
            }
          }
        }
      ]);
    });

    it("should support square bracket key notation", function() {
      checkAssert(assert, [
        {
          data: '{{ key["value"] }} {{ key[\'sub\']["test"] }}',
          context: {
            key: {
              value: "test",
              sub: {
                test: "value"
              }
            }
          }
        }
      ]);
    });

    it("should support mixed dot and bracket key notation", function() {
      checkAssert(assert, [
        {
          data: '{{ key["value"] }} {{ key.sub[key.value] }} {{ s.t["u"].v["w"] }}',
          context: {
            key: {
                value: "test",
                sub: {
                    test: "value"
                }
            },
            s: { t: { u: { v: { w: 'x' } } } }
          }
        }
      ]);
    });

    it("should support dot key notation after a function", function() {
      checkAssert(assert, [
        {
          data: '{{ key.fn().value }}',
          context: {
            key: {
              fn: function() {
                return {
                  value: "test"
                }
              }
            }
          }
        }
      ]);
    });

    it("should support bracket key notation after a function", function() {
      checkAssert(assert, [
        {
          data: '{{ key.fn()["value"] }}',
          context: {
            key: {
              fn: function() {
                return {
                  value: "test 2"
                }
              }
            }
          }
        }
      ]);
    });

    it("should check for getKey methods if a key doesn't exist.", function() {
      checkAssert(assert, [
        {
          data: '{{ obj.value }}',
          context: {
            obj: {
              getValue: function() {
                return "val";
              },
              isValue: function() {
                return "not val";
              }
            }
          }
        }
      ]);
    });

    it("should check for isKey methods if a key doesn't exist.", function() {
      checkAssert(assert, [
        {
          data: '{{ obj.value }}',
          context: {
            obj: {
              isValue: function() {
                return "val";
              }
            }
          }
        }
      ]);
    });

    it("should check for getKey methods on prototype objects.", function() {
      var object = {
            getValue: function() {
              return "val";
            }
          };

      function Subobj() {};
      Subobj.prototype = object;
      var subobj = new Subobj();

      checkAssert(assert, [
        {
          data: '{{ obj.value }}',
          context: {
            obj: subobj
          }
        }
      ]);
    });

    it("should return null if a period key doesn't exist.", function() {
      checkAssert(assert, [
        {
          data: '{{ obj.value == null }}',
          context: {
            obj: {}
          }
        }
      ]);
    });

    it("should return null if a bracket key doesn't exist.", function() {
      checkAssert(assert, [
        {
          data: '{{ obj["value"] == null }}',
          context: {
            obj: {}
          }
        }
      ]);
    });
  });

  describe("Context ->", function() {
    it("should be supported", function() {
      checkAssert(assert, [
        {
          data: '{{ _context.value }}',
          context: {
            value: "test"
          }
        }
      ]);
    });

    it("should be an object even if it's not passed", function() {
      checkAssert(assert, [
        '{{ _context|json_encode }}'
      ]);
    });

    it("should support {% set %} tag", function() {
      checkAssert(assert, [
        '{% set value = "test" %}{{ _context.value }}'
      ]);
    });

    it("should work correctly with properties named dynamically", function() {
      checkAssert(assert, [
        {
          data: '{{ _context[key] }}',
          context: {
            key: "value",
            value: "test"
          }
        }
      ]);
    });

    it("should not allow to override context using {% set %}", function() {
      checkAssert(assert, [
        '{% set _context = "test" %}{{ _context|json_encode }}',
        '{% set _context = "test" %}{{ _context._context }}'
      ]);
    });

    // it("should support autoescape option", function() {
    //     twig({
    //         autoescape: true,
    //         data: '{{ value }}'
    //     }).render({
    //         value: "<test>&</test>"
    //     }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
    // });
  });
});
