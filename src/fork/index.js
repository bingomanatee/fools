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