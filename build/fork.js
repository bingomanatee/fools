(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require, exports, module);
    }
    else if (typeof define === 'function' && define.amd) {
        define('Fools', ['require', 'exports', 'module'], factory);
    }
    else {
        var req = function (id) {
                return root[id];
            },
            exp = root,
            mod = {exports: exp};
        root.Fools = factory(req, exp, mod);
    }
}(this, function (require, exports, module) {
    function fork(test, if_true, if_false, if_error) {

        var out = function Fork(input) {
            try {
                if (out.test.call(out, input)) {

                }
            }
            catch (err) {
                if (out.if_error) {
                    if_error.call(out, err);
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
        }

        out.err = function(fn)
        {
            out.if_error = fn;
            return out;
        }

        return out;

    }

    return Fork;
}));
