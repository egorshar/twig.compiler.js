// twig deps
GLOBAL.Twig = require("../twig.js/twig");
GLOBAL._twig = require('../twig.deps');
GLOBAL.TwigCompiler = require("../twig.compiler");
GLOBAL.twig = Twig.twig;

require('./test.core');
require('./test.expressions');
require('./test.filters');
// require('./test.functions');
require('./test.regression');
require('./test.tags');
require('./test.tests');
