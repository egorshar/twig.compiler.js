var base_dir = __dirname + '/../';

module.exports = {
  wrapper: function (export_var, import_var) {
    var module_str;

    export_var = export_var === undefined ? 'Twig' : export_var;
    import_var = import_var === undefined ? 'Twig' : import_var;

    module_str = '\
  if (typeof define == \'function\' && define.amd) {\n\
    define(function() {\n\
      return Twig;\n\
    });\n\
  } else if (typeof module !== \'undefined\' && module.exports) {\n\
    // Provide a CommonJS Modules/1.1 module\n\
    module.exports = Twig;\n\
  } else {\n\
    // Export for browser use\n\
    global.' + export_var + ' = Twig;\n\
  }';

    return '(function (global, Twig) {\n' + module_str + '\n}(this, function (' + import_var + ') {\n<%= contents %>\nreturn Twig;\n}(' + import_var + ')));';
  },

  src: {
    file_name: 'twig.compiler.js',
    src: [
      base_dir + 'src/twig.compiler.helpers.js',
      base_dir + 'src/twig.compiler.expression.js',
      base_dir + 'src/twig.compiler.operator.js',
      base_dir + 'src/twig.compiler.logic.js',
      base_dir + 'src/twig.compiler.js'
    ],
    dest: base_dir
  },

  _twig: {
    file_name: 'twig.deps.js',
    src: [
      base_dir + 'src/core/twig.core.header.js',
      base_dir + 'twig.js/src/twig.lib.js',
      base_dir + 'twig.js/src/twig.filters.js',
      base_dir + 'twig.js/src/twig.functions.js',
      base_dir + 'twig.js/src/twig.tests.js',
      base_dir + 'src/core/twig.core.footer.js'
    ],
    dest: base_dir
  }
};
