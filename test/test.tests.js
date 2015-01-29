var assert = require("assert");
var helpers = require('./helpers');

var params = {
  parser: GLOBAL.twig,
  compiler: GLOBAL.TwigCompiler,
  assert: assert,
  _twig: GLOBAL._twig
};

describe("Twig.js Tests ->", function () {
  describe("empty test ->", function() {
    it("should identify numbers as not empty", function() {
      // number
      helpers.assert(params, [
        '{{ 1 is empty }}',
        '{{ 0 is empty }}'
      ]);
    });

    it("should identify empty strings", function() {
      // String
      helpers.assert(params, [
        '{{ "" is empty }}',
        '{{ "test" is empty }}'
      ]);
    });

    it("should identify empty arrays", function() {
      // Array
      helpers.assert(params, [
        '{{ [] is empty }}',
        '{{ ["1"] is empty }}'
      ]);
    });

    it("should identify empty objects", function() {
      // Object
      helpers.assert(params, [
        '{{ {} is empty }}',
        '{{ {"a":"b"} is empty }}',
        '{{ {"a":"b"} is not empty }}'
      ]);
    });
  });

  describe("odd test ->", function() {
    it("should identify a number as odd", function() {
      helpers.assert(params, [
        '{{ (1 + 4) is odd }}',
        '{{ 6 is odd }}'
      ]);
    });
  });

  describe("even test ->", function() {
    it("should identify a number as even", function() {
      helpers.assert(params, [
        '{{ (1 + 4) is even }}',
        '{{ 6 is even }}'
      ]);
    });
  });

  describe("divisibleby test ->", function() {
    it("should determine if a number is divisible by the given number", function() {
      helpers.assert(params, [
        '{{ 5 is divisibleby(3) }}',
        '{{ 6 is divisibleby(3) }}'
      ]);
    });
  });

  describe("defined test ->", function() {
    it("should identify a key as defined if it exists in the render context", function() {
      helpers.assert(params, [
        '{{ key is defined }}',
        '{{ key is defined }}'
      ]);
    });
  });

  describe("none test ->", function() {
    it("should identify a key as none if it exists in the render context and is null", function() {
      helpers.assert(params, [
        '{{ key is none }}',
        {
          data: '{{ key is none }}',
          context: {key: "test"}
        },
        {
          data: '{{ key is none }}',
          context: {key: null}
        },
        {
          data: '{{ key is null }}',
          context: {key: null}
        }
      ]);
    });
  });

  describe("sameas test ->", function() {
    it("should identify the exact same type as true", function() {
      helpers.assert(params, [
        '{{ true is sameas(true) }}',
        // {
        //   data: '{{ a is sameas(1) }}',
        //   context: {a: 1}
        // },
        // {
        //   data: '{{ a is sameas("test") }}',
        //   context: {a: "test"}
        // },
        // {
        //   data: '{{ a is sameas(true) }}',
        //   context: {a: true}
        // }
      ]);
    });

    it("should identify the different types as false", function() {
      helpers.assert(params, [
        '{{ false is sameas(true) }}',
        '{{ true is sameas(1) }}',
        '{{ false is sameas("") }}',
        {
          data: '{{ a is sameas(1) }}',
          context: {a: "1"}
        }
      ]);
    });
  });
});


// describe("Twig.js Tests ->", function() {

// });
