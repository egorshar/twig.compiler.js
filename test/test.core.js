var assert = require("assert");
var helpers = require('./helpers');

var params = {
  parser: GLOBAL.twig,
  compiler: GLOBAL.TwigCompiler,
  assert: assert,
  _twig: GLOBAL._twig
};

describe('Twig.js Core ->', function () {
  it("should save and load a template by reference", function() {
    helpers.assert(params, [
      '{{ "test" }}'
    ]);
  });

  it("should ignore comments", function() {
    helpers.assert(params, [
      'good {# comment #}morning',
      'good{#comment#}morning'
    ]);
  });

  it("should ignore output tags within comments", function() {
    helpers.assert(params, [
      'good {# {{ "Hello" }} #}morning',
      'good{#c}}om{{m{{ent#}morning'
    ]);
  });

  it("should ignore logic tags within comments", function() {
    helpers.assert(params, [
      'test {# {% bad syntax if not in comment %} #}test',
      '{##}{##}test{# %}}}%}%{%{{% #}pass'
    ]);
  });

  // https://github.com/justjohn/twig.js/issues/95
  it("should ignore quotation marks within comments", function() {
    helpers.assert(params, [
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
    helpers.assert(params, [
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
    helpers.assert(params, [
      '{{ 12 }}',
      '{{ 12.64 }}',
      '{{ 0.64 }}'
    ]);
  });

  it("should be able to output booleans", function() {
    helpers.assert(params, [
      '{{ true }}',
      '{{ false }}'
    ]);
  });

  it("should be able to output strings", function() {
    helpers.assert(params, [
      '{{ "double" }}',
      "{{ 'single' }}",
      '{{ "dou\'ble" }}',
      "{{ 'sin\"gle' }}",
      '{{ "dou\\"ble" }}',
      "{{ 'sin\\'gle' }}"
    ]);
  });

  it("should be able to output arrays", function() {
    helpers.assert(params, [
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
    helpers.assert(params, [
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
    helpers.assert(params, [
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
    helpers.assert(params, [
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
    helpers.assert(params, [
      '{% set at = {"foo": "test", bar: "other", 1:"zip"} %}{{ at.foo ~ at.bar ~ at.1 }}'
    ]);
  });

  it("should recognize null in an object", function() {
    helpers.assert(params, [
      {
        data: '{% set at = {"foo": null} %}{{ at.foo == val }}',
        context: {
          val: null
        }
      }
    ]);
  });

  it("should support set capture", function() {
    helpers.assert(params, [
      '{% set foo %}bar{% endset %}{{foo}}'
    ]);
  });

  it("should support raw data", function() {
    helpers.assert(params, [
      "before {% raw %}{{ test }} {% test2 %} {{{% endraw %} after"
    ]);
  });

  describe("Key Notation ->", function() {
    it("should support dot key notation", function() {
      helpers.assert(params, [
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
      helpers.assert(params, [
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
      helpers.assert(params, [
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
      helpers.assert(params, [
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
      helpers.assert(params, [
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
      helpers.assert(params, [
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
      helpers.assert(params, [
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

      helpers.assert(params, [
        {
          data: '{{ obj.value }}',
          context: {
            obj: subobj
          }
        }
      ]);
    });

    it("should return null if a period key doesn't exist.", function() {
      helpers.assert(params, [
        {
          data: '{{ obj.value == null }}',
          context: {
            obj: {}
          }
        }
      ]);
    });

    it("should return null if a bracket key doesn't exist.", function() {
      helpers.assert(params, [
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
      helpers.assert(params, [
        {
          data: '{{ _context.value }}',
          context: {
            value: "test"
          }
        }
      ]);
    });

    it("should be an object even if it's not passed", function() {
      helpers.assert(params, [
        '{{ _context|json_encode }}'
      ]);
    });

    it("should support {% set %} tag", function() {
      helpers.assert(params, [
        '{% set value = "test" %}{{ _context.value }}'
      ]);
    });

    it("should work correctly with properties named dynamically", function() {
      helpers.assert(params, [
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
      helpers.assert(params, [
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
