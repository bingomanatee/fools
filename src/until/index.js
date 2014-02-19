function until() {

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


    out.do = function (input) {
        var result = null;
        try {
            for (var i = 0; (!result) && ( i < out.tests.length); ++i) {
                result = out.tests[i](input);
            }
        }
        catch (err) {
            console.log('until error: ', err);
            if (out.if_error) {
                out.if_error.call(out, err);
                result = true;
            } else {
                throw err;
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
    };

    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.until = until;