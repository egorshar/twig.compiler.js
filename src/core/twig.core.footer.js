  Twig.lib.capitalize = function (value) {
    return (value||'').toString().substr(0, 1).toUpperCase() + value.substr(1);
  };

  Twig.lib.key = function (object, key) {
    var value = null,
        capitalizedKey = Twig.lib.capitalize(key);

    if (typeof object === 'object' && key in object) {
      value = object[key];
    } else if (object["get" + capitalizedKey] !== undefined) {
      value = object["get" + capitalizedKey];
    } else if (object["is" + capitalizedKey] !== undefined) {
      value = object["is" + capitalizedKey];
    }

    if (typeof value === 'function') {
      value = value();
    }

    return value;
  };
