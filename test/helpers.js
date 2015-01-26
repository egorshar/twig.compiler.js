module.exports = {
  fn: function (fn_str) {
    return Function.apply(null, ['ctx', '_twig', fn_str + 'return t(ctx||{})']);
  },

  assert: function (params/* assert*/, templates, contexts) {
    var tmpl, precompiled, compiled, context;

    while (templates.length) {
      tmpl = templates.shift();

      if (typeof tmpl == 'string') {
        tmpl = {
          data: tmpl,
          context: {}
        };
      }

      precompiled = params.parser({data: tmpl.data});
      compiled = this.fn(params.compiler.toJS(precompiled));

      params.assert.equal(precompiled.render(tmpl.context), compiled(tmpl.context, params._twig));
    }
  }
};
