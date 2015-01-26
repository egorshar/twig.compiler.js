var assert = require("assert");
var helpers = require('./helpers');

var params = {
  parser: GLOBAL.twig,
  compiler: GLOBAL.TwigCompiler,
  assert: assert,
  _twig: GLOBAL._twig
};

describe("Twig.js Filters ->", function () {
  describe("url_encode ->", function() {
    it("should encode URLs", function() {
      helpers.assert(params, [
        '{{ "http://google.com/?q=twig.js"|url_encode() }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|url_encode() }}'
      ]);
    });
  });

  describe("json_encode ->", function() {
    it("should encode strings to json", function() {
      helpers.assert(params, [
        {
          data: '{{ test|json_encode }}',
          context: {test: 'value'}
        }
      ]);
    });

    it("should encode numbers to json", function() {
      helpers.assert(params, [
        {
          data: '{{ test|json_encode }}',
          context: {test: 21}
        }
      ]);
    });

    it("should encode arrays to json", function() {
      helpers.assert(params, [
        '{{ [1,"b",3]|json_encode }}'
      ]);
    });

    it("should encode objects to json", function() {
      helpers.assert(params, [
        '{{ {"a":[1,"b",3]}|json_encode }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|json_encode }}'
      ]);
    });
  });

  // String manipulation
  describe("upper ->", function() {
    it("should convert text to uppercase", function() {
      helpers.assert(params, [
        '{{ "hello"|upper }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|upper }}'
      ]);
    });
  });

  describe("lower ->", function() {
    it("should convert text to lowercase", function() {
      helpers.assert(params, [
        '{{ "HELLO"|lower }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|lower }}'
      ]);
    });
  });

  describe("capitalize ->", function() {
    it("should capitalize the first word in a string", function() {
      helpers.assert(params, [
        '{{ "hello world"|capitalize }}',
        '{{ "HELLO WORLD"|capitalize }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|capitalize }}'
      ]);
    });
  });

  describe("title ->", function() {
    it("should capitalize all the words in a string", function() {
      helpers.assert(params, [
        '{{ "hello world"|title }}',
        '{{ "HELLO WORLD"|title }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|title }}'
      ]);
    });
  });

  // String/Object/Array check
  describe("length ->", function() {
    it("should determine the length of a string", function() {
      helpers.assert(params, [
        '{{ "test"|length }}'
      ]);
    });

    it("should determine the length of an array", function() {
      helpers.assert(params, [
        '{{ [1,2,4,76,"tesrt"]|length }}'
      ]);
    });

    it("should determine the length of an object", function() {
      helpers.assert(params, [
        '{{ {"a": "b", "c": "1", "test": "test"}|length }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|length }}'
      ]);
    });
  });

  // Array/object manipulation
  describe("sort ->", function() {
    it("should sort an array", function() {
      helpers.assert(params, [
        '{{ [1,5,2,7]|sort }}',
        '{{ ["test","abc",2,7]|sort }}'
      ]);
    });

    it("should sort an object", function() {
      helpers.assert(params, [
        "{% set obj =  {'c': 1,'d': 5,'t': 2,'e':7}|sort %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}",
        "{% set obj = {'m':'test','z':'abc','a':2,'y':7} %}{% for key,value in obj|sort %}{{key}}:{{value}} {%endfor %}"
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{% set obj = undef|sort %}{% for key, value in obj|sort %}{{key}}:{{value}}{%endfor%}'
      ]);
    });
  });

  describe("reverse ->", function() {
    it("should reverse an array", function() {
      helpers.assert(params, [
        '{{ ["a", "b", "c"]|reverse }}'
      ]);
    });

    it("should reverse an object", function() {
      // helpers.assert(params, [
      //   '{{ {"a", "b", "c"]|reverse }}'
      // ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|reverse }}'
      ]);
    });
  });

  describe("keys ->", function() {
    it("should return the keys of an array", function() {
      helpers.assert(params, [
        '{{ ["a", "b", "c"]|keys }}'
      ]);
    });

    it("should return the keys of an object", function() {
      helpers.assert(params, [
        '{{ {"a": 1, "b": 4, "c": 5}|keys }}',
        '{{ {"0":"a", "1":"b", "2":"c"}|keys }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|keys }}'
      ]);
    });
  });

  describe("merge ->", function() {
    it("should merge two objects into an object", function() {
      // Object merging
      helpers.assert(params, [
        '{% set obj= {"a":"test", "b":"1"}|merge({"b":2,"c":3}) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'
      ]);
    });

    it("should merge two arrays into and array", function() {
      // Array merging
      helpers.assert(params, [
        '{% set obj= ["a", "b"]|merge(["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}'
      ]);
    });

    it("should merge an object and an array into an object", function() {
        // Mixed merging
        helpers.assert(params, [
          '{% set obj= ["a", "b"]|merge({"a": "c", "3":4}, ["c", "d"]) %}{% for key in obj|keys|sort %}{{key}}:{{obj[key]}} {%endfor %}',
          '{% set obj= {"1":"a", "a":"b"}|merge(["c", "d"]) %}{% for key in obj|keys %}{{key}}:{{obj[key]}} {%endfor %}'
        ]);
    });
  });

  describe("join ->", function() {
    it("should join all values in an object", function() {
      helpers.assert(params, [
        {
          data: '{{ {"a":"1", "b": "b", "c":test}|join("-") }}',
          context: {"test": "t"}
        }
      ]);
    });

    it("should joing all values in an array", function() {
      helpers.assert(params, [
        '{{ [1,2,4,76]|join }}',
        '{{ [1+ 5,2,4,76]|join("-" ~ ".") }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|join }}'
      ]);
    });
  });

  // Other
  describe("default ->", function() {
    it("should not provide the default value if a key is defined and not empty", function() {
      helpers.assert(params, [
        {
          data: '{{ var|default("Not Defined") }}',
          context: {"var":"value"}
        }
      ]);
    });

    it("should provide a default value if a key is not defined", function() {
      helpers.assert(params, [
        '{{ var|default("Not Defined") }}'
      ]);
    });

    it("should provide a default value if a value is empty", function() {
      helpers.assert(params, [
        '{{ ""|default("Empty String") }}',
        {
          data: '{{ var.key|default("Empty Key") }}',
          context: {'var':{}}
        }
      ]);
    });
  });

  describe("date ->", function() {
    function pad(num) {return num<10?'0'+num:num;}
    function stringDate(date){
        return pad(date.getDate()) + "/" + pad(date.getMonth()+1) + "/" + date.getFullYear()
                                 + " @ " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
    }

    // NOTE: these tests are currently timezone dependent
    it("should recognize timestamps", function() {
      helpers.assert(params, [
        '{{ 27571323556|date("d/m/Y @ H:i:s") }}'
      ]);
    });

    it("should recognize string date formats", function() {
      helpers.assert(params, [
        '{{ "Tue Aug 14 08:52:15 +0000 2007"|date("d/m/Y @ H:i:s") }}'
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|date("d/m/Y @ H:i:s") }}'
      ]);
    });
  });

  describe("replace ->", function() {
    it("should replace strings provided in a map", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like %this% and %that%. Seriously, I like %this% and %that%."|replace({"%this%": foo, "%that%": "bar"}) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|replace }}'
      ]);
    });
  });

  describe("format ->", function() {
    it("should replace formatting tags with parameters", function() {
      it("should replace strings provided in a map", function() {
        helpers.assert(params, [
          {
            data: '{{ "I like %s and %s."|format(foo, "bar") }}',
            context: {foo: "foo"}
          }
        ]);
      });
    });

    it("should handle undefined", function() {
      helpers.assert(params, [
        '{{ undef|format }}'
      ]);
    });

    it("should handle positive leading sign without padding", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like positive numbers like %+d."|format(123) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle negative leading sign without padding", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like negative numbers like %+d."|format(-123) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle positive leading sign with padding zero", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like positive numbers like %+05d."|format(123) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle negative leading sign with padding zero", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like negative numbers like %+05d."|format(-123) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle positive leading sign with padding space", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like positive numbers like %+5d."|format(123) }}',
          context: {foo: "foo"}
        }
      ]);
    });

    it("should handle negative leading sign with padding space", function() {
      helpers.assert(params, [
        {
          data: '{{ "I like negative numbers like %+5d."|format(-123) }}',
          context: {foo: "foo"}
        }
      ]);
    });
  });
});

// describe("Twig.js Filters ->", function() {




//     describe("striptags ->", function() {
//         it("should remove tags from a value", function() {
//             var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\\"#fragment\\">Other text</a>"|striptags }}'});
//             template.render().should.equal("Test paragraph. Other text" );
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|striptags }}' });
//             test_template.render().should.equal("" );
//         });
//     });

//     describe("escape ->", function() {
//         it("should convert unsafe characters to HTML entities", function() {
//             var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|escape }}'});
//             template.render().should.equal("&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment\&#039;&gt;Other text&lt;/a&gt;" );
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|escape }}' });
//             test_template.render().should.equal("" );
//         });

//         it("should not escape twice if autoescape is on", function() {
//             twig({
//                 autoescape: true,
//                 data: '{{ value }}'
//             }).render({
//                 value: "<test>&</test>"
//             }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
//         });
//     });

//     describe("e ->", function() {
//         it("should alias escape function with e", function() {
//             var template = twig({data: '{{ "<p>Test paragraph.</p><!-- Comment --> <a href=\'#fragment\'>Other text</a>"|e }}'});
//             template.render().should.equal("&lt;p&gt;Test paragraph.&lt;/p&gt;&lt;!-- Comment --&gt; &lt;a href=&#039;#fragment\&#039;&gt;Other text&lt;/a&gt;" );
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|e }}' });
//             test_template.render().should.equal("" );
//         });

//         it("should not escape twice if autoescape is on", function() {
//             var template = twig({
//                 autoescape: true,
//                 data: '{{ value }}'
//             });
//             template.render({
//                 value: "<test>&</test>"
//             }).should.equal('&lt;test&gt;&amp;&lt;/test&gt;');
//         });
//     });

//     describe("nl2br ->", function() {
//         it("should convert newlines into html breaks", function() {
//             var template = twig({data: '{{ test|nl2br }}'});
//             template.render({ test: 'Line 1\r\nLine 2\nLine 3\rLine 4\n\n' })
//                 .should.equal("Line 1<br />\nLine 2<br />\nLine 3<br />\nLine 4<br />\n<br />\n");
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|nl2br }}' });
//             test_template.render().should.equal("" );
//         });
//     });


//     describe("trim ->", function() {
//         it("should trim whitespace from strings", function() {
//             var template = twig({data: '{{ test|trim }}'});
//             template.render({ test: '\r\n Test\n  ' }).should.equal("Test");
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|trim }}' });
//             test_template.render().should.equal("" );
//         });
//     });


//     describe("number_format ->", function() {
//         it("should round to nearest integer if no parameters", function() {
//             var template = twig({data: '{{ 1234.56|number_format }}'});
//             template.render().should.equal("1,235");
//         });
//         it("should have customizable precision", function() {
//             var template = twig({data: '{{ 1234.567890123|number_format(4) }}'});
//             template.render().should.equal("1,234.5679");
//         });
//         it("should have a customizable decimal seperator", function() {
//             var template = twig({data: '{{ 1234.567890123|number_format(2,",") }}'});
//             template.render().should.equal("1,234,57");
//         });
//         it("should have a customizable thousands seperator", function() {
//             var template = twig({data: '{{ 1234.5678|number_format(2,","," ") }}'});
//             template.render().should.equal("1 234,57");
//         });
//         it("should handle blank seperators", function() {
//             var template = twig({data: '{{ 1234.5678|number_format(2,"","") }}'});
//             template.render().should.equal("123457");
//         });

//         it("should handle undefined", function() {
//             var test_template = twig({data: '{{ undef|number_format }}' });
//             test_template.render().should.equal("0");
//         });
//     });

//     describe("slice ->", function() {
//         it("should slice a string", function() {
//             var test_template = twig({data: "{{ '12345'|slice(1, 2) }}" });
//             test_template.render().should.equal("23");
//         });
//         it("should slice a string to the end", function() {
//             var test_template = twig({data: "{{ '12345'|slice(2) }}" });
//             test_template.render().should.equal("345");
//         });
//         it("should slice a string from the start", function() {
//             var test_template = twig({data: "{{ '12345'|slice(null, 2) }}" });
//             test_template.render().should.equal("12");
//         });
//         it("should slice a string from a negative offset", function() {
//             var test_template = twig({data: "{{ '12345'|slice(-2, 1) }}" });
//             test_template.render().should.equal("4");
//         });
//         it("should slice a string from a negative offset to end of string", function() {
//             var test_template = twig({data: "{{ '12345'|slice(-2) }}" });
//             test_template.render().should.equal("45");
//         });

//         it("should slice an array", function() {
//             var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(1, 2)|join(',') }}" });
//             test_template.render().should.equal("2,3");
//         });
//         it("should slice an array to the end", function() {
//             var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(2)|join(',') }}" });
//             test_template.render().should.equal("3,4,5");
//         });
//         it("should slice an array from the start", function() {
//             var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(null, 2)|join(',') }}" });
//             test_template.render().should.equal("1,2");
//         });
//         it("should slice an array from a negative offset", function() {
//             var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(-2, 1)|join(',') }}" });
//             test_template.render().should.equal("4");
//         });
//         it("should slice an array from a negative offset to the end of the array", function() {
//             var test_template = twig({data: "{{ [1, 2, 3, 4, 5]|slice(-4)|join(',') }}" });
//             test_template.render().should.equal("2,3,4,5");
//         });
//     });

//     describe('abs ->', function () {
//         it('should convert negative numbers to its absolute value', function () {
//             var test_template = twig({data: "{{ '-7.365'|abs }}"});
//             test_template.render().should.equal("7.365");
//         });
//         it('should not alter absolute numbers', function () {
//             var test_template = twig({data: "{{ 95|abs }}"});
//             test_template.render().should.equal("95");
//         });
//     });

//     describe('first ->', function () {''
//         it('should return first item in array', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd']|first }}"});
//             test_template.render().should.equal("a");
//         });
//         it('should return first member of object', function () {
//             var test_template = twig({data: "{{ { item1: 'a', item2: 'b', item3: 'c', item4: 'd'}|first }}"});
//             test_template.render().should.equal("a");
//         });
//         it('should not fail when passed empty obj, arr or str', function () {
//             var test_template = twig({data: "{{ {}|first }}"});
//             test_template.render().should.equal("");

//             var test_template = twig({data: "{{ []|first }}"});
//             test_template.render().should.equal("");

//             var test_template = twig({data: "{{ myemptystr|first }}"});
//             test_template.render({myemptystr: ""}).should.equal("");
//         });
//         it('should return first character in string', function () {
//             var test_template = twig({data: "{{ 'abcde'|first }}"});
//             test_template.render().should.equal("a");
//         });
//     });

//     describe('split ->', function () {
//         it('should split string with a separator', function () {
//             var test_template = twig({data: "{{ 'one-two-three'|split('-') }}"});
//             test_template.render().should.equal("one,two,three");
//         });
//         it('should split string with a separator and positive limit', function () {
//             var test_template = twig({data: "{{ 'one-two-three-four-five'|split('-', 3) }}"});
//             test_template.render().should.equal("one,two,three-four-five");
//         });
//         it('should split string with a separator and negative limit', function () {
//             var test_template = twig({data: "{{ 'one-two-three-four-five'|split('-', -2) }}"});
//             test_template.render().should.equal("one,two,three");
//         });
//         it('should split with empty separator', function () {
//             var test_template = twig({data: "{{ '123'|split('') }}"});
//             test_template.render().should.equal("1,2,3");
//         });
//         it('should split with empty separator and limit', function () {
//             var test_template = twig({data: "{{ 'aabbcc'|split('', 2) }}"});
//             test_template.render().should.equal("aa,bb,cc");
//         });
//     });

//     describe('batch ->', function () {
//         it('should work with arrays that require filling (with fill specified)', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f', 'g']|batch(3, 'x') }}"});
//             test_template.render().should.equal("a,b,c,d,e,f,g,x,x");
//         });
//         it('should work with arrays that require filling (without fill specified)', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f', 'g']|batch(3) }}"});
//             test_template.render().should.equal("a,b,c,d,e,f,g");
//         });
//         it('should work with arrays that do not require filling (with fill specified)', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f']|batch(3, 'x') }}"});
//             test_template.render().should.equal("a,b,c,d,e,f");
//         });
//         it('should work with arrays that do not require filling (without fill specified)', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd', 'e', 'f']|batch(3) }}"});
//             test_template.render().should.equal("a,b,c,d,e,f");
//         });
//         it('should return an empty result for an empty array', function () {
//             var test_template = twig({data: "{{ []|batch(3, 'x') }}"});
//             test_template.render().should.equal("");
//         });
//     });

//     describe('last ->', function () {
//         it('should return last character in string', function () {
//             var test_template = twig({data: "{{ 'abcd'|last }}"});
//             test_template.render().should.equal("d");
//         });
//         it('should return last item in array', function () {
//             var test_template = twig({data: "{{ ['a', 'b', 'c', 'd']|last }}"});
//             test_template.render().should.equal("d");
//         });
//         it('should return last item in a sorted object', function () {
//             var test_template = twig({data: "{{ {'m':1, 'z':5, 'a':3}|sort|last }}" });
//             test_template.render().should.equal("5");
//         });
//     });

//     describe('raw ->', function () {
//         it('should output the raw value if autoescape is on', function () {
//             var template = twig({
//                 autoescape: true,
//                 data: '{{ value|raw }}'
//             });
//             template.render({
//                 value: "<test>&</test>"
//             }).should.equal('<test>&</test>');
//         });

//         it('should output the raw value if autoescape is off', function () {
//             var template = twig({
//                 autoescape: false,
//                 data: '{{ value|raw }}'
//             });
//             template.render({
//                 value: "<test>&</test>"
//             }).should.equal('<test>&</test>');
//         });
//     });

//     describe('round ->', function () {
//         it('should round up (common)', function () {
//             var test_template = twig({data: "{{ 2.7|round }}"});
//             test_template.render().should.equal("3");
//         });
//         it('should round down (common)', function () {
//             var test_template = twig({data: "{{ 2.1|round }}"});
//             test_template.render().should.equal("2");
//         });
//         it('should truncate input when input decimal places exceeds precision (floor)', function () {
//             var test_template = twig({data: "{{ 2.1234|round(3, 'floor') }}" });
//             test_template.render().should.equal("2.123");
//         });
//         it('should round up (ceil)', function () {
//             var test_template = twig({data: "{{ 2.1|round(0, 'ceil') }}" });
//             test_template.render().should.equal("3");
//         });
//         it('should truncate precision when a negative precision is passed (common)', function () {
//             var test_template = twig({data: "{{ 21.3|round(-1)}}" });
//             test_template.render().should.equal("20");
//         });
//         it('should round up and truncate precision when a negative precision is passed (ceil)', function () {
//             var test_template = twig({data: "{{ 21.3|round(-1, 'ceil')}}" });
//             test_template.render().should.equal("30");
//         });
//         it('should round down and truncate precision when a negative precision is passed (floor)', function () {
//             var test_template = twig({data: "{{ 21.3|round(-1, 'ceil')}}" });
//             test_template.render().should.equal("30");
//         });
//     });

//     it("should chain", function() {
//         var test_template = twig({data: '{{ ["a", "b", "c"]|keys|reverse }}' });
//         test_template.render().should.equal("2,1,0");
//     });
// });
