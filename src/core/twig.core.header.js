//  Twig.core.header.js
//  Copyright (c) 2011-2013 John Roepke
//  Available under the BSD 2-Clause License
//  https://github.com/justjohn/twig.js
//  https://github.com/egych/twig.compiler.js
  var Twig = {};

  Twig.Markup = function(content) {
      if (typeof content === 'string' && content.length > 0) {
          content = new String(content);
          content.twig_markup = true;
      }
      return content;
  };
