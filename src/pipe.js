function pipe() {

    var out = function Pipe() {
        var input = _.toArray(arguments);
        for (var i = 0; ( i < out.tests.length); ++i) {
            try {
                input = i ? out.tests[i](input) : out.tests[i].apply(out.tests[i], input)
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