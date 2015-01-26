// twig deps
GLOBAL.Twig = require("Twig");
GLOBAL._twig = require('../twig.deps');
GLOBAL.TwigCompiler = require("../twig.compiler");
GLOBAL.twig = Twig.twig;

require('./test.core');
require('./test.expressions');
require('./test.filters');
