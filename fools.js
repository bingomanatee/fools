
(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('underscore'), require, exports, module);
    }
    else if(typeof define === 'function' && define.amd) {
        define('Fools', ['_', 'require', 'exports', 'module'], factory);
    }
    else {
        var req = function(id) {return root[id];},
            exp = root,
            mod = {exports: exp};
        root.Fools = factory(root._, req, exp, mod);
    }
}(this, function(_, require, exports, module) {
var Fools = {
    util: {
        math: {
              sum: function(){
                  var args = _.filter(_.toArray(arguments), _isNumber);
                  return _.reduce(args, function(o, v){ return o + v}, 0);
              }
        },
        add: {
            last: function (out) {
                out.last = function (fn) {
                    out.last_fn = fn;
                    return out;
                }
            },

            run: function (out) {
                out.run = function (input, pipe) {
                    var output = out(input);
                    if (pipe) {
                        pipe(output);
                    }
                    return out;
                }
            },

            err: function (out) {
                out.err = function (fn) {
                    out.if_error = fn;
                    return out;
                }
            },

            add: function (out) {
                out.add = function (test) {
                    out.tests.push(test);
                    return out;
                };
                return out;
            }
        }
    }
};


function range() {

    var out = function Range(input) {
        var value = out.filter ? out.filter(input) : input;

        try {
            if (value < out.brackets[0]) {
                if (out.min) {
                    return typeof(out.min) == 'function' ? out.min(value, input) : out.min
                } else {
                    var error = new Error('below minimum bracket');
                    error.data = input;
                    error.value = value;
                    throw error;
                }
            } else if (value >= out.brackets[out.brackets.length - 1] && out.max) {
                return typeof(out.max) == 'function' ? out.max(value, input) : value;
            } else {
                for (var i = 0; i < out.brackets.length; ++i) {
                    var bracket_value = out.brackets[i];
                    var next_bracket = out.brackets[i + 1];
                    if ((value < next_bracket) && (value >= bracket_value )) {
                        var result = _.last(_.compact(out.outcomes.slice(0, i + 1)));
                        if (typeof result == 'function') {
                            return result(value, input, bracket_value, next_bracket);
                        } else {
                            return result;
                        }
                    }
                }

                var range_error = new Error('No brackedted result found');
                range_error.value = value;
                range_error.input = input;
                throw range_error;
            }
        }
        catch (err) {
            if (out.if_error) {
                return out.if_error(err)
            } else {
                throw err;
            }
        }

    };

    out.outcomes = [];
    out.brackets = [];

    out.add = function (value, outcome) {
        out.brackets.push(value);
        out.outcomes.push(outcome);
        return out;
    };

    out.add_min = function (outcome) {
        out.min = outcome;
        return out;
    };

    out.add_max = function (outcome) {
        out.max = outcome;
        return out;
    };

    out.filter = function (filter) {
        out.filter = filter;
        return out;
    };

    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.range = range;
function all() {

    var out = function All(input) {
        var errors = [];
        var output = [];

        for (var i = 0; ( i < out.tests.length); ++i) {
            try {
                output.push(out.tests[i](input));
            }
            catch (err) {
                output.push([null, err]);
                errors.push(err);
            }
        }

        try {
            if (out.last_fn) {
                output.push(out.last_fn(input));
            }
        }
        catch (err) {
            errors.push(err);
        }

        if (errors.length) {
            var error = new Error('error in all');
            error.data = errors;
            if (out.if_error) {
                out.if_error(error);
            } else {
                throw error;
            }
        }
        return output;
    };

    out.tests = [];

    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    Fools.util.add.run(out);
    Fools.util.add.err(out);
    Fools.util.add.last(out);
    Fools.util.add.add(out);
    return out;
}

Fools.all = all;
function pipe() {

    var out = function Pipe(input) {

        for (var i = 0; ( i < out.tests.length); ++i) {
            try {
                input = out.tests[i](input);
            }
            catch (err) {
                if (out.if_error) {
                    out.if_error(err);
                } else {
                    throw err;
                }
            }
        }

        return input;
    };

    out.tests = [];

    Fools.util.add.run(out);
    Fools.util.add.err(out);
    Fools.util.add.last(out);
    Fools.util.add.add(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.pipe = pipe;
function until() {

    var out = function Until(input) {
        var result = null;
        var i;
        for (i = 0; (!result) && ( i < out.tests.length); ++i) {
            try {
                result = out.tests[i](input);
                if (result) return i;
            }
            catch (err) {
                if (out.if_error) {
                    result = out.if_error.call(out, err, input);
                } else {
                    throw err;
                }
            }
        }

        if (!result) {
            try {
                if (!out.if_last || !out.if_last(input)) {
                    error = new Error('no handler for data');
                    error.data = input;
                    throw error;
                }
            }
            catch (err) {
                if (err.message == 'no handler for data') {
                    throw err;
                } else if (out.if_error) {
                    out.if_error(err);
                } else {
                    throw err;
                }
            }
        }
        return i;
    };

    out.tests = [];

    Fools.util.add.add(out);
    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.until = until;
function loop(iterator) {

    var out = function (memo) {
        var dims = [];
        var args = _.toArray(arguments);

        if (args.length < 2) {
            dims = _.keys(out.dims);
        } else {
            _.each(args.slice(1), function (dim) {
                if (out.dims.hasOwnProperty(dim)) {
                    dims.push(dim);
                }
            });
        }

        var iterator = {};
        _.each(dims, function (dim) {
            iterator[dim] = _min(dim);
        });

        var done = false;

        while (!done) {
            memo = out.iterator(iterator, memo, out);

            var dim_index = 0;
            var next = false;
            while ((!next) && (dim_index < dims.length)) {
                var dim = dims[dim_index];
                if (iterator[dim] < _max(dim, iterator)) {
                    ++iterator[dim];
                    next = true;
                } else {
                    iterator[dim] = _min(dim, iterator);
                    ++dim_index;
                }
            }
            done = !next;
        }

        return memo;
    };

    out.place = Fools.fork(function(dim, iterator){
      //  console.log('_min %s: %s, iterator %s', dim, _min(dim, iterator), iterator[dim]);
        return _min(dim, iterator) == iterator[dim];
    }).then('first').else(Fools.fork(function(dim, iterator){
            return _max(dim, iterator) == iterator[dim];
        }).then('last').else('middle'));

    function _min(dim, iterator){
        if (typeof(dim)!= 'string'){
            throw new Error(require('util').format(
                'non string dim passed to min: %s,', require('util').inspect(dim)));
        }
        return typeof(out.dims[dim].min) == 'function' ? out.dims[dim].min(iterator) : out.dims[dim].min;
    }
    function _max(dim, iterator){
        return typeof(out.dims[dim].max) == 'function' ? out.dims[dim].max(iterator) : out.dims[dim].max;
    }

    out.dims = {};

    out.iterator = iterator;

    out.dim = function (name, min, max) {
        if (!out.dims[name]) {
            out.dims[name] = {min: 0, max: 0};
        }

        out._last_dim = name;
        return out;
    };

    out.max = function (max, dim) {
        if (!dim) {
            dim = out._last_dim;
        } else {
            out._last_dim = dim;
        }

        out.dim(dim).dims[dim].max = max;

        return out;
    };

    out.min = function (min, dim) {
        if (!dim) {
            dim = out._last_dim;
        } else {
            out._last_dim = dim;
        }

        out.dim(dim).dims[dim].min = min;

        return out;
    };

    return out;
};

Fools.loop = loop;
function fork(test, if_true, if_false, if_error) {

    var out = function Fork() {
        var args = Array.prototype.slice.call( arguments);
        try {
            if (out.test.apply(out, args)) {
                return typeof(out.if_true) == 'function' ? out.if_true.apply(out, args) : out.if_true;
            } else {
                return typeof(out.if_false) == 'function' ? out.if_false.apply(out, args) : out.if_false;
            }
        } catch (err) {
            if (out.if_error) {
                return out.if_error.call(out, err);
            } else {
                throw err;
            }
        }

    };

    out.test = test;
    out.if_true = if_true;
    out.if_false = if_false;
    out.if_error = if_error;

    out.then = function (fn) {
        out.if_true = fn;
        return out;
    };

    out.else = function (fn) {
        out.if_false = fn;
        return out;
    };

    Fools.util.add.run(out);
    Fools.util.add.err(out);

    return out;

}

Fools.fork = fork;
return Fools;
}));
