function all() {

    var out = function Until(input) {
        try {
            out.do(input);
        }
        catch (err) {
            if (out.if_error) {
                out.if_error.call(out, err);
            } else {
                throw err;
            }
        }
        return out;
    };

    out.tests = [];

    out.add = function (test) {
        out.tests.push(test);
        return out;
    };

    out.err = function (fn) {
        out.if_error = fn;
        return out;
    };

    out.last = function (fn) {
        out.if_last = fn;
        return out;
    }

    out.do = function (input) {
        var errors = [];
        try {
            for (var i = 0;  ( i < out.tests.length); ++i){
                out.tests[i](input);
            }
        }
        catch (err) {
            errors.push(err);
        }
        if (errors.length){
            var error = new Error('error in all');
            error.data = errors;
            if (out.if_error){
                out.if_error(error);
            } else {
                throw error;
            }
        }
    };


    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.all = all;