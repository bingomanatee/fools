function each() {

    var out = function Each(input) {
        var errors = [];
        var result = true;

        for (var i = 0; (result && (!errors.length)) && ( i < out.tests.length); ++i) {
            try {
                if (!out.tests[i](input)) {
                    result = false;
                }
            } catch (err) {
                errors.push(err);
            }
        }

        try {
            if (result && (!errors.length) && out.last_fn) {
                if (!out.last_fn(input)) {
                    result = false;
                }
            }
        } catch (err) {
            errors.push(err);
        }

        if (errors.length) {
            var error = new Error('error in each');
            error.data = errors;
            if (out.if_error) {
                out.if_error(error);
            } else {
                throw error;
            }
        }
        return result;
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

Fools.each = each;
