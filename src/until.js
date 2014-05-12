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