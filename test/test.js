// twig deps
GLOBAL.Twig = require("../node_modules/twig/twig");
GLOBAL._twig = require('../twig.deps');
GLOBAL.TwigCompiler = require("../twig.compiler");
GLOBAL.twig = Twig.twig;

require('./test.core');
require('./test.expressions');
require('./test.filters');
