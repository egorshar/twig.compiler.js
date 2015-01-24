  // Provide a CommonJS/AMD module export.
  if (typeof define == 'function' && define.amd) {
      define(function() {
          return Twig;
      });
  } else if (typeof module !== 'undefined' && module.exports) {
      // Provide a CommonJS Modules/1.1 module
      module.exports = Twig;
  } else {
    // Export for browser use
    window._twig = Twig;
  }
}(this));
