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